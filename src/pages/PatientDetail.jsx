import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Sun, Moon, Zap, AlertTriangle, Sparkles, Target } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ReferenceLine } from 'recharts'
import { moodLabels, sleepLabels, energyLabels } from '../data/mockData'
import { api } from '../utils/api'
import InfoTooltip from '../components/InfoTooltip'

const tabs = [
  { key: 'mood', label: 'Mood', icon: Sun, color: '#0D9488', labelMap: moodLabels },
  { key: 'sleep', label: 'Sleep', icon: Moon, color: '#7C3AED', labelMap: sleepLabels },
  { key: 'energy', label: 'Energy', icon: Zap, color: '#F59E0B', labelMap: energyLabels },
]

function TrendBadge({ trend }) {
  if (trend > 0.5) {
    return (
      <span className="flex items-center gap-1 text-sm font-mono font-semibold text-emerald-600">
        <TrendingUp size={16} />+{trend}
      </span>
    )
  }
  if (trend < -0.5) {
    return (
      <span className="flex items-center gap-1 text-sm font-mono font-semibold text-red-500">
        <TrendingDown size={16} />{trend}
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1 text-sm font-mono font-semibold text-amber-600">
      <Minus size={16} />+{trend}
    </span>
  )
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatDateRelative(dateStr) {
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]
  if (dateStr === today) return 'Today'
  if (dateStr === yesterdayStr) return 'Yesterday'
  return formatDate(dateStr)
}

function CustomTooltip({ active, payload, label, activeTab }) {
  if (!active || !payload?.length) return null
  const tab = tabs.find(t => t.key === activeTab)
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-sm text-sm">
      <p className="font-medium">{label}</p>
      <p style={{ color: tab.color }} className="font-mono">
        {tab.label}: {payload[0].value}
      </p>
    </div>
  )
}

function CompositeBar({ score }) {
  if (score == null) return null
  const pct = Math.min(100, Math.max(0, score * 10))
  const color = score >= 6 ? '#10B981' : score >= 4 ? '#F59E0B' : '#EF4444'
  return (
    <div className="flex items-center gap-2 mt-2">
      <span className="text-xs text-secondary shrink-0">Score</span>
      <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-mono font-semibold" style={{ color }}>{score}/10</span>
    </div>
  )
}

export default function PatientDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('sleep')
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getPatient(id).then(data => {
      setPatient(data)
      setLoading(false)
    }).catch(err => {
      console.error('Failed to load patient:', err)
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-secondary">Loading...</div>
  }
  if (!patient) {
    return <div className="min-h-screen flex items-center justify-center text-secondary">Patient not found</div>
  }

  const currentTab = tabs.find(t => t.key === activeTab)
  const summary = patient.latestSummary
  const med = patient.medication

  // Chart data
  const chartData = [...patient.entries].reverse().map(e => ({
    date: formatDate(e.date),
    rawDate: e.date,
    [activeTab]: e[activeTab],
  }))

  // Medication start markers
  const medMarkers = (patient.medications || []).map(m => ({
    date: formatDate(m.started_at),
    label: `Started ${m.name} ${m.dosage}`,
  }))

  const recentEntries = patient.entries.slice(0, 5)

  return (
    <div className="min-h-screen max-w-6xl mx-auto px-4 sm:px-5 lg:px-10 py-6 lg:py-10">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <button
          onClick={() => navigate('/clinician')}
          className="flex items-center gap-1 text-secondary text-sm hover:text-primary transition-colors cursor-pointer min-h-[44px]"
        >
          <ArrowLeft size={16} />
          All patients
        </button>

        {/* Patient info */}
        <div className="mt-4 sm:mt-6 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl">{patient.name}</h1>
            <p className="text-secondary text-xs sm:text-sm mt-1">
              {patient.diagnosis} · {patient.age}y
              {med && ` · ${med.name} ${med.dosage} (Week ${med.weekNumber})`}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <TrendBadge trend={patient.trend} />
            <InfoTooltip text="Trend score compares the average of the last 3 days against the prior 3 days. Positive means improvement." />
          </div>
        </div>

        {/* Summary card */}
        <div className="mt-4 sm:mt-6 bg-card border border-accent/20 rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-1.5 mb-3">
            <p className="text-xs tracking-[0.15em] text-accent uppercase font-semibold">
              Summary since last visit
            </p>
            <InfoTooltip text="AI-generated summary based on check-in trends, missed days, and patient journal entries. Updated after each check-in." />
          </div>

          {summary ? (
            <>
              <p className="text-sm leading-relaxed text-primary/80">{summary.summary}</p>
              <CompositeBar score={summary.compositeScore} />

              {summary.compositeInterpretation && (
                <p className="text-xs text-secondary mt-2 italic">{summary.compositeInterpretation}</p>
              )}

              {/* Concerns */}
              {summary.concerns?.length > 0 && (
                <div className="mt-3 p-3 bg-red-50/50 rounded-lg">
                  <div className="flex items-center gap-1.5 mb-1">
                    <AlertTriangle size={12} className="text-red-500" />
                    <span className="text-xs font-semibold text-red-600">Concerns</span>
                  </div>
                  <ul className="text-xs text-red-700/80 space-y-0.5">
                    {summary.concerns.map((c, i) => <li key={i}>· {c}</li>)}
                  </ul>
                </div>
              )}

              {/* Positives */}
              {summary.positives?.length > 0 && (
                <div className="mt-2 p-3 bg-emerald-50/50 rounded-lg">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles size={12} className="text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-700">Positives</span>
                  </div>
                  <ul className="text-xs text-emerald-700/80 space-y-0.5">
                    {summary.positives.map((p, i) => <li key={i}>· {p}</li>)}
                  </ul>
                </div>
              )}

              {/* Suggested focus */}
              {summary.suggestedFocus && (
                <div className="mt-2 p-3 bg-accent/5 rounded-lg flex items-start gap-2">
                  <Target size={12} className="text-accent mt-0.5 shrink-0" />
                  <p className="text-xs text-accent/80">{summary.suggestedFocus}</p>
                </div>
              )}

              {summary.generatedAt && (
                <p className="text-[10px] text-secondary/50 mt-2">
                  Generated {new Date(summary.generatedAt).toLocaleString()}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-secondary italic">No summary available yet.</p>
          )}
        </div>

        {/* Chart + entries */}
        <div className="mt-4 sm:mt-6 lg:grid lg:grid-cols-5 lg:gap-6">
          <div className="lg:col-span-3">
            <div className="flex items-center justify-center lg:justify-start gap-1 sm:gap-2">
              {tabs.map(tab => {
                const Icon = tab.icon
                const isActive = activeTab === tab.key
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer min-h-[40px]
                      ${isActive ? 'bg-card border border-accent/30 text-accent shadow-sm' : 'text-secondary hover:text-primary'}`}
                  >
                    <Icon size={14} />{tab.label}
                  </button>
                )
              })}
              <InfoTooltip text="Self-reported scores on a 1–5 scale. 1 = lowest, 5 = highest. Tap each tab to switch between dimensions." />
            </div>

            <div className="mt-3 sm:mt-4 bg-card border border-border rounded-xl p-3 sm:p-4">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6B7280', fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis domain={[0, 6]} ticks={[0, 1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: '#6B7280', fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip activeTab={activeTab} />} />
                  <defs>
                    <linearGradient id={`gradient-${activeTab}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={currentTab.color} stopOpacity={0.15} />
                      <stop offset="100%" stopColor={currentTab.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey={activeTab} stroke="none" fill={`url(#gradient-${activeTab})`} />
                  <Line type="monotone" dataKey={activeTab} stroke={currentTab.color} strokeWidth={2} dot={{ r: 3, fill: currentTab.color }} activeDot={{ r: 5, fill: currentTab.color }} />
                  {/* Medication markers */}
                  {medMarkers.map((m, i) => (
                    <ReferenceLine key={i} x={m.date} stroke="#0D9488" strokeDasharray="4 4" strokeOpacity={0.5}
                      label={{ value: m.label, position: 'top', fontSize: 9, fill: '#0D9488' }} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-xl mt-6 lg:mt-0 mb-3 sm:mb-4">Recent entries</h2>
            <div className="space-y-3 pb-8">
              {recentEntries.map(entry => (
                <div key={entry.date} className="bg-card border border-border rounded-xl p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <p className="font-semibold text-sm">{formatDateRelative(entry.date)}</p>
                    <div className="flex items-center gap-2 sm:gap-3 text-xs text-secondary flex-wrap">
                      <span>Mood: {moodLabels[entry.mood]}</span>
                      <span>Sleep: {sleepLabels[entry.sleep]}</span>
                      <span>Energy: {energyLabels[entry.energy]}</span>
                    </div>
                  </div>
                  {entry.note && (
                    <>
                      <div className="border-t border-border mt-2 sm:mt-3 pt-2 sm:pt-3" />
                      <p className="text-sm italic text-accent/80">"{entry.note}"</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
