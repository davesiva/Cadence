import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'
import { initDb } from './db/index.js'
import apiRouter from './api/index.js'

dotenv.config()

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json({ limit: '1mb' }))

// Initialize database
const db = initDb()

// Serve static files from Vite build
app.use(express.static(join(__dirname, 'dist')))

// API routes
app.use('/api', apiRouter(db))

// SPA fallback
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api/')) {
    res.sendFile(join(__dirname, 'dist', 'index.html'))
  } else {
    next()
  }
})

app.listen(PORT, () => {
  console.log(`Cadence server running on port ${PORT}`)
})
