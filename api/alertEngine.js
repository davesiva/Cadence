export function evaluateAlerts(db, patientId) {
  const entries = db.prepare(
    'SELECT * FROM entries WHERE patient_id = ? ORDER BY date DESC LIMIT 14'
  ).all(patientId)

  const newAlerts = []

  if (entries.length === 0) return newAlerts

  const latest = entries[0]

  // 1. Severity threshold: any score is 1, or composite avg < 2.0
  const composite = (latest.mood + latest.sleep + latest.energy) / 3
  if (latest.mood === 1 || latest.sleep === 1 || latest.energy === 1 || composite < 2.0) {
    const dimensions = []
    if (latest.mood === 1) dimensions.push('Mood')
    if (latest.sleep === 1) dimensions.push('Sleep')
    if (latest.energy === 1) dimensions.push('Energy')
    const msg = dimensions.length > 0
      ? `${dimensions.join(' and ')} score dropped to 1 (lowest).${latest.note ? ` Patient noted: "${latest.note}"` : ''}`
      : `Composite score of ${composite.toFixed(1)} is critically low.`

    // Only insert if no similar unresolved alert exists recently
    const existing = db.prepare(
      "SELECT id FROM alerts WHERE patient_id = ? AND type = 'severity_threshold' AND resolved = 0 AND created_at > datetime('now', '-3 days')"
    ).get(patientId)

    if (!existing) {
      db.prepare('INSERT INTO alerts (patient_id, type, message) VALUES (?, ?, ?)').run(patientId, 'severity_threshold', msg)
      newAlerts.push({ type: 'severity_threshold', message: msg })
    }
  }

  // 2. Trend decline: trend below -1.0 (needs 6+ entries)
  if (entries.length >= 6) {
    const recent = entries.slice(0, 3)
    const prior = entries.slice(3, 6)
    const avg = arr => arr.reduce((s, e) => s + (e.mood + e.sleep + e.energy) / 3, 0) / arr.length
    const trend = +(avg(recent) - avg(prior)).toFixed(1)

    if (trend < -1.0) {
      const existing = db.prepare(
        "SELECT id FROM alerts WHERE patient_id = ? AND type = 'trend_decline' AND resolved = 0 AND created_at > datetime('now', '-3 days')"
      ).get(patientId)

      if (!existing) {
        const msg = `Composite trend declined by ${trend} over the past 6 days.`
        db.prepare('INSERT INTO alerts (patient_id, type, message) VALUES (?, ?, ?)').run(patientId, 'trend_decline', msg)
        newAlerts.push({ type: 'trend_decline', message: msg })
      }
    }
  }

  // 3. Streak broken: had 3+ day streak, now missed a day
  if (entries.length >= 3) {
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    // Check if yesterday is missing but there was a streak before
    const hasYesterday = entries.some(e => e.date === yesterdayStr)
    const hasToday = entries.some(e => e.date === today)

    if (!hasYesterday && !hasToday) {
      // Count streak ending at 2 days ago
      let streak = 0
      const twoDaysAgo = new Date()
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
      for (let i = 0; i < 30; i++) {
        const d = new Date(twoDaysAgo)
        d.setDate(twoDaysAgo.getDate() - i)
        const dateStr = d.toISOString().split('T')[0]
        if (entries.some(e => e.date === dateStr)) streak++
        else break
      }

      if (streak >= 3) {
        const existing = db.prepare(
          "SELECT id FROM alerts WHERE patient_id = ? AND type = 'streak_broken' AND resolved = 0 AND created_at > datetime('now', '-3 days')"
        ).get(patientId)

        if (!existing) {
          const msg = `Patient broke a ${streak}-day check-in streak. No check-in for 2+ days.`
          db.prepare('INSERT INTO alerts (patient_id, type, message) VALUES (?, ?, ?)').run(patientId, 'streak_broken', msg)
          newAlerts.push({ type: 'streak_broken', message: msg })
        }
      }
    }
  }

  return newAlerts
}
