const SYSTEM_PROMPT = `You are a clinical decision-support tool for mental health professionals. You analyze patient self-reported check-in data and produce concise clinical summaries.

IMPORTANT CONSTRAINTS:
- You are NOT providing diagnoses or treatment recommendations
- You are summarizing patient-reported data to help clinicians prepare for appointments
- Use neutral, clinical language
- Note patterns and changes, not judgments
- Flag concerning trends factually, without alarm language
- Never use language that could be interpreted as a diagnosis

OUTPUT FORMAT:
Return ONLY a valid JSON object with exactly these fields (no markdown, no code fences):
{
  "summary": "2-4 sentence clinical summary of recent trends",
  "compositeInterpretation": "One sentence interpreting the composite score in clinical context",
  "concerns": ["array of specific concerns if any, empty array if none"],
  "positives": ["array of positive trends if any, empty array if none"],
  "suggestedFocus": "One sentence suggesting what the clinician might want to explore"
}`

function buildContext(db, patientId) {
  const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(patientId)
  const entries = db.prepare('SELECT * FROM entries WHERE patient_id = ? ORDER BY date DESC LIMIT 14').all(patientId)
  const activeMed = db.prepare('SELECT * FROM medications WHERE patient_id = ? AND ended_at IS NULL ORDER BY started_at DESC LIMIT 1').get(patientId)
  const activeAlerts = db.prepare('SELECT * FROM alerts WHERE patient_id = ? AND resolved = 0').all(patientId)
  const previousSummary = db.prepare('SELECT content FROM summaries WHERE patient_id = ? ORDER BY created_at DESC LIMIT 1').get(patientId)

  if (!patient || entries.length === 0) return null

  // Compute algorithmic scores
  const latest = entries[0]
  const compositeRaw = latest.mood + latest.sleep + latest.energy // 3-15
  const compositeNormalized = +((compositeRaw - 3) / 12 * 10).toFixed(1) // 0-10

  let trend = 0
  if (entries.length >= 6) {
    const recent = entries.slice(0, 3)
    const prior = entries.slice(3, 6)
    const avg = arr => arr.reduce((s, e) => s + (e.mood + e.sleep + e.energy) / 3, 0) / arr.length
    trend = +(avg(recent) - avg(prior)).toFixed(1)
  }

  // Count streak
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    if (entries.some(e => e.date === dateStr)) streak++
    else { if (i === 0) continue; break }
  }

  let medWeek = null
  if (activeMed) {
    medWeek = Math.floor((Date.now() - new Date(activeMed.started_at).getTime()) / (7 * 24 * 60 * 60 * 1000))
  }

  // Format entries as table
  const entryTable = entries.map(e =>
    `${e.date} | mood:${e.mood} sleep:${e.sleep} energy:${e.energy}${e.note ? ` | "${e.note}"` : ''}`
  ).join('\n')

  const prevContent = previousSummary ? JSON.parse(previousSummary.content).summary : 'First summary'

  return {
    compositeNormalized,
    message: `Patient: ${patient.name}, ${patient.age}y, ${patient.diagnosis}
Current medication: ${activeMed ? `${activeMed.name} ${activeMed.dosage} (week ${medWeek})` : 'None recorded'}

Last ${entries.length} days of check-ins (1=lowest, 5=highest):
${entryTable}

Algorithmic composite score: ${compositeNormalized}/10 (latest entry: mood ${latest.mood}, sleep ${latest.sleep}, energy ${latest.energy})
Trend score: ${trend > 0 ? '+' : ''}${trend} (positive = improving, negative = declining)
Current streak: ${streak} consecutive days
Active alerts: ${activeAlerts.length > 0 ? activeAlerts.map(a => a.message).join('; ') : 'None'}

Previous summary (for continuity): ${prevContent}`
  }
}

export async function generateSummary(db, patientId, entryId) {
  const context = buildContext(db, patientId)
  if (!context) return

  if (!process.env.ANTHROPIC_API_KEY) {
    // Store algorithmic-only fallback
    const fallback = {
      summary: `Auto-summary unavailable (API key not configured). Composite score: ${context.compositeNormalized}/10.`,
      compositeInterpretation: '',
      concerns: [],
      positives: [],
      suggestedFocus: ''
    }
    db.prepare('INSERT INTO summaries (patient_id, entry_id, content, composite_score) VALUES (?, ?, ?, ?)')
      .run(patientId, entryId, JSON.stringify(fallback), context.compositeNormalized)
    return
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 512,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: context.message }]
      })
    })

    if (!response.ok) {
      throw new Error(`Anthropic API ${response.status}`)
    }

    const data = await response.json()
    const text = data.content[0].text

    // Parse JSON response, stripping any markdown fences
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)

    // Check if any alerts should be noted
    const alertEntries = db.prepare(
      "SELECT COUNT(*) as c FROM alerts WHERE patient_id = ? AND resolved = 0"
    ).get(patientId)

    db.prepare(
      'INSERT INTO summaries (patient_id, entry_id, content, composite_score, alert_triggered, alert_reasons) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(
      patientId,
      entryId,
      JSON.stringify(parsed),
      context.compositeNormalized,
      alertEntries.c > 0 ? 1 : 0,
      parsed.concerns.length > 0 ? parsed.concerns.join('; ') : null
    )

    console.log(`Summary generated for ${patientId}: score ${context.compositeNormalized}`)
  } catch (err) {
    console.error(`Summary generation failed for ${patientId}:`, err.message)

    // Fallback: store algorithmic-only summary
    const fallback = {
      summary: `Auto-summary temporarily unavailable. Composite score: ${context.compositeNormalized}/10.`,
      compositeInterpretation: '',
      concerns: [],
      positives: [],
      suggestedFocus: ''
    }
    db.prepare('INSERT INTO summaries (patient_id, entry_id, content, composite_score) VALUES (?, ?, ?, ?)')
      .run(patientId, entryId, JSON.stringify(fallback), context.compositeNormalized)
  }
}
