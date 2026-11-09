/* Propósito: pausa global de decoración (sesión, reduced-motion y visibilidad de pestaña). */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

type MotionContextValue = {
  paused: boolean
  reduced: boolean
  hidden: boolean
  freeze: boolean
  togglePaused: () => void
  setPaused: (next: boolean) => void
}

const MotionContext = createContext<MotionContextValue | null>(null)

function readPrefersReduced() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function MotionProvider({ children }: { children: ReactNode }) {
  const [paused, setPaused] = useState(false)
  const [reduced, setReduced] = useState(readPrefersReduced)
  const [hidden, setHidden] = useState(() => (typeof document !== 'undefined' ? document.hidden : false))

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onMq = () => setReduced(mq.matches)
    mq.addEventListener('change', onMq)
    const onVis = () => setHidden(document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      mq.removeEventListener('change', onMq)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  const freeze = paused || reduced || hidden
  const value = useMemo<MotionContextValue>(
    () => ({
      paused,
      reduced,
      hidden,
      freeze,
      togglePaused: () => setPaused((p) => !p),
      setPaused,
    }),
    [paused, reduced, hidden, freeze],
  )

  useEffect(() => {
    document.documentElement.dataset.motion = freeze ? 'paused' : 'play'
    return () => {
      delete document.documentElement.dataset.motion
    }
  }, [freeze])

  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>
}

export function useMotion() {
  const ctx = useContext(MotionContext)
  if (!ctx) throw new Error('useMotion requiere MotionProvider')
  return ctx
}

export function PauseButton({
  labelPlay = 'Pausar animaciones',
  labelPause = 'Continuar animaciones',
  className = '',
}: {
  labelPlay?: string
  labelPause?: string
  className?: string
}) {
  const { paused, reduced, togglePaused } = useMotion()
  if (reduced) return null
  return (
    <button
      type="button"
      onClick={togglePaused}
      aria-pressed={paused}
      className={`btn-ghost ${className}`.trim()}
    >
      {paused ? labelPause : labelPlay}
    </button>
  )
}
