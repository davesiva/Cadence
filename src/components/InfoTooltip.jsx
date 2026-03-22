import { useState, useRef, useEffect } from 'react'
import { Info } from 'lucide-react'

export default function InfoTooltip({ text, size = 14 }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close on outside click (for mobile tap-to-open)
  useEffect(() => {
    if (!open) return
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [open])

  return (
    <span
      className="relative inline-flex"
      ref={ref}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(v => !v) }}
        className="text-secondary/50 hover:text-secondary transition-colors cursor-pointer p-0.5"
        aria-label="More info"
      >
        <Info size={size} />
      </button>
      {open && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 px-3 py-2 rounded-lg bg-primary text-white text-xs leading-relaxed shadow-lg pointer-events-none">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-primary" />
        </div>
      )}
    </span>
  )
}
