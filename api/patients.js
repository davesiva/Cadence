import { Router } from 'express'

function computeTrend(entries) {
  if (entries.length < 6) return 0
  const recent = entries.slice(0, 3)
  const prior = entries.slice(3, 6)
  const avg = arr => arr.reduce((s, e) => s + (e.mood + e.sleep + e.energy) / 3, 0) / arr.length
  return +(avg(recent) - avg(prior)).toFixed(1)
}

function computeStreak(entries) {
  if (entries.length === 0) return 0
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    if (entries.some(e => e.date === dateStr)) {
      streak++
    } else {
      if (i === 0) continue
      break
    }
  }
  return streak
}

function relativeTime(dateStr) {
  if (!dateStr) return 'Never'
  const now = new Date()
  const then = new Date(dateStr + 'T23:59:59')
  const diffMs = now - then
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return '1 day ago'
  return `${diffDays} days ago`
}

export default function patientsRouter(db) {
  const router = Router()

  // List all patients with computed fields
  router.get('/', (req, res) => {
    const patients = db.prepare('SELECT * FROM patients ORDER BY name').all()

    const result = patients.map(p => {
      const entries = db.prepare('SELECT * FROM entries WHERE patient_id = ? ORDER BY date DESC').all(p.id)
      const activeMed = db.prepare('SELECT * FROM medications WHERE patient_id = ? AND ended_at IS NULL ORDER BY started_at DESC LIMIT 1').get(p.id)
      const alertCount = db.prepare('SELECT COUNT(*) as c FROM alerts WHERE patient_id = ? AND resolved = 0').get(p.id).c
      const latestSummary = db.prepare('SELECT * FROM summaries WHERE patient_id = ? ORDER BY created_at DESC LIMIT 1').get(p.id)

      const trend = computeTrend(entries)
      const streak = computeStreak(entries)
      const latestEntry = entries[0] || null

      let medWeek = null
      if (activeMed) {
        const started = new Date(activeMed.started_at)
        medWeek = Math.floor((Date.now() - started.getTime()) / (7 * 24 * 60 * 60 * 1000))
      }

      return {
        id: p.id,
        name: p.name,
        diagnosis: p.diagnosis,
        age: p.age,
        doctor: p.doctor,
        nextAppointment: p.next_appointment,
        medication: activeMed ? { name: activeMed.name, dosage: activeMed.dosage, weekNumber: medWeek } : null,
        latestEntry,
        trend,
        streak,
        lastCheckIn: relativeTime(latestEntry?.date),
        alertCount,
        alert: alertCount > 0,
        latestSummary: latestSummary ? { ...JSON.parse(latestSummary.content), compositeScore: latestSummary.composite_score, generatedAt: latestSummary.created_at } : null,
      }
    })

    // Sort: alerts first, then by trend ascending
    result.sort((a, b) => {
      if (a.alert && !b.alert) return -1
      if (!a.alert && b.alert) return 1
      return a.trend - b.trend
    })

    res.json(result)
  })

  // Single patient with full data
  router.get('/:id', (req, res) => {
    const patientId = req.params.id === 'self' ? (process.env.DEFAULT_PATIENT_ID || 'sarah-chen') : req.params.id
    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(patientId)
    if (!patient) return res.status(404).json({ error: 'Patient not found' })

    const entries = db.prepare('SELECT * FROM entries WHERE patient_id = ? ORDER BY date DESC').all(patientId)
    const medications = db.prepare('SELECT * FROM medications WHERE patient_id = ? ORDER BY started_at DESC').all(patientId)
    const alerts = db.prepare('SELECT * FROM alerts WHERE patient_id = ? AND resolved = 0 ORDER BY created_at DESC').all(patientId)
    const latestSummary = db.prepare('SELECT * FROM summaries WHERE patient_id = ? ORDER BY created_at DESC LIMIT 1').get(patientId)

    const activeMed = medications.find(m => !m.ended_at)
    let medWeek = null
    if (activeMed) {
      const started = new Date(activeMed.started_at)
      medWeek = Math.floor((Date.now() - started.getTime()) / (7 * 24 * 60 * 60 * 1000))
    }

    const trend = computeTrend(entries)
    const streak = computeStreak(entries)

    res.json({
      id: patient.id,
      name: patient.name,
      diagnosis: patient.diagnosis,
      age: patient.age,
      doctor: patient.doctor,
      nextAppointment: patient.next_appointment,
      medication: activeMed ? { name: activeMed.name, dosage: activeMed.dosage, weekNumber: medWeek } : null,
      medications,
      entries,
      trend,
      streak,
      lastCheckIn: relativeTime(entries[0]?.date),
      alertCount: alerts.length,
      alert: alerts.length > 0,
      alerts,
      latestSummary: latestSummary ? { ...JSON.parse(latestSummary.content), compositeScore: latestSummary.composite_score, generatedAt: latestSummary.created_at } : null,
    })
  })

  return router
}
