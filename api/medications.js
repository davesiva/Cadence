import { Router } from 'express'

export default function medicationsRouter(db) {
  const router = Router()

  router.get('/:patientId', (req, res) => {
    const patientId = req.params.patientId === 'self' ? (process.env.DEFAULT_PATIENT_ID || 'sarah-chen') : req.params.patientId
    const meds = db.prepare('SELECT * FROM medications WHERE patient_id = ? ORDER BY started_at DESC').all(patientId)
    res.json(meds)
  })

  router.post('/:patientId', (req, res) => {
    const patientId = req.params.patientId === 'self' ? (process.env.DEFAULT_PATIENT_ID || 'sarah-chen') : req.params.patientId
    const { name, dosage, startedAt, notes } = req.body

    if (!name || !dosage || !startedAt) {
      return res.status(400).json({ error: 'name, dosage, and startedAt are required' })
    }

    const result = db.prepare(
      'INSERT INTO medications (patient_id, name, dosage, started_at, notes) VALUES (?, ?, ?, ?, ?)'
    ).run(patientId, name, dosage, startedAt, notes || '')

    res.json({ success: true, id: result.lastInsertRowid })
  })

  router.patch('/:medicationId', (req, res) => {
    const { endedAt, dosage, notes } = req.body
    const med = db.prepare('SELECT * FROM medications WHERE id = ?').get(req.params.medicationId)
    if (!med) return res.status(404).json({ error: 'Medication not found' })

    if (endedAt) db.prepare('UPDATE medications SET ended_at = ? WHERE id = ?').run(endedAt, med.id)
    if (dosage) db.prepare('UPDATE medications SET dosage = ? WHERE id = ?').run(dosage, med.id)
    if (notes !== undefined) db.prepare('UPDATE medications SET notes = ? WHERE id = ?').run(notes, med.id)

    res.json({ success: true })
  })

  return router
}
