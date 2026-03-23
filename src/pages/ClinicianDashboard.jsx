import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, TrendingUp, TrendingDown, Minus, AlertCircle, User, Clock, Flame, ChevronRight, Pill, Filter } from 'lucide-react'
import { moodLabels, sleepLabels, energyLabels } from '../data/mockData'
import { api } from '../utils/api'
import InfoTooltip from '../components/InfoTooltip'

function TrendBadge({ trend }) {
  if (trend > 0.5) {
    return (
      <span className="flex items-center gap-1 text-sm font-mono font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
        <TrendingUp size={14} />
        +{trend}
      </span>
    )
  }
  if (trend < -0.5) {
    return (
      <span className="flex items-center gap-1 text-sm font-mono font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-md">
        <TrendingDown size={14} />
        {trend}
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1 text-sm font-mono font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
      <Minus size={14} />
      +{trend}
    </span>
  )
}

function PatientCard({ patient }) {
  const navigate = useNavigate()
  const isAlert = patient.alert
  const latest = patient.latestEntry
  const med = patient.medication

  return (
    <button
      onClick={() => navigate(`/clinician/patient/${patient.id}`)}
      className={`w-full text-left bg-card rounded-xl p-4 sm:p-5 border transition-all hover:shadow-sm cursor-pointer group
        ${isAlert ? 'border-red-200 bg-red-50/30' : 'border-border'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0
            ${isAlert ? 'bg-red-100' : 'bg-accent/10'}`}>
            {isAlert
              ? <AlertCircle size={20} className="text-red-500" />
              : <User size={20} className="text-accent" />
            }
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-base truncate">{patient.name}</p>
            <p className="text-secondary text-sm truncate">{patient.diagnosis} · {patient.age}y</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <TrendBadge trend={patient.trend} />
          <ChevronRight size={16} className="text-secondary/40 hidden sm:block group-hover:text-secondary transition-colors" />
        </div>
      </div>

      {/* Desktop: expanded info row */}
      {med && (
        <div className="hidden lg:flex items-center gap-6 mt-4 pt-4 border-t border-border">
          <span className="flex items-center gap-1.5 text-secondary text-sm">
            <Pill size={14} />
            {med.name} {med.dosage} · Week {med.weekNumber}
          </span>
          {latest && (
            <div className="flex items-center gap-4 text-sm text-secondary ml-auto">
              <span>Mood: <span className="text-primary font-medium">{moodLabels[latest.mood]}</span></span>
              <span>Sleep: <span className="text-primary font-medium">{sleepLabels[latest.sleep]}</span></span>
              <span>Energy: <span className="text-primary font-medium">{energyLabels[latest.energy]}</span></span>
            </div>
          )}
        </div>
      )}

      <div className="border-t border-border mt-3 pt-3 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-secondary text-xs sm:text-sm">
          <Clock size={14} />
          Last check-in: {patient.lastCheckIn}
        </span>
        <span className="flex items-center gap-1.5 text-xs sm:text-sm">
          {patient.streak > 0 ? (
            <>
              <Flame size={14} className="text-amber-500" />
              <span className="text-secondary">{patient.streak}d</span>
            </>
          ) : (
            <span className="text-secondary">No streak</span>
          )}
        </span>
      </div>
    </button>
  )
}

export default function ClinicianDashboard() {
  const navigate = useNavigate()
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, alerts

  useEffect(() => {
    api.getPatients().then(data => {
      setPatients(data)
      setLoading(false)
    }).catch(err => {
      console.error('Failed to load patients:', err)
      setLoading(false)
    })
  }, [])

  const filtered = filter === 'alerts' ? patients.filter(p => p.alert) : patients
  const alertCount = patients.filter(p => p.alert).length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-secondary">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen max-w-5xl mx-auto px-4 sm:px-5 lg:px-10 py-6 lg:py-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1 text-secondary text-sm hover:text-primary transition-colors cursor-pointer min-h-[44px]"
          >
            <ArrowLeft size={16} />
            Home
          </button>
          <span className="text-xs tracking-[0.15em] text-secondary uppercase">Clinician View</span>
        </div>

        <div className="mt-6 lg:mt-10">
          <h1 className="text-3xl md:text-4xl">Your patients</h1>
          <div className="mt-1 flex items-center gap-1.5 text-sm">
            {alertCount > 0 && (
              <span className="text-red-500 font-medium">{alertCount} alert{alertCount > 1 ? 's' : ''}</span>
            )}
            {alertCount > 0 && <span className="text-secondary">·</span>}
            <span className="text-secondary">{patients.length} active patients</span>
            <InfoTooltip text="Patients are sorted by urgency — those with declining trends or alerts appear first." />
          </div>
        </div>

        {/* Filters */}
        {alertCount > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <Filter size={14} className="text-secondary" />
            {['all', 'alerts'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer
                  ${filter === f
                    ? 'bg-accent/10 text-accent border border-accent/30'
                    : 'text-secondary hover:text-primary'
                  }`}
              >
                {f === 'all' ? 'All' : 'Alerts only'}
              </button>
            ))}
          </div>
        )}

        <div className="mt-4 lg:mt-6 space-y-3">
          {filtered.map(patient => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
        </div>
      </motion.div>
    </div>
  )
}
