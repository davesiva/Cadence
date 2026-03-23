import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Check } from 'lucide-react'
import { moodLabels, sleepLabels, energyLabels, saveEntry } from '../data/mockData'
import { api } from '../utils/api'

const steps = [
  { key: 'mood', question: 'How is your mood right now?', labels: moodLabels },
  { key: 'sleep', question: 'How did you sleep last night?', labels: sleepLabels },
  { key: 'energy', question: 'How are your energy levels?', labels: energyLabels },
]

function ScaleSelector({ step, value, onChange }) {
  return (
    <div className="space-y-3 mt-8">
      {[1, 2, 3, 4, 5].map(v => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`w-full text-left px-5 py-4 rounded-xl border transition-all cursor-pointer min-h-[52px] active:scale-[0.98]
            ${value === v
              ? 'border-accent bg-accent/5 text-primary'
              : 'border-border bg-card text-secondary hover:border-accent/30'
            }`}
        >
          <span className="font-medium">{step.labels[v]}</span>
        </button>
      ))}
    </div>
  )
}

export default function CheckIn() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [values, setValues] = useState({ mood: 0, sleep: 0, energy: 0, note: '' })
  const [done, setDone] = useState(false)
  const [journalHint, setJournalHint] = useState('Anything else on your mind?')

  // Fetch adaptive journal hint
  useEffect(() => {
    api.getJournalHint('self').then(data => {
      if (data.hint) setJournalHint(data.hint)
    }).catch(() => {})
  }, [])

  const isScaleStep = currentStep < 3
  const isNoteStep = currentStep === 3
  const progress = ((currentStep + 1) / 4) * 100

  function handleSelect(val) {
    const key = steps[currentStep].key
    setValues(prev => ({ ...prev, [key]: val }))
    setTimeout(() => setCurrentStep(prev => prev + 1), 300)
  }

  async function handleSubmit() {
    const today = new Date().toISOString().split('T')[0]
    const entry = { date: today, ...values }

    // Save to localStorage as fallback
    saveEntry(entry)

    // Post to API
    try {
      await api.submitEntry('self', entry)
    } catch (err) {
      console.error('API submission failed, saved locally:', err)
    }

    setDone(true)
  }

  if (done) {
    return (
      <div className="min-h-screen min-h-dvh max-w-lg mx-auto px-5 py-6 flex flex-col items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-accent" />
          </div>
          <h2 className="text-2xl">You're all set</h2>
          <p className="text-secondary mt-2">Thanks for checking in today.</p>
          <button
            onClick={() => navigate('/patient')}
            className="mt-8 px-8 py-3 rounded-xl bg-accent text-white font-medium hover:bg-accent/90 active:scale-[0.98] transition-all cursor-pointer min-h-[48px]"
          >
            Back to home
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen min-h-dvh max-w-lg mx-auto px-5 py-6 pb-[env(safe-area-inset-bottom,24px)]">
      <div className="flex items-center justify-between">
        <button
          onClick={() => currentStep > 0 ? setCurrentStep(prev => prev - 1) : navigate('/patient')}
          className="flex items-center gap-1 text-secondary text-sm hover:text-primary transition-colors cursor-pointer min-h-[44px]"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <span className="text-xs text-secondary font-mono">
          {currentStep + 1} / 4
        </span>
      </div>

      <div className="mt-4 h-1 bg-border rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-accent rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {isScaleStep && (
            <>
              <h2 className="text-2xl mt-8">{steps[currentStep].question}</h2>
              <ScaleSelector
                step={steps[currentStep]}
                value={values[steps[currentStep].key]}
                onChange={handleSelect}
              />
            </>
          )}

          {isNoteStep && (
            <>
              <h2 className="text-2xl mt-8">{journalHint}</h2>
              <p className="text-secondary text-sm mt-2">Optional — a quick note for your records</p>
              <textarea
                value={values.note}
                onChange={e => setValues(prev => ({ ...prev, note: e.target.value }))}
                placeholder="Today I..."
                className="mt-6 w-full h-36 px-4 py-3 rounded-xl border border-border bg-card text-primary text-base
                           placeholder:text-secondary/50 resize-none focus:outline-none focus:border-accent
                           transition-colors font-body"
              />
              <button
                onClick={handleSubmit}
                className="mt-6 w-full py-4 px-6 rounded-xl bg-accent text-white font-medium text-lg
                           hover:bg-accent/90 active:scale-[0.98] transition-all cursor-pointer min-h-[56px]"
              >
                Complete check-in
              </button>
              <button
                onClick={() => { setValues(prev => ({ ...prev, note: '' })); handleSubmit() }}
                className="mt-3 w-full py-3 text-secondary text-sm hover:text-primary transition-colors cursor-pointer min-h-[44px]"
              >
                Skip
              </button>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
