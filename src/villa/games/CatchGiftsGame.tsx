/* Propósito: minijuego de atrapar regalos con teclado y táctil, puntaje y reinicio limpio. */
import { useEffect, useRef, useState } from 'react'

type Gift = { x: number; y: number; vy: number; caught: boolean; id: number }

export function CatchGiftsGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [score, setScore] = useState(0)
  const [running, setRunning] = useState(true)
  const player = useRef({ x: 160 }) // en px relativos al ancho lógico
  const rafRef = useRef<number | null>(null)
  const giftsRef = useRef<Gift[]>([])
  const idCounter = useRef(1)
  const dprRef = useRef(1)

  useEffect(() => {
    const cnv = canvasRef.current
    if (!cnv) return
    const c = cnv as HTMLCanvasElement
    const ctx = c.getContext('2d') as CanvasRenderingContext2D
    const dpr = Math.max(1, window.devicePixelRatio || 1)
    dprRef.current = dpr

    function resize() {
      const w = Math.min(640, window.innerWidth - 32)
      const h = Math.min(420, Math.round(w * 0.65))
      c.width = Math.floor(w * dpr)
      c.height = Math.floor(h * dpr)
      c.style.width = `${w}px`
      c.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const state = {
      lastT: performance.now(),
      spawnAccum: 0,
    }

    function spawnGift() {
      const params = new URLSearchParams(window.location.search)
      const testMode = params.get('test') === '1'
      giftsRef.current.push({
        id: idCounter.current++,
        x: testMode ? player.current.x : 20 + Math.random() * (c.width / dpr - 40),
        y: -20,
        vy: testMode ? 200 : 60 + Math.random() * 80,
        caught: false,
      })
    }

    function loop(t: number) {
      if (!running) return
      const dt = Math.min(0.033, (t - state.lastT) / 1000)
      state.lastT = t
      state.spawnAccum += dt
      if (state.spawnAccum > 0.8) {
        state.spawnAccum = 0
        spawnGift()
      }

      ctx.clearRect(0, 0, c.width, c.height)
      // Fondo
      const W = c.width / dpr
      const H = c.height / dpr
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, W, H)

      // Actualizar regalos
      const basketW = 70
      const basketH = 16
      const bx = player.current.x - basketW / 2
      const by = H - 24
      giftsRef.current.forEach((g) => {
        g.y += g.vy * dt
        // Colisión simple AABB con canasta
        if (!g.caught && g.y + 12 >= by && g.y <= by + basketH && g.x + 12 >= bx && g.x - 12 <= bx + basketW) {
          g.caught = true // evitar doble cobro
          setScore((s) => s + 1)
        }
      })
      // Dibujar regalos
      for (const g of giftsRef.current) {
        if (g.caught) continue
        if (g.y > H + 20) continue
        ctx.fillStyle = '#ef4444'
        ctx.beginPath()
        ctx.arc(g.x, g.y, 12, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#f59e0b'
        ctx.fillRect(g.x - 16, g.y - 2, 32, 4)
      }
      // Dibujar canasta
      ctx.fillStyle = '#16a34a'
      ctx.fillRect(bx, by, basketW, basketH)
      // Marcador
      ctx.fillStyle = '#111827'
      ctx.font = 'bold 14px system-ui, sans-serif'
      ctx.fillText(`Puntos: ${score}`, 10, 18)

      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') player.current.x = Math.max(20, player.current.x - 24)
      if (e.key === 'ArrowRight') player.current.x = Math.min(c.width / dpr - 20, player.current.x + 24)
    }
    window.addEventListener('keydown', onKey)

    function onPointer(e: PointerEvent) {
      const rect = c.getBoundingClientRect()
      const x = e.clientX - rect.left
      player.current.x = Math.max(20, Math.min(x, rect.width - 20))
    }
    c.addEventListener('pointerdown', onPointer)
    c.addEventListener('pointermove', (e) => {
      if (e.pressure > 0) onPointer(e)
    })

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('keydown', onKey)
      c.removeEventListener('pointerdown', onPointer)
    }
  }, [running, score])

  function reset() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    giftsRef.current = []
    idCounter.current = 1
    setScore(0)
    setRunning(true)
  }

  return (
    <section aria-labelledby="heading-atrapa">
      <div className="flex items-center justify-between gap-3">
        <h3 id="heading-atrapa" className="text-2xl font-semibold">Atrapa regalos</h3>
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
      <div className="mt-3 overflow-auto">
        <canvas
          ref={canvasRef}
          className="rounded-lg border border-neutral-200 dark:border-neutral-800 touch-none bg-white"
          aria-label="Juego atrapar regalos"
        />
        <p className="mt-2 text-xs text-neutral-500">Mueve con ← → o arrastra/toca la zona del juego.</p>
      </div>
    </section>
  )
}
