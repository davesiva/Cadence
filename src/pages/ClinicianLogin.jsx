import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function ClinicianLogin() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <motion.div
        className="w-full max-w-sm text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <h1 className="text-4xl font-heading tracking-tight">
          Clinician Login
        </h1>

        <p className="mt-3 text-sm text-secondary font-body">
          Log in to access the clinical dashboard
        </p>

        <div className="mt-10">
          <button
            onClick={() => navigate('/clinician')}
            className="w-full py-4 px-6 rounded-xl border-2 border-[#CC3333]/30 bg-white
                       hover:border-[#CC3333]/50 hover:shadow-md
                       transition-all duration-200 cursor-pointer
                       flex items-center justify-center gap-3"
          >
            <span className="text-base font-body text-secondary">Login via</span>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-[#CC3333]">Sing</span><span className="text-primary">Pass</span>
            </span>
          </button>
        </div>

        <button
          onClick={() => navigate('/')}
          className="mt-8 text-sm text-secondary hover:text-accent transition-colors cursor-pointer"
        >
          ← Back
        </button>

        <p className="mt-10 text-xs text-secondary">
          Prototype Demo · Not a medical device
        </p>
      </motion.div>
    </div>
  )
}
