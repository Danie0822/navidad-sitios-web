/* Propósito: minijuego de memoria de parejas navideñas con puntaje y reinicio. */
import { useEffect, useMemo, useRef, useState } from 'react'
import type React from 'react'
import { IconArbol, IconCampana, IconCopos, IconEstrella, IconRegalo } from '../icons/Navidad'

type CardKind = 'arbol' | 'regalo' | 'campana' | 'copo' | 'estrella' | 'arbol2' | 'regalo2' | 'estrella2'
type Card = { id: number; kind: CardKind; matched: boolean }

const ICONS: Record<CardKind, React.ReactNode> = {
  arbol: <IconArbol className="w-7 h-7" aria-hidden="true" />,
  arbol2: <IconArbol className="w-7 h-7" aria-hidden="true" />,
  regalo: <IconRegalo className="w-7 h-7" aria-hidden="true" />,
  regalo2: <IconRegalo className="w-7 h-7" aria-hidden="true" />,
  campana: <IconCampana className="w-7 h-7" aria-hidden="true" />,
  copo: <IconCopos className="w-7 h-7" aria-hidden="true" />,
  estrella: <IconEstrella className="w-7 h-7" aria-hidden="true" />,
  estrella2: <IconEstrella className="w-7 h-7" aria-hidden="true" />,
}

function makeDeck(): Card[] {
  const kinds: CardKind[] = ['arbol', 'regalo', 'campana', 'copo', 'estrella', 'arbol2', 'regalo2', 'estrella2']
  const deck: Card[] = []
  let id = 1
  for (const k of kinds) {
    deck.push({ id: id++, kind: k, matched: false })
    deck.push({ id: id++, kind: k, matched: false })
  }
  // Mezclar
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

export function MemoryGame() {
  const [deck, setDeck] = useState<Card[]>(() => makeDeck())
  const [selected, setSelected] = useState<number[]>([])
  const [lock, setLock] = useState(false)
  const [score, setScore] = useState(0)
  const timeoutRef = useRef<number | null>(null)

  const finished = useMemo(() => deck.every((c) => c.matched), [deck])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    }
  }, [])

  function reset() {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    timeoutRef.current = null
    setDeck(makeDeck())
    setSelected([])
    setLock(false)
    setScore(0)
  }

  function onCardClick(idx: number) {
    if (lock) return
    const card = deck[idx]
    if (card.matched) return
    if (selected.includes(idx)) return // no usar dos veces la misma carta

    const next = [...selected, idx]
    setSelected(next)
    if (next.length === 2) {
      setLock(true)
      const [a, b] = next
      if (deck[a].kind === deck[b].kind && a !== b) {
        // match válido
        setDeck((d) => {
          const n = d.slice()
          n[a] = { ...n[a], matched: true }
          n[b] = { ...n[b], matched: true }
          return n
        })
        setScore((s) => s + 10)
        setSelected([])
        setLock(false)
      } else {
        // volteo tras un pequeño lapso
        timeoutRef.current = window.setTimeout(() => {
          setSelected([])
          setLock(false)
        }, 800)
      }
    }
  }

  return (
    <section aria-labelledby="heading-memoria">
      <div className="flex items-center justify-between gap-3">
        <h3 id="heading-memoria" className="text-2xl font-semibold">Memoria navideña</h3>
        <div className="flex items-center gap-4">
          <span className="text-sm">Puntaje: <strong>{score}</strong></span>
          <button
            type="button"
            onClick={reset}
            className="rounded-md border px-3 py-1.5 focus:outline-none focus-visible:ring-2 ring-neutral-400"
          >
            Reiniciar
          </button>
        </div>
      </div>
      <div
        className="mt-4 grid grid-cols-4 sm:grid-cols-6 gap-3 sm:gap-4"
        role="grid"
        aria-label="Tablero de memoria"
      >
        {deck.map((card, idx) => {
          const isOpen = selected.includes(idx) || card.matched
          return (
            <button
              key={card.id}
              type="button"
              role="gridcell"
              aria-pressed={isOpen}
              aria-label={isOpen ? 'Abierta' : 'Cerrada'}
              onClick={() => onCardClick(idx)}
              className={`aspect-square rounded-lg border select-none focus:outline-none focus-visible:ring-2 ring-red-400
                ${isOpen ? 'bg-white dark:bg-neutral-800 border-emerald-300 dark:border-emerald-700' : 'bg-red-100 dark:bg-neutral-800 border-red-200 dark:border-neutral-700'}
              `}
              disabled={lock && !isOpen && selected.length === 2}
            >
              <div className="flex items-center justify-center h-full text-red-700 dark:text-red-300">
                {isOpen ? ICONS[card.kind] : <span className="sr-only">Carta cerrada</span>}
              </div>
            </button>
          )
        })}
      </div>
      {finished && <p className="mt-3 text-emerald-700 dark:text-emerald-300">¡Completado! Pulsa Reiniciar para jugar de nuevo.</p>}
    </section>
  )
}
