// Label maps for display
export const moodLabels = ['', 'Terrible', 'Bad', 'Okay', 'Good', 'Wonderful']
export const sleepLabels = ['', 'Terrible', 'Poor', 'Fair', 'Good', 'Restful']
export const energyLabels = ['', 'Very Low', 'Low', 'Moderate', 'Good', 'Great']

// Generate dates relative to today
function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

// Patient check-in entries (Sarah Chen's data for clinician view)
export const sarahEntries = [
  { date: daysAgo(0), mood: 4, sleep: 5, energy: 4, note: 'Went for a walk with a friend today' },
  { date: daysAgo(1), mood: 4, sleep: 4, energy: 3, note: '' },
  { date: daysAgo(2), mood: 5, sleep: 4, energy: 4, note: 'First day I felt like myself in months' },
  { date: daysAgo(3), mood: 4, sleep: 5, energy: 4, note: '' },
  { date: daysAgo(4), mood: 4, sleep: 4, energy: 3, note: 'Started jogging again, felt good' },
  { date: daysAgo(5), mood: 3, sleep: 3, energy: 3, note: '' },
  { date: daysAgo(6), mood: 4, sleep: 4, energy: 4, note: '' },
  { date: daysAgo(7), mood: 3, sleep: 5, energy: 3, note: 'Slept well but still tired' },
  { date: daysAgo(8), mood: 3, sleep: 3, energy: 2, note: '' },
  { date: daysAgo(9), mood: 4, sleep: 4, energy: 3, note: '' },
  { date: daysAgo(10), mood: 3, sleep: 3, energy: 3, note: '' },
  { date: daysAgo(11), mood: 3, sleep: 4, energy: 3, note: 'Medication side effects easing' },
  { date: daysAgo(12), mood: 2, sleep: 3, energy: 2, note: '' },
  { date: daysAgo(13), mood: 3, sleep: 3, energy: 3, note: '' },
  { date: daysAgo(14), mood: 2, sleep: 2, energy: 2, note: 'Hard week, felt foggy' },
]

export const jamesEntries = [
  { date: daysAgo(0), mood: 3, sleep: 3, energy: 3, note: '' },
  { date: daysAgo(1), mood: 3, sleep: 4, energy: 3, note: 'Work stress manageable today' },
  { date: daysAgo(2), mood: 3, sleep: 3, energy: 3, note: '' },
  { date: daysAgo(3), mood: 4, sleep: 3, energy: 3, note: '' },
  { date: daysAgo(4), mood: 3, sleep: 3, energy: 2, note: 'Anxious about presentation' },
  { date: daysAgo(5), mood: 3, sleep: 2, energy: 2, note: '' },
  { date: daysAgo(6), mood: 3, sleep: 3, energy: 3, note: '' },
  { date: daysAgo(7), mood: 3, sleep: 3, energy: 3, note: '' },
]

export const priyaEntries = [
  { date: daysAgo(3), mood: 2, sleep: 2, energy: 1, note: 'Can\'t get out of bed' },
  { date: daysAgo(4), mood: 2, sleep: 1, energy: 2, note: '' },
  { date: daysAgo(5), mood: 3, sleep: 3, energy: 2, note: '' },
  { date: daysAgo(6), mood: 3, sleep: 3, energy: 3, note: '' },
  { date: daysAgo(7), mood: 4, sleep: 4, energy: 3, note: '' },
  { date: daysAgo(8), mood: 4, sleep: 4, energy: 4, note: 'Good day, saw friends' },
  { date: daysAgo(9), mood: 3, sleep: 3, energy: 3, note: '' },
  { date: daysAgo(10), mood: 4, sleep: 4, energy: 3, note: '' },
]

// Compute trend score: average of last 3 days minus average of 3 days before that
function computeTrend(entries) {
  if (entries.length < 6) return 0
  const recent = entries.slice(0, 3)
  const prior = entries.slice(3, 6)
  const avg = arr => arr.reduce((s, e) => s + (e.mood + e.sleep + e.energy) / 3, 0) / arr.length
  return +(avg(recent) - avg(prior)).toFixed(1)
}

export const patients = [
  {
    id: 'sarah-chen',
    name: 'Sarah Chen',
    diagnosis: 'Major Depressive Disorder',
    age: 34,
    medication: 'Sertraline 100mg',
    medicationWeek: 6,
    entries: sarahEntries,
    trend: computeTrend(sarahEntries),
    streak: 14,
    lastCheckIn: '2h ago',
    nextAppointment: '2026-03-28',
    doctor: 'Dr. Kamini',
    summary: 'Consistent improvement in mood and sleep quality over the past two weeks. Energy levels have stabilised. Patient reported feeling motivated to resume jogging. No missed check-ins in 14 days.',
  },
  {
    id: 'james-lim',
    name: 'James Lim',
    diagnosis: 'Generalised Anxiety Disorder',
    age: 28,
    medication: 'Escitalopram 10mg',
    medicationWeek: 3,
    entries: jamesEntries,
    trend: computeTrend(jamesEntries),
    streak: 8,
    lastCheckIn: '5h ago',
    nextAppointment: '2026-04-02',
    doctor: 'Dr. Kamini',
    summary: 'Mood and energy levels relatively stable. Sleep quality variable — correlates with reported work stress. Anxiety symptoms persist but are not worsening. Patient engaging consistently with check-ins.',
  },
  {
    id: 'priya-nair',
    name: 'Priya Nair',
    diagnosis: 'Bipolar II — Depressive Episode',
    age: 41,
    medication: 'Lamotrigine 200mg',
    medicationWeek: 10,
    entries: priyaEntries,
    trend: computeTrend(priyaEntries),
    streak: 0,
    lastCheckIn: '3 days ago',
    nextAppointment: '2026-03-25',
    doctor: 'Dr. Kamini',
    alert: true,
    summary: 'Significant decline in mood and energy over the past 3 days after a relatively stable period. Sleep quality deteriorated. Patient missed 3 consecutive check-ins before the decline entries. Last note expressed difficulty getting out of bed. Recommend urgent review.',
  },
]

// localStorage helpers for patient self-tracking
const STORAGE_KEY = 'cadence_entries'

export function getPatientEntries() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveEntry(entry) {
  const entries = getPatientEntries()
  // Replace if same date exists
  const idx = entries.findIndex(e => e.date === entry.date)
  if (idx >= 0) entries[idx] = entry
  else entries.unshift(entry)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  return entries
}

export function hasCheckedInToday() {
  const today = new Date().toISOString().split('T')[0]
  return getPatientEntries().some(e => e.date === today)
}

export function getStreak() {
  const entries = getPatientEntries()
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
      // Allow today to be missing (haven't checked in yet)
      if (i === 0) continue
      break
    }
  }
  return streak
}
