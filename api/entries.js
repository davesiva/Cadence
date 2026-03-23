import { Router } from 'express'
import { evaluateAlerts } from './alertEngine.js'
import { generateSummary } from './summaryEngine.js'
import { getJournalHint } from './promptHints.js'

export default function entriesRouter(db) {
  const router = Router()

  // Get entries for a patient
  router.get('/:patientId', (req, res) => {
    const patientId = req.params.patientId === 'self' ? (process.env.DEFAULT_PATIENT_ID || 'sarah-chen') : req.params.patientId
    const days = parseInt(req.query.days) || 365

    const entries = db.prepare(
      'SELECT * FROM entries WHERE patient_id = ? ORDER BY date DESC LIMIT ?'
    ).all(patientId, days)

    res.json(entries)
  })

  // Get adaptive journal hint
  router.get('/:patientId/hint', (req, res) => {
    const patientId = req.params.patientId === 'self' ? (process.env.DEFAULT_PATIENT_ID || 'sarah-chen') : req.params.patientId
    const hint = getJournalHint(db, patientId)
    res.json({ hint })
  })

  // Submit check-in
  router.post('/:patientId', (req, res) => {
    const patientId = req.params.patientId === 'self' ? (process.env.DEFAULT_PATIENT_ID || 'sarah-chen') : req.params.patientId
    const { date, mood, sleep, energy, note } = req.body

    if (!date || !mood || !sleep || !energy) {
      return res.status(400).json({ error: 'date, mood, sleep, and energy are required' })
    }

    try {
      const result = db.prepare(
        'INSERT INTO entries (patient_id, date, mood, sleep, energy, note) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(patient_id, date) DO UPDATE SET mood=?, sleep=?, energy=?, note=?'
      ).run(patientId, date, mood, sleep, energy, note || '', mood, sleep, energy, note || '')

      const entryId = result.lastInsertRowid || db.prepare('SELECT id FROM entries WHERE patient_id = ? AND date = ?').get(patientId, date)?.id

      // Run alert evaluation
      const newAlerts = evaluateAlerts(db, patientId)

      // Fire-and-forget summary generation
      generateSummary(db, patientId, entryId).catch(err => {
        console.error('Summary generation failed:', err.message)
      })

      res.json({ success: true, entryId, alerts: newAlerts })
    } catch (err) {
      console.error('Entry submission error:', err)
      res.status(500).json({ error: 'Failed to save entry' })
    }
  })

  return router
}
