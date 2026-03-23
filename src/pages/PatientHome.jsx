import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ChevronRight, Calendar, Flame } from 'lucide-react'
import { api } from '../utils/api'
import InfoTooltip from '../components/InfoTooltip'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function getWeekDays(entries) {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7))

  const days = []
  const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    const todayStr = today.toISOString().split('T')[0]
    const isToday = dateStr === todayStr
    const isFuture = d > today && !isToday
    const completed = entries.some(e => e.date === dateStr)
    days.push({ label: labels[i], isToday, isFuture, completed })
  }
  return days
}

function formatAppointmentDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  const diffDays = Math.ceil((d - today) / (1000 * 60 * 60 * 24))
  return {
    display: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    daysAway: diffDays
  }
}

export default function PatientHome() {
  const navigate = useNavigate()
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getPatient('self').then(data => {
      setPatient(data)
      setLoading(false)
    }).catch(err => {
      console.error('Failed to load patient data:', err)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-secondary">Loading...</div>
  }

  const entries = patient?.entries || []
  const streak = patient?.streak || 0
  const today = new Date().toISOString().split('T')[0]
  const checkedIn = entries.some(e => e.date === today)
  const weekDays = getWeekDays(entries)
  const appt = formatAppointmentDate(patient?.nextAppointment)

  return (
    <div className="min-h-screen min-h-dvh max-w-lg mx-auto px-5 py-6 pb-[env(safe-area-inset-bottom,24px)]">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-secondary text-sm hover:text-primary transition-colors cursor-pointer min-h-[44px]"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <p className="mt-6 text-accent text-sm font-medium">{getGreeting()}</p>
        <h1 className="text-3xl mt-1 leading-tight">
          How are you<br />feeling today?
        </h1>

        {streak > 0 && (
          <div className="mt-8 bg-card border border-border rounded-xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center text-2xl shrink-0">
              <Flame className="text-amber-500" size={24} />
            </div>
            <div className="flex items-center gap-1.5">
              <div>
                <p className="font-semibold text-base">{streak}-day streak</p>
                <p className="text-secondary text-sm">You've been showing up for yourself</p>
              </div>
              <InfoTooltip text="Your streak counts consecutive days you've completed a check-in. Keep it going!" />
            </div>
          </div>
        )}

        <div className="mt-4 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-1.5 mb-4">
            <p className="text-xs tracking-[0.15em] text-secondary uppercase">This week</p>
            <InfoTooltip text="Green ticks show days you've checked in this week. The dashed circle is today." />
          </div>
          <div className="flex justify-between">
            {weekDays.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <span className="text-xs text-secondary">{day.label}</span>
                {day.completed ? (
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8.5L6.5 12L13 4" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                ) : day.isToday ? (
                  <div className="w-10 h-10 rounded-full border-2 border-dashed border-accent/40" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-100" />
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => navigate('/patient/checkin')}
          disabled={checkedIn}
          className={`mt-6 w-full py-4 px-6 rounded-xl font-medium text-lg flex items-center justify-center gap-2 transition-colors cursor-pointer min-h-[56px]
            ${checkedIn
              ? 'bg-accent/20 text-accent/60'
              : 'bg-accent text-white hover:bg-accent/90 active:scale-[0.98] transition-transform'
            }`}
        >
          {checkedIn ? 'Checked in today' : 'Start today\'s check-in'}
          {!checkedIn && <ChevronRight size={20} />}
        </button>
        <p className="text-center text-secondary text-sm mt-2">
          {checkedIn ? 'Come back tomorrow' : 'Takes about 1 minute'}
        </p>

        {appt && (
          <div className="mt-6 bg-accent-light rounded-xl p-4 flex items-center gap-3">
            <Calendar size={20} className="text-accent shrink-0" />
            <div>
              <p className="text-sm">
                Next appointment: <span className="font-semibold text-accent">{appt.display}</span>
              </p>
              <p className="text-xs text-secondary">{patient.doctor} · {appt.daysAway} days away</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
