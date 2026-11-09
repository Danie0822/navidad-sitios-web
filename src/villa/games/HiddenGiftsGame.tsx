/* Propósito: nueve ventanas 3×3; una aparición a la vez, captura atómica y ronda de 30s. */
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useMotion } from '../motion/MotionContext'

const ROUND_MS = 30_000
const APPEAR_MS = 1_800
const GAP_MS = 350
const WINDOWS = 9

type Phase = 'ready' | 'playing' | 'result'

export function HiddenGiftsGame() {
  const { paused, hidden, togglePaused, reduced } = useMotion()
  const frozen = paused || hidden
  const [phase, setPhase] = useState<Phase>('ready')
  const [score, setScore] = useState(0)
  const [seconds, setSeconds] = useState(30)
  const [active, setActive] = useState<number | null>(null)
  const [caughtFlash, setCaughtFlash] = useState(false)
  const [caughtWindow, setCaughtWindow] = useState<number | null>(null)
  const [focusIdx, setFocusIdx] = useState(0)

  const scoreRef = useRef(0)
  const phaseRef = useRef<Phase>('ready')
  const frozenRef = useRef(frozen)
  const activeRef = useRef<number | null>(null)
  const lastWindow = useRef<number | null>(null)
  const appearId = useRef(0)
  const capturedId = useRef<number | null>(null)
  const remainingRound = useRef(ROUND_MS)
  const remainingStep = useRef(0)
  const stepKind = useRef<'appear' | 'gap'>('appear')
  const roundRaf = useRef(0)
  const stepTimer = useRef<number | null>(null)
  const stepStarted = useRef(0)
  const lastTick = useRef<number | null>(null)
  const boardRef = useRef<HTMLDivElement | null>(null)

  frozenRef.current = frozen
  phaseRef.current = phase
  activeRef.current = active
  scoreRef.current = score

  const clearStep = () => {
    if (stepTimer.current) {
      window.clearTimeout(stepTimer.current)
      stepTimer.current = null
    }
  }

  const stopRound = useCallback(() => {
    if (roundRaf.current) cancelAnimationFrame(roundRaf.current)
    roundRaf.current = 0
    lastTick.current = null
    clearStep()
  }, [])

  const endRound = useCallback(() => {
    stopRound()
    setActive(null)
    activeRef.current = null
    appearId.current += 1
    setPhase('result')
    phaseRef.current = 'result'
    setSeconds(0)
  }, [stopRound])

  const pickWindow = () => {
    let next = Math.floor(Math.random() * WINDOWS)
    if (lastWindow.current != null && WINDOWS > 1) {
      let guard = 0
      while (next === lastWindow.current && guard++ < 8) {
        next = Math.floor(Math.random() * WINDOWS)
      }
      if (next === lastWindow.current) next = (next + 1) % WINDOWS
    }
    lastWindow.current = next
    return next
  }

  const scheduleStep = useCallback(
    (kind: 'appear' | 'gap', ms: number) => {
      clearStep()
      stepKind.current = kind
      remainingStep.current = ms
      stepStarted.current = performance.now()
      const run = () => {
        if (phaseRef.current !== 'playing') return
        if (kind === 'appear') {
          const w = pickWindow()
          capturedId.current = null
          appearId.current += 1
          setCaughtFlash(false)
          setCaughtWindow(null)
          setActive(w)
          activeRef.current = w
          scheduleStep('gap', APPEAR_MS)
        } else {
          setActive(null)
          activeRef.current = null
          scheduleStep('appear', GAP_MS)
        }
      }
      stepTimer.current = window.setTimeout(run, ms)
    },
    [],
  )

  useEffect(() => {
    if (phase !== 'playing') return
    if (frozen) {
      if (stepTimer.current) {
        remainingStep.current = Math.max(0, remainingStep.current - (performance.now() - stepStarted.current))
        clearStep()
      }
      lastTick.current = null
      return
    }
    if (!stepTimer.current) {
      scheduleStep(stepKind.current, Math.max(0, remainingStep.current))
    }

    const tick = (t: number) => {
      if (phaseRef.current !== 'playing') return
      if (frozenRef.current) {
        lastTick.current = null
        roundRaf.current = requestAnimationFrame(tick)
        return
      }
      if (lastTick.current == null) lastTick.current = t
      const dt = t - lastTick.current
      lastTick.current = t
      remainingRound.current = Math.max(0, remainingRound.current - dt)
      const secs = Math.max(0, Math.ceil(remainingRound.current / 1000))
      setSeconds((prev) => (prev === secs ? prev : secs))
      if (remainingRound.current <= 0) {
        endRound()
        return
      }
      roundRaf.current = requestAnimationFrame(tick)
    }
    roundRaf.current = requestAnimationFrame(tick)
    return () => {
      if (roundRaf.current) cancelAnimationFrame(roundRaf.current)
    }
  }, [phase, frozen, scheduleStep, endRound])

  useEffect(() => () => stopRound(), [stopRound])

  function start() {
    stopRound()
    scoreRef.current = 0
    setScore(0)
    remainingRound.current = ROUND_MS
    setSeconds(30)
    lastWindow.current = null
    capturedId.current = null
    appearId.current = 0
    setCaughtFlash(false)
    setCaughtWindow(null)
    remainingStep.current = 0
    stepKind.current = 'appear'
    setPhase('playing')
    phaseRef.current = 'playing'
    queueMicrotask(() => {
      boardRef.current?.querySelector<HTMLButtonElement>('[data-window="0"]')?.focus()
    })
  }

  function reset() {
    stopRound()
    setPhase('ready')
    phaseRef.current = 'ready'
    setScore(0)
    scoreRef.current = 0
    setSeconds(30)
    remainingRound.current = ROUND_MS
    setActive(null)
    setCaughtFlash(false)
    setCaughtWindow(null)
    lastWindow.current = null
    capturedId.current = null
  }

  function capture(index: number) {
    if (phaseRef.current !== 'playing') return
    if (frozenRef.current) return
    if (remainingRound.current <= 0) return
    if (activeRef.current !== index) return
    const id = appearId.current
    if (capturedId.current === id) return
    capturedId.current = id
    scoreRef.current += 1
    setScore(scoreRef.current)
    setCaughtFlash(true)
    setCaughtWindow(index)
    setActive(null)
    activeRef.current = null
    scheduleStep('appear', GAP_MS)
  }

  function onBoardKey(e: KeyboardEvent<HTMLDivElement>) {
    const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', ' ', 'Escape']
    const digit = e.key >= '1' && e.key <= '9'
    if (!keys.includes(e.key) && !digit) return
    if (e.key === 'Escape') {
      if (phase === 'playing') togglePaused()
      return
    }
    e.preventDefault()
    if (digit) {
      const i = Number(e.key) - 1
      setFocusIdx(i)
      capture(i)
      return
    }
    if (e.key === 'Enter' || e.key === ' ') {
      const fromEl = Number((e.target as HTMLElement).dataset.window)
      capture(Number.isFinite(fromEl) ? fromEl : focusIdx)
      return
    }
    const col = focusIdx % 3
    const row = Math.floor(focusIdx / 3)
    let next = focusIdx
    if (e.key === 'ArrowLeft') next = row * 3 + Math.max(0, col - 1)
    if (e.key === 'ArrowRight') next = row * 3 + Math.min(2, col + 1)
    if (e.key === 'ArrowUp') next = Math.max(0, row - 1) * 3 + col
    if (e.key === 'ArrowDown') next = Math.min(2, row + 1) * 3 + col
    setFocusIdx(next)
    boardRef.current?.querySelector<HTMLButtonElement>(`[data-window="${next}"]`)?.focus()
  }

  return (
    <div>
      {phase === 'ready' && (
        <div>
          <p>Nueve ventanas. Un solo regalo a la vez.</p>
          <p className="mt-1 text-[var(--muted)]">Tocá la ventana antes de que se esconda. Tenés 30 segundos.</p>
          <button type="button" className="btn-cta mt-5" onClick={start}>
            Jugar
          </button>
        </div>
      )}

      {phase !== 'ready' && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="tabular-nums">
            Tiempo {seconds}s · Regalos {score}
          </p>
          <div className="flex flex-wrap gap-2">
            {phase === 'playing' && (
              <button type="button" className="btn-ghost" onClick={togglePaused} aria-pressed={paused}>
                {paused ? 'Continuar' : 'Pausar'}
              </button>
            )}
            <button type="button" className="btn-ghost" onClick={reset}>
              Reiniciar
            </button>
          </div>
        </div>
      )}

      {paused && phase === 'playing' && (
        <p className="mt-3 text-sm" role="status">
          Ronda pausada
        </p>
      )}

      {phase !== 'ready' && (
      <div
        ref={boardRef}
        className={`windows-grid mt-5 ${phase === 'result' ? 'pointer-events-none' : ''}`}
        role="grid"
        aria-label="Ventanas de regalos"
        onKeyDown={onBoardKey}
      >
        {Array.from({ length: WINDOWS }, (_, i) => {
          const isOpen = active === i
          const justCaught = caughtFlash && caughtWindow === i && !isOpen
          return (
            <button
              key={i}
              type="button"
              role="gridcell"
              data-window={i}
              data-open={isOpen ? 'true' : 'false'}
              data-caught={justCaught ? 'true' : 'false'}
              tabIndex={focusIdx === i ? 0 : -1}
              aria-label={`Ventana ${i + 1}${isOpen ? ', con regalo' : ', cerrada'}`}
              disabled={phase !== 'playing' || frozen}
              onFocus={() => setFocusIdx(i)}
              onClick={() => capture(i)}
              className={`window-btn ${reduced ? 'reduced' : ''}`}
            >
              <span className="absolute left-2 top-1 text-xs text-[var(--forest)]">{i + 1}</span>
              <span className="window-inner">
                <span className="window-shutter window-shutter-l" aria-hidden="true" />
                <span className="window-shutter window-shutter-r" aria-hidden="true" />
                <span className="window-gift" aria-hidden="true">
                  <GiftMini />
                </span>
              </span>
            </button>
          )
        })}
      </div>
      )}

      {caughtFlash && phase === 'playing' && (
        <p className="mt-3" role="status">
          ¡Lo encontraste! +1
        </p>
      )}

      {phase === 'result' && (
        <div className="mt-8 motion-on" role="status">
          <p className="font-serif text-2xl">Atrapaste {score} regalos</p>
          <div className="flex gap-6 mt-2 anim-win" aria-hidden="true">
            <span>★</span>
            <span>★</span>
            <span>★</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" className="btn-cta" onClick={start}>
              Otra ronda
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function GiftMini() {
  return (
    <svg width="36" height="36" viewBox="-28 -28 56 56" aria-hidden="true">
      <rect x="-18" y="-8" width="36" height="28" rx="3" fill="#A72C36" />
      <rect x="-21" y="-14" width="42" height="8" rx="2" fill="#C64746" />
      <rect x="-3" y="-14" width="6" height="34" fill="#E7B960" />
      <path d="M0 -14 C-16 -32 -20 -12 0 -14 C16 -32 20 -12 0 -14" stroke="#E7B960" strokeWidth="3" fill="none" />
    </svg>
  )
}
