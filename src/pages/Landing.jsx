import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <h1 className="text-5xl md:text-7xl font-heading tracking-tight">
          Cadence
        </h1>

        <div className="w-10 h-0.5 bg-accent mx-auto mt-4 mb-3" />

        <p className="text-xs tracking-[0.25em] text-secondary uppercase font-body">
          by Day V
        </p>

        <p className="mt-10 text-lg italic text-secondary font-heading">
          Tune in.
        </p>

        <div className="mt-10 flex flex-col gap-3 w-64 mx-auto">
          <button
            onClick={() => navigate('/patient')}
            className="w-full py-3.5 px-6 rounded-lg bg-accent text-white font-body font-medium text-base
                       hover:bg-accent/90 transition-colors cursor-pointer"
          >
            I'm a Patient
          </button>
          <button
            onClick={() => navigate('/clinician')}
            className="w-full py-3.5 px-6 rounded-lg border border-accent text-accent font-body font-medium text-base
                       hover:bg-accent/5 transition-colors cursor-pointer"
          >
            I'm a Clinician
          </button>
        </div>

        <p className="mt-10 text-xs text-secondary">
          Prototype Demo · Not a medical device
        </p>
      </motion.div>
    </div>
  )
}
