/* Propósito: guirnalda de luces navideñas animada, accesible y liviana (solo CSS). */
export function LightGarland() {
  const colors = [
    'text-red-500',
    'text-amber-400',
    'text-emerald-400',
    'text-sky-400',
    'text-fuchsia-400',
  ]
  const bulbs = Array.from({ length: 24 })
  return (
    <div className="w-full flex justify-center mt-4" aria-hidden="true">
      <div className="relative w-full max-w-4xl h-12">
        <div className="absolute inset-x-0 top-4 h-0.5 bg-green-800/50 rounded-full"></div>
        <ul className="absolute inset-0 flex items-end justify-between px-1">
          {bulbs.map((_, i) => {
            const color = colors[i % colors.length]
            const delay = (i % 6) * 0.15
            return (
              <li
                key={i}
                className={`garland-bulb ${color}`}
                style={{
                  animation: `twinkle 1.8s ease-in-out ${delay}s infinite`,
                }}
              >
                <span className="block w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full translate-y-4"></span>
              </li>
            )
          })}
        </ul>
        <style>{`
          @keyframes twinkle {
            0%, 100% { opacity: 0.4; filter: brightness(0.9); }
            50% { opacity: 1; filter: brightness(1.2); }
          }
        `}</style>
      </div>
    </div>
  )
}
