function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

// Compute medication start date from weeks on medication
function weeksAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n * 7)
  return d.toISOString().split('T')[0]
}

const patientsData = [
  { id: 'sarah-chen', name: 'Sarah Chen', diagnosis: 'Major Depressive Disorder', age: 34, doctor: 'Dr. Kamini', next_appointment: '2026-03-28' },
  { id: 'james-lim', name: 'James Lim', diagnosis: 'Generalised Anxiety Disorder', age: 28, doctor: 'Dr. Kamini', next_appointment: '2026-04-02' },
  { id: 'priya-nair', name: 'Priya Nair', diagnosis: 'Bipolar II — Depressive Episode', age: 41, doctor: 'Dr. Kamini', next_appointment: '2026-03-25' },
]

const medicationsData = [
  { patient_id: 'sarah-chen', name: 'Sertraline', dosage: '100mg', started_at: weeksAgo(6) },
  { patient_id: 'james-lim', name: 'Escitalopram', dosage: '10mg', started_at: weeksAgo(3) },
  { patient_id: 'priya-nair', name: 'Lamotrigine', dosage: '200mg', started_at: weeksAgo(10) },
]

const entriesData = {
  'sarah-chen': [
    { days: 0, mood: 4, sleep: 5, energy: 4, note: 'Went for a 30-min walk with a colleague after work. Felt lighter afterwards. Managed to cook dinner instead of ordering in.' },
    { days: 1, mood: 4, sleep: 4, energy: 3, note: 'Busy day at work but handled it okay. Noticed I didn\'t dread the morning commute like I used to.' },
    { days: 2, mood: 5, sleep: 4, energy: 4, note: 'First day I genuinely felt like myself in months. Laughed at something on TV and it felt real, not forced.' },
    { days: 3, mood: 4, sleep: 5, energy: 4, note: '' },
    { days: 4, mood: 4, sleep: 4, energy: 3, note: 'Started jogging again — just 15 mins but it felt good. Work project deadline next week but I feel prepared.' },
    { days: 5, mood: 3, sleep: 3, energy: 3, note: 'Flat day. Not bad, just neutral. Skipped the gym. Had a disagreement with a friend but resolved it over text.' },
    { days: 6, mood: 4, sleep: 4, energy: 4, note: '' },
    { days: 7, mood: 3, sleep: 5, energy: 3, note: 'Slept well but still felt tired during the day. Wondering if that\'s the medication or just a long week at work.' },
    { days: 8, mood: 3, sleep: 3, energy: 2, note: 'Struggled to focus at work. Left early. Napped for 2 hours when I got home.' },
    { days: 9, mood: 4, sleep: 4, energy: 3, note: '' },
    { days: 10, mood: 3, sleep: 3, energy: 3, note: 'Weekend was quiet. Stayed in mostly. Called my mum which was nice.' },
    { days: 11, mood: 3, sleep: 4, energy: 3, note: 'Nausea from the medication seems to be easing. Appetite is coming back. Ate three proper meals today.' },
    { days: 12, mood: 2, sleep: 3, energy: 2, note: 'Rough day. Cried in the bathroom at work. Manager asked if I was okay — said I was fine.' },
    { days: 13, mood: 3, sleep: 3, energy: 3, note: '' },
    { days: 14, mood: 2, sleep: 2, energy: 2, note: 'Hard week. Brain fog all day. Couldn\'t remember simple things at work. Worried colleagues are noticing.' },
  ],
  'james-lim': [
    { days: 0, mood: 3, sleep: 3, energy: 3, note: 'Practiced breathing exercises before bed. Took a while to fall asleep but stayed asleep longer than usual.' },
    { days: 1, mood: 3, sleep: 4, energy: 3, note: 'Work stress was there but manageable. Used the grounding technique Dr. Kamini suggested during a tense meeting.' },
    { days: 2, mood: 3, sleep: 3, energy: 3, note: '' },
    { days: 3, mood: 4, sleep: 3, energy: 3, note: 'Good day — finished a project ahead of deadline. Felt a sense of accomplishment I haven\'t had in a while.' },
    { days: 4, mood: 3, sleep: 3, energy: 2, note: 'Big presentation tomorrow. Spent the evening rehearsing. Heart was racing just thinking about it. Took a long shower to calm down.' },
    { days: 5, mood: 3, sleep: 2, energy: 2, note: 'Barely slept before the presentation. It went okay but I spiralled afterwards replaying everything I said wrong.' },
    { days: 6, mood: 3, sleep: 3, energy: 3, note: 'Recovery day. Went for a swim which helped. The post-event anxiety is fading.' },
    { days: 7, mood: 3, sleep: 3, energy: 3, note: '' },
  ],
  'priya-nair': [
    { days: 3, mood: 2, sleep: 2, energy: 1, note: 'Couldn\'t get out of bed until 2pm. Called in sick to work. Haven\'t showered in two days. Everything feels pointless.' },
    { days: 4, mood: 2, sleep: 1, energy: 2, note: 'Woke up at 3am and couldn\'t fall back asleep. Mind was racing with worst-case scenarios about work and finances.' },
    { days: 5, mood: 3, sleep: 3, energy: 2, note: 'Managed to go to work but left early. Colleagues asked if I was okay — felt embarrassed.' },
    { days: 6, mood: 3, sleep: 3, energy: 3, note: '' },
    { days: 7, mood: 4, sleep: 4, energy: 3, note: 'Had coffee with my sister. She noticed I seemed off. It helped to talk even though I didn\'t share everything.' },
    { days: 8, mood: 4, sleep: 4, energy: 4, note: 'Good day. Got a lot done at work. Went grocery shopping and cooked a proper meal. Felt almost normal.' },
    { days: 9, mood: 3, sleep: 3, energy: 3, note: '' },
    { days: 10, mood: 4, sleep: 4, energy: 3, note: 'Quiet weekend. Watched a movie, did some laundry. Small things but they felt like wins.' },
  ],
}

const summariesData = [
  { patient_id: 'sarah-chen', content: JSON.stringify({ summary: 'Consistent improvement in mood and sleep quality over the past two weeks. Energy levels have stabilised. Patient reported feeling motivated to resume jogging. No missed check-ins in 14 days.', compositeInterpretation: 'Score of 7.2 reflects steady upward trajectory since starting Sertraline, with mood leading the improvement.', concerns: [], positives: ['Consistent check-in engagement', 'Resuming physical activity', 'Mood trending upward'], suggestedFocus: 'Explore whether the patient feels ready to discuss tapering or maintaining current dosage.' }), composite_score: 7.2 },
  { patient_id: 'james-lim', content: JSON.stringify({ summary: 'Mood and energy levels relatively stable. Sleep quality variable — correlates with reported work stress. Anxiety symptoms persist but are not worsening. Patient engaging consistently with check-ins.', compositeInterpretation: 'Score of 5.0 indicates stable but sub-optimal state. Anxiety management appears functional but sleep quality is the weakest dimension.', concerns: ['Sleep quality variable, linked to work stress'], positives: ['Consistent engagement', 'Anxiety not escalating'], suggestedFocus: 'Consider exploring sleep hygiene practices and work-related anxiety triggers.' }), composite_score: 5.0 },
  { patient_id: 'priya-nair', content: JSON.stringify({ summary: 'Significant decline in mood and energy over the past 3 days after a relatively stable period. Sleep quality deteriorated. Patient missed 3 consecutive check-ins before the decline entries. Last note expressed difficulty getting out of bed. Recommend urgent review.', compositeInterpretation: 'Score of 2.8 represents a sharp drop from the prior week average of 6.1. This pattern is consistent with a depressive episode onset.', concerns: ['Sharp decline across all dimensions', 'Missed check-ins preceding decline', 'Patient reporting difficulty with basic functioning'], positives: [], suggestedFocus: 'Urgent review recommended — assess for depressive episode escalation and medication efficacy.' }), composite_score: 2.8, alert_triggered: 1, alert_reasons: 'trend_decline,severity_threshold' },
]

const alertsData = [
  { patient_id: 'priya-nair', type: 'severity_threshold', message: 'Energy score dropped to 1 (Very Low). Patient reported difficulty getting out of bed.' },
  { patient_id: 'priya-nair', type: 'trend_decline', message: 'Composite trend declined by -1.6 over the past 6 days.' },
]

export function seed(db) {
  const insertPatient = db.prepare('INSERT OR REPLACE INTO patients (id, name, diagnosis, age, doctor, next_appointment) VALUES (?, ?, ?, ?, ?, ?)')
  const insertEntry = db.prepare('INSERT OR REPLACE INTO entries (patient_id, date, mood, sleep, energy, note) VALUES (?, ?, ?, ?, ?, ?)')
  const insertMed = db.prepare('INSERT OR REPLACE INTO medications (patient_id, name, dosage, started_at) VALUES (?, ?, ?, ?)')
  const insertSummary = db.prepare('INSERT INTO summaries (patient_id, content, composite_score, alert_triggered, alert_reasons) VALUES (?, ?, ?, ?, ?)')
  const insertAlert = db.prepare('INSERT INTO alerts (patient_id, type, message) VALUES (?, ?, ?)')

  const transaction = db.transaction(() => {
    for (const p of patientsData) {
      insertPatient.run(p.id, p.name, p.diagnosis, p.age, p.doctor, p.next_appointment)
    }

    for (const [patientId, entries] of Object.entries(entriesData)) {
      for (const e of entries) {
        insertEntry.run(patientId, daysAgo(e.days), e.mood, e.sleep, e.energy, e.note)
      }
    }

    for (const m of medicationsData) {
      insertMed.run(m.patient_id, m.name, m.dosage, m.started_at)
    }

    for (const s of summariesData) {
      insertSummary.run(s.patient_id, s.content, s.composite_score, s.alert_triggered || 0, s.alert_reasons || null)
    }

    for (const a of alertsData) {
      insertAlert.run(a.patient_id, a.type, a.message)
    }
  })

  transaction()
}

// Allow running directly: node db/seed.js
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  const { initDb } = await import('./index.js')
  const db = initDb()
  console.log('Seed complete.')
  db.close()
}
