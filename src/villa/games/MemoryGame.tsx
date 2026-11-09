/* Propósito: memoria 8 siluetas × 2 IDs, máximo dos pendientes, pausa y teclado. */
import { useEffect, useMemo, useRef, useState } from 'react'
import { MEMORY_SYMBOLS, DorsoEstrella, type MemorySymbolId } from '../icons/Silhouettes'
import { shuffle } from '../utils/shuffle'
import { useMotion } from '../motion/MotionContext'

type MemoryCard = { uid: number; symbol: MemorySymbolId }

function makeDeck(): MemoryCard[] {
  const pairs = MEMORY_SYMBOLS.flatMap((s) => [
    { uid: 0, symbol: s.id },
    { uid: 0, symbol: s.id },
  ])
  const shuffled = shuffle(pairs)
  return shuffled.map((c, i) => ({ ...c, uid: i + 1 }))
}

export function MemoryGame() {
  const { paused, hidden, togglePaused, reduced } = useMotion()
  const frozen = paused || hidden
  const [deck, setDeck] = useState<MemoryCard[]>(() => makeDeck())
  const [open, setOpen] = useState<number[]>([])
  const [matched, setMatched] = useState<Set<MemorySymbolId>>(() => new Set())
  const [pairs, setPairs] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [lock, setLock] = useState(false)
  const closeTimer = useRef<number | null>(null)
  const remainMs = useRef(0)
  const pendingClose = useRef<number[] | null>(null)

  const finished = pairs === 8
  const frozenRef = useRef(frozen)
  frozenRef.current = frozen

  useEffect(() => {
    return () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current)
    }
  }, [])

  useEffect(() => {
    if (frozen) {
      if (closeTimer.current) {
        window.clearTimeout(closeTimer.current)
        closeTimer.current = null
      }
      return
    }
    if (pendingClose.current) {
      const ids = pendingClose.current
      closeTimer.current = window.setTimeout(() => {
        setOpen((cur) => (cur[0] === ids[0] && cur[1] === ids[1] ? [] : cur))
        setLock(false)
        pendingClose.current = null
      }, remainMs.current || 800)
    }
  }, [frozen])

  function clearTimers() {
    if (closeTimer.current) window.clearTimeout(closeTimer.current)
    closeTimer.current = null
    pendingClose.current = null
    remainMs.current = 0
  }

  function reset() {
    clearTimers()
    setDeck(makeDeck())
    setOpen([])
    setMatched(new Set())
    setPairs(0)
    setAttempts(0)
    setLock(false)
  }

  function onCard(idx: number) {
    if (frozen || finished) return
    if (lock) return
    const card = deck[idx]
    if (matched.has(card.symbol)) return
    if (open.includes(idx)) return
    if (open.length >= 2) return

    const next = [...open, idx]
    setOpen(next)
    if (next.length < 2) return

    setLock(true)
    setAttempts((n) => n + 1)
    const [a, b] = next
    if (deck[a].symbol === deck[b].symbol && a !== b) {
      const symbol = deck[a].symbol
      setMatched((s) => new Set(s).add(symbol))
      setPairs((n) => n + 1)
      setOpen([])
      setLock(false)
    } else {
      pendingClose.current = next
      remainMs.current = 800
      closeTimer.current = window.setTimeout(() => {
        if (frozenRef.current) return
        setOpen([])
        setLock(false)
        pendingClose.current = null
      }, 800)
    }
  }

  const live = useMemo(() => {
    if (finished) return `¡Ocho parejas, una Navidad! ${attempts} intentos.`
    if (frozen) return 'Partida pausada'
    return `Parejas ${pairs} de 8. ${attempts} intentos.`
  }, [finished, frozen, pairs, attempts])

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="tabular-nums">
          Parejas {pairs}/8 · Intentos {attempts}
        </p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-ghost" onClick={togglePaused} aria-pressed={paused}>
            {paused ? 'Continuar' : 'Pausar'}
          </button>
          <button type="button" className="btn-ghost" onClick={reset}>
            Reiniciar
          </button>
        </div>
      </div>
      {frozen && !finished && (
        <p className="mt-3 text-sm" role="status">
          Partida pausada
        </p>
      )}
      <div className="sr-only" aria-live="polite">
        {live}
      </div>

      <div className="mt-5 memory-grid" role="grid" aria-label="Tablero de memoria">
        {deck.map((card, idx) => {
          const isMatched = matched.has(card.symbol)
          const isOpen = isMatched || open.includes(idx)
          const meta = MEMORY_SYMBOLS.find((s) => s.id === card.symbol)!
          const Icon = meta.Icon
          return (
            <button
              key={card.uid}
              type="button"
              role="gridcell"
              data-symbol={card.symbol}
              data-open={isOpen ? 'true' : 'false'}
              data-matched={isMatched ? 'true' : 'false'}
              aria-pressed={isOpen}
              aria-label={isOpen ? `Carta ${idx + 1}, ${meta.label}` : `Carta ${idx + 1}, boca abajo`}
              disabled={frozen || (lock && !isOpen)}
              onClick={() => onCard(idx)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onCard(idx)
                }
              }}
              className={`memory-cell ${isMatched ? 'memory-hit' : ''}`}
            >
              <div className="memory-face" style={reduced ? { transform: isOpen ? 'rotateY(180deg)' : 'none', transition: 'none' } : undefined}>
                <div className="memory-front">
                  <DorsoEstrella className="w-8 h-8" />
                </div>
                <div className="memory-back">
                  <Icon className="w-[72%] h-[72%]" />
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {finished && (
        <div className="mt-8 motion-on" role="status">
          <p className="font-serif text-2xl">¡Ocho parejas, una Navidad!</p>
          <p className="mt-1 tabular-nums">{attempts} intentos.</p>
          <div className="flex gap-6 mt-2 anim-win" aria-hidden="true">
            <span>★</span>
            <span>★</span>
            <span>★</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" className="btn-cta" onClick={reset}>
              Jugar de nuevo
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
