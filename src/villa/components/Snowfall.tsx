/* Propósito: nieve continua confinada al contenedor; rAF sin setState y pausa fuera de vista. */
import { useEffect, useRef } from 'react'
import { useMotion } from '../motion/MotionContext'
import { useInView } from '../motion/useInView'

type Flake = {
  x: number
  y: number
  size: number
  speed: number
  swingAmp: number
  swingSpeed: number
  seed: number
}

export function SnowfallBox({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const { freeze, reduced } = useMotion()
  const inView = useInView(hostRef)
  const freezeRef = useRef(freeze)
  freezeRef.current = freeze || !inView

  useEffect(() => {
    const hostEl = hostRef.current
    const cnv = canvasRef.current
    if (!hostEl || !cnv || reduced) return
    const ctx = cnv.getContext('2d')
    if (!ctx) return
    const dpr = Math.max(1, window.devicePixelRatio || 1)
    let running = true
    let raf = 0
    let w = 0
    let h = 0

    function sizeFromHost() {
      const rect = hostEl!.getBoundingClientRect()
      cnv!.width = Math.floor(rect.width * dpr)
      cnv!.height = Math.floor(rect.height * dpr)
      cnv!.style.width = '100%'
      cnv!.style.height = '100%'
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      w = rect.width
      h = rect.height
    }

    sizeFromHost()
    const count = window.matchMedia('(max-width: 767px)').matches ? 8 : 18
    const flakes = createLocalFlakes(count, w, h)

    const ro = new ResizeObserver(() => sizeFromHost())
    ro.observe(hostEl)

    const last = { t: performance.now() }
    function frame(t: number) {
      if (!running) return
      const dt = Math.min(0.033, (t - last.t) / 1000)
      last.t = t
      if (!freezeRef.current) {
        ctx!.clearRect(0, 0, cnv!.width, cnv!.height)
        for (const f of flakes) {
          f.y += f.speed * dt
          f.x += Math.sin((t / 1000) * f.swingSpeed + f.seed) * f.swingAmp * dt
          if (f.y > h + 8) {
            f.y = -8
            f.x = Math.random() * w
          }
          if (f.x < -8) f.x = w + 8
          if (f.x > w + 8) f.x = -8
          drawFlake(ctx!, f.x, f.y, f.size)
        }
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [reduced])

  if (reduced) return <div ref={hostRef} className={className} style={style} aria-hidden="true" />
  return (
    <div ref={hostRef} className={className} style={style} aria-hidden="true">
      <canvas ref={canvasRef} className="snow-canvas pointer-events-none" />
    </div>
  )
}

function createLocalFlakes(n: number, w: number, h: number): Flake[] {
  const flakes: Flake[] = []
  for (let i = 0; i < n; i++) {
    flakes.push({
      x: Math.random() * w,
      y: Math.random() * h,
      size: 1 + Math.random() * 2.2,
      speed: 22 + Math.random() * 28,
      swingAmp: 12 + Math.random() * 18,
      swingSpeed: 0.6 + Math.random() * 1.2,
      seed: Math.random() * Math.PI * 2,
    })
  }
  return flakes
}

function drawFlake(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.fillStyle = 'rgba(255,250,240,0.92)'
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
}
