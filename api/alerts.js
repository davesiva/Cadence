import { Router } from 'express'

export default function alertsRouter(db) {
  const router = Router()

  router.get('/:patientId', (req, res) => {
    const patientId = req.params.patientId === 'self' ? (process.env.DEFAULT_PATIENT_ID || 'sarah-chen') : req.params.patientId
    const alerts = db.prepare(
      'SELECT * FROM alerts WHERE patient_id = ? AND resolved = 0 ORDER BY created_at DESC'
    ).all(patientId)
    res.json(alerts)
  })

  router.patch('/:alertId', (req, res) => {
    const alert = db.prepare('SELECT * FROM alerts WHERE id = ?').get(req.params.alertId)
    if (!alert) return res.status(404).json({ error: 'Alert not found' })

    db.prepare('UPDATE alerts SET resolved = 1, resolved_at = datetime(?) WHERE id = ?')
      .run(new Date().toISOString(), alert.id)

    res.json({ success: true })
  })

  return router
}
