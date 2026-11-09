/* Propósito: ilustraciones originales del catálogo (naipes y ventanas), no jugables. */
import type { ReactNode } from 'react'
export function CatalogMemoriaArt() {
  return (
    <svg viewBox="0 0 636 494" className="w-full h-auto block" aria-hidden="true">
      <rect width="636" height="494" fill="#183C32" rx="16" />
      <path d="M40 36 H596" stroke="#E7B960" strokeWidth="3" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <circle key={i} cx={80 + i * 80} cy="36" r="7" fill={i % 2 ? '#A72C36' : '#E7B960'} />
      ))}
      <g transform="translate(150 250) rotate(-12)">
        <g className="anim-card-a">
          <PaperCard>
            <rect x="-22" y="-8" width="40" height="32" rx="3" fill="#A72C36" />
            <rect x="-6" y="-8" width="8" height="32" fill="#E7B960" />
          </PaperCard>
        </g>
      </g>
      <g transform="translate(318 230) rotate(4)">
        <g className="anim-card-b">
          <PaperCard>
            <path d="M-18 12 Q-10 2 -10 -12 A12 12 0 0 1 10 -12 Q10 2 18 12 Z" fill="#E7B960" />
            <circle cy="18" r="4" fill="#A72C36" />
          </PaperCard>
        </g>
      </g>
      <g transform="translate(470 255) rotate(16)">
        <g className="anim-card-a">
          <PaperCard>
            <path d="M0 -24 L7 -6 L26 -5 L11 7 L16 24 L0 14 L-16 24 L-11 7 L-26 -5 L-7 -6 Z" fill="#E7B960" />
          </PaperCard>
        </g>
      </g>
      <path d="M80 430 Q90 420 100 430 Q110 420 120 430" fill="none" stroke="#E7B960" strokeWidth="2" />
      <path d="M500 430 Q512 418 524 430" fill="none" stroke="#E7B960" strokeWidth="2" />
    </svg>
  )
}

export function CatalogRegalosArt() {
  return (
    <svg viewBox="0 0 636 494" className="w-full h-auto block" aria-hidden="true">
      <rect width="636" height="494" fill="#70232F" rx="16" />
      <path d="M48 48 Q180 20 318 48 T588 44" stroke="#E7B960" strokeWidth="3" fill="none" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <circle key={i} cx={90 + i * 90} cy={48 + (i % 2) * 6} r="5" fill={i % 2 ? '#A72C36' : '#E7B960'} />
      ))}
      {Array.from({ length: 9 }, (_, i) => {
        const col = i % 3
        const row = Math.floor(i / 3)
        const x = 78 + col * 180
        const y = 110 + row * 118
        const open = i === 4
        return (
          <g key={i} transform={`translate(${x} ${y})`}>
            <rect width="150" height="100" rx="10" fill="#E9DAC3" />
            <text x="12" y="22" fill="#183C32" fontSize="12" fontFamily="Inter, sans-serif">
              {i + 1}
            </text>
            <g className={open ? undefined : undefined}>
              <rect x="10" y="10" width="130" height="80" rx="6" fill={open ? '#183C32' : '#9E4C46'} />
              {!open && (
                <>
                  <line x1="75" y1="10" x2="75" y2="90" stroke="#E9DAC3" strokeWidth="2" opacity="0.35" />
                  <circle cx="118" cy="28" r="4" fill="#E7B960" />
                </>
              )}
              {open && (
                <g transform="translate(75 58)">
                  <g className="anim-gift-lid">
                    <rect x="-22" y="-8" width="44" height="28" rx="3" fill="#A72C36" />
                    <rect x="-4" y="-14" width="8" height="34" fill="#E7B960" />
                    <path d="M0 -14 C-18 -34 -22 -12 0 -14 C18 -34 22 -12 0 -14" stroke="#E7B960" strokeWidth="3" fill="none" />
                  </g>
                </g>
              )}
            </g>
          </g>
        )
      })}
    </svg>
  )
}

function PaperCard({ children }: { children: ReactNode }) {
  return (
    <>
      <rect x="-70" y="-96" width="140" height="192" rx="10" fill="#FFFAF0" />
      {children}
    </>
  )
}
