import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Sun, Moon, Zap } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from 'recharts'
import { patients, moodLabels, sleepLabels, energyLabels } from '../data/mockData'
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
        <TrendingUp size={16} />
        +{trend}
      </span>
    )
  }
  if (trend < -0.5) {
    return (
      <span className="flex items-center gap-1 text-sm font-mono font-semibold text-red-500">
        <TrendingDown size={16} />
        {trend}
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1 text-sm font-mono font-semibold text-amber-600">
      <Minus size={16} />
      +{trend}
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

export default function PatientDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('sleep')

  const patient = patients.find(p => p.id === id)
  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center text-secondary">
        Patient not found
      </div>
    )
  }

  const currentTab = tabs.find(t => t.key === activeTab)

  // Prepare chart data (reversed so oldest is left)
  const chartData = [...patient.entries].reverse().map(e => ({
    date: formatDate(e.date),
    [activeTab]: e[activeTab],
  }))

  // Recent entries (most recent first, top 5)
  const recentEntries = patient.entries.slice(0, 5)

  return (
    <div className="min-h-screen max-w-6xl mx-auto px-4 sm:px-5 lg:px-10 py-6 lg:py-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
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
              {patient.diagnosis} · {patient.age}y · {patient.medication} (Week {patient.medicationWeek})
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
            <InfoTooltip text="Auto-generated summary based on check-in trends, missed days, and patient journal entries since the last clinical appointment." />
          </div>
          <p className="text-sm leading-relaxed text-primary/80">
            {patient.summary}
          </p>
        </div>

        {/* Desktop: two-column layout for chart + entries */}
        <div className="mt-4 sm:mt-6 lg:grid lg:grid-cols-5 lg:gap-6">
          {/* Chart column (wider) */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="flex items-center justify-center lg:justify-start gap-1 sm:gap-2">
              {tabs.map(tab => {
                const Icon = tab.icon
                const isActive = activeTab === tab.key
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer min-h-[40px]
                      ${isActive
                        ? 'bg-card border border-accent/30 text-accent shadow-sm'
                        : 'text-secondary hover:text-primary'
                      }`}
                  >
                    <Icon size={14} />
                    {tab.label}
                  </button>
                )
              })}
              <InfoTooltip text="Self-reported scores on a 1–5 scale. 1 = lowest, 5 = highest. Tap each tab to switch between dimensions." />
            </div>

            {/* Chart */}
            <div className="mt-3 sm:mt-4 bg-card border border-border rounded-xl p-3 sm:p-4">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#6B7280', fontFamily: 'JetBrains Mono' }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    domain={[0, 6]}
                    ticks={[0, 1, 2, 3, 4, 5]}
                    tick={{ fontSize: 11, fill: '#6B7280', fontFamily: 'JetBrains Mono' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip activeTab={activeTab} />} />
                  <defs>
                    <linearGradient id={`gradient-${activeTab}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={currentTab.color} stopOpacity={0.15} />
                      <stop offset="100%" stopColor={currentTab.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey={activeTab}
                    stroke="none"
                    fill={`url(#gradient-${activeTab})`}
                  />
                  <Line
                    type="monotone"
                    dataKey={activeTab}
                    stroke={currentTab.color}
                    strokeWidth={2}
                    dot={{ r: 3, fill: currentTab.color }}
                    activeDot={{ r: 5, fill: currentTab.color }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Entries column */}
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
