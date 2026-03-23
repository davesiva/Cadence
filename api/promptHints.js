export function getJournalHint(db, patientId) {
  const entries = db.prepare(
    'SELECT * FROM entries WHERE patient_id = ? ORDER BY date DESC LIMIT 5'
  ).all(patientId)

  if (entries.length < 3) return 'Anything else on your mind?'

  const recent3 = entries.slice(0, 3)
  const avgMood = recent3.reduce((s, e) => s + e.mood, 0) / 3
  const avgSleep = recent3.reduce((s, e) => s + e.sleep, 0) / 3
  const avgEnergy = recent3.reduce((s, e) => s + e.energy, 0) / 3

  // Check for declining mood
  if (entries.length >= 3 && entries[0].mood < entries[1].mood && entries[1].mood < entries[2].mood) {
    return "What's been weighing on your mind lately?"
  }

  // Low sleep
  if (avgSleep <= 2.5) {
    return 'How has your sleep routine been? Anything different lately?'
  }

  // Low energy but okay mood
  if (avgEnergy <= 2.5 && avgMood >= 3) {
    return 'What activities have you been doing this week?'
  }

  // Everything improving
  if (entries.length >= 2 && entries[0].mood >= entries[1].mood && entries[0].sleep >= entries[1].sleep && entries[0].energy >= entries[1].energy) {
    return "What's been going well for you?"
  }

  return 'Anything else on your mind?'
}
