/* Propósito: efecto de nieve decorativa en canvas, no intercepta eventos y respeta reduced-motion. */
import { useEffect, useRef } from 'react'

export function Snowfall() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    const cnv = canvasRef.current
    if (!cnv || prefersReduced) return
    const c = cnv as HTMLCanvasElement
    const ctx = c.getContext('2d') as CanvasRenderingContext2D
    let animationFrameId = 0
    let running = true
    const dpr = Math.max(1, window.devicePixelRatio || 1)

    const flakes = createFlakes(120)

    function resize() {
      const { innerWidth: w, innerHeight: h } = window
      c.width = Math.floor(w * dpr)
      c.height = Math.floor(h * dpr)
      c.style.width = `${w}px`
      c.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const last = { t: performance.now() }
    function frame(t: number) {
      if (!running) return
      const dt = Math.min(0.033, (t - last.t) / 1000)
      last.t = t
      ctx.clearRect(0, 0, c.width, c.height)
      for (const f of flakes) {
        f.y += f.speed * dt
        f.x += Math.sin((t / 1000) * f.swingSpeed + f.seed) * f.swingAmp * dt
        if (f.y > window.innerHeight + 8) {
          f.y = -8
          f.x = Math.random() * window.innerWidth
        }
        drawFlake(ctx, f.x, f.y, f.size)
      }
      animationFrameId = requestAnimationFrame(frame)
    }
    animationFrameId = requestAnimationFrame(frame)

    return () => {
      running = false
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resize)
    }
  }, [prefersReduced])

  if (prefersReduced) return null
  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-10"
    />
  )
}

type Flake = {
  x: number
  y: number
  size: number
  speed: number
  swingAmp: number
  swingSpeed: number
  seed: number
}

function createFlakes(n: number): Flake[] {
  const flakes: Flake[] = []
  for (let i = 0; i < n; i++) {
    flakes.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: 1 + Math.random() * 2.5,
      speed: 30 + Math.random() * 45,
      swingAmp: 20 + Math.random() * 30,
      swingSpeed: 1 + Math.random() * 2,
      seed: Math.random() * Math.PI * 2,
    })
  }
  return flakes
}

function drawFlake(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
}

function usePrefersReducedMotion() {
  const mq = '(prefers-reduced-motion: reduce)'
  const mql = typeof window !== 'undefined' ? window.matchMedia(mq) : null
  const initial = !!mql?.matches
  const ref = useRef(initial)
  useEffect(() => {
    if (!mql) return
    const handler = (e: MediaQueryListEvent) => {
      ref.current = e.matches
    }
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [mql])
  return ref.current
}
