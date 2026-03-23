import { Router } from 'express'
import patientsRouter from './patients.js'
import entriesRouter from './entries.js'
import medicationsRouter from './medications.js'
import alertsRouter from './alerts.js'
import chatRouter from './chat.js'

export default function apiRouter(db) {
  const router = Router()
  router.use('/patients', patientsRouter(db))
  router.use('/entries', entriesRouter(db))
  router.use('/medications', medicationsRouter(db))
  router.use('/alerts', alertsRouter(db))
  router.use('/chat', chatRouter(db))
  return router
}
