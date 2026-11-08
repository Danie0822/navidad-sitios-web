/* Propósito: guirnalda de luces navideñas animada, accesible y liviana (solo CSS). */
import { useEffect, useRef, useState } from 'react'

export function LightGarland() {
  const colors = [
    'text-red-500',
    'text-amber-400',
    'text-emerald-400',
    'text-sky-400',
    'text-fuchsia-400',
  ]
  const [count, setCount] = useState(24)
  const hostRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = hostRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width
      // Adaptar número de bombillas según ancho
      const next = w < 420 ? 14 : w < 640 ? 20 : 28
      setCount(next)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const bulbs = Array.from({ length: count })
  return (
    <div className="w-full flex justify-center mt-4" aria-hidden="true" ref={hostRef}>
      <div className="relative w-full max-w-4xl h-14">
        <svg className="absolute inset-x-0 top-6 w-full h-2" viewBox="0 0 100 4" preserveAspectRatio="none">
          <path d="M0 2 C 25 0, 75 4, 100 2" stroke="#14532d" strokeWidth="0.8" fill="none" />
        </svg>
        <ul className="absolute inset-0 flex items-end justify-between px-2">
          {bulbs.map((_, i) => {
            const color = colors[i % colors.length]
            const delay = (i % 6) * 0.15
            const y = 2 + Math.sin((i / bulbs.length) * Math.PI) * 6
            return (
              <li
                key={i}
                className={`relative garland-bulb ${color}`}
                style={{
                  animation: `twinkle 2.1s ease-in-out ${delay}s infinite`,
                  transform: `translateY(${y}px)`,
                }}
              >
                <span className="block w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full translate-y-5 opacity-90"></span>
                <span className="absolute left-1/2 -translate-x-1/2 top-4 block w-1.5 h-2 bg-neutral-700 rounded-t-sm"></span>
              </li>
            )
          })}
        </ul>
        <style>{`
          @keyframes twinkle {
            0%, 100% { opacity: 0.35; filter: brightness(0.9); }
            50% { opacity: 1; filter: brightness(1.1); }
          }
        `}</style>
      </div>
    </div>
  )
}
