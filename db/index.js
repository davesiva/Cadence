import Database from 'better-sqlite3'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { seed } from './seed.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

export function initDb() {
  const dbPath = process.env.DB_PATH || join(__dirname, '..', 'cadence.db')
  const db = new Database(dbPath)

  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  db.exec(`
    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      diagnosis TEXT NOT NULL,
      age INTEGER NOT NULL,
      doctor TEXT NOT NULL,
      next_appointment TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id TEXT NOT NULL REFERENCES patients(id),
      date TEXT NOT NULL,
      mood INTEGER NOT NULL CHECK(mood BETWEEN 1 AND 5),
      sleep INTEGER NOT NULL CHECK(sleep BETWEEN 1 AND 5),
      energy INTEGER NOT NULL CHECK(energy BETWEEN 1 AND 5),
      note TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(patient_id, date)
    );

    CREATE TABLE IF NOT EXISTS medications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id TEXT NOT NULL REFERENCES patients(id),
      name TEXT NOT NULL,
      dosage TEXT NOT NULL,
      started_at TEXT NOT NULL,
      ended_at TEXT,
      notes TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS summaries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id TEXT NOT NULL REFERENCES patients(id),
      entry_id INTEGER REFERENCES entries(id),
      content TEXT NOT NULL,
      composite_score REAL,
      alert_triggered INTEGER DEFAULT 0,
      alert_reasons TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id TEXT NOT NULL REFERENCES patients(id),
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      resolved INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      resolved_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_entries_patient_date
      ON entries(patient_id, date DESC);
    CREATE INDEX IF NOT EXISTS idx_medications_patient
      ON medications(patient_id);
    CREATE INDEX IF NOT EXISTS idx_summaries_patient
      ON summaries(patient_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_alerts_patient_active
      ON alerts(patient_id, resolved);
  `)

  // Auto-seed if empty
  const count = db.prepare('SELECT COUNT(*) as c FROM patients').get()
  if (count.c === 0) {
    seed(db)
    console.log('Database seeded with initial data')
  }

  return db
}
