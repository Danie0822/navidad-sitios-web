/* Propósito: escena navideña SVG con capas (cielo, luna/estrellas, montañas, villa con casas y árbol, regalos y trineo), animaciones sutiles y paleta cálida nocturna. */
export function ChristmasScene() {
  return (
    <div className="relative mx-auto w-full max-w-6xl">
      <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-[#0b1020]">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1200 675"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0b1020" />
              <stop offset="60%" stopColor="#131b33" />
              <stop offset="100%" stopColor="#1b2542" />
            </linearGradient>
            <linearGradient id="hill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e2a50" />
              <stop offset="100%" stopColor="#0f1833" />
            </linearGradient>
            <linearGradient id="tree" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#276749" />
              <stop offset="100%" stopColor="#1b4d3a" />
            </linearGradient>
          </defs>

          {/* Cielo */}
          <rect x="0" y="0" width="1200" height="675" fill="url(#sky)" />

          {/* Luna */}
          <g className="animate-[drift_14s_ease-in-out_infinite]">
            <circle cx="980" cy="120" r="40" fill="#FDE68A" />
            <circle cx="995" cy="115" r="7" fill="#FCD34D" opacity="0.6" />
            <circle cx="965" cy="130" r="5" fill="#FCD34D" opacity="0.5" />
          </g>

          {/* Estrellas */}
          <g className="opacity-80">
            {Array.from({ length: 120 }).map((_, i) => {
              const x = (i * 87) % 1200
              const y = (i * 53) % 260
              const r = 0.8 + (i % 3) * 0.4
              const delay = (i % 10) * 0.2
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y + 20}
                  r={r}
                  fill="#E5E7EB"
                  style={{ animation: `blink 2.4s ease-in-out ${delay}s infinite` }}
                />
              )
            })}
          </g>

          {/* Montañas lejanas */}
          <g className="animate-[drift_40s_linear_infinite]">
            <path d="M0 360 L120 300 L220 360 L360 290 L480 360 L640 300 L780 360 L920 290 L1100 360 L1200 320 L1200 675 L0 675 Z" fill="#0e1730" opacity="0.85" />
          </g>

          {/* Colina cercana */}
          <g className="animate-[drift_60s_linear_infinite]">
            <path d="M0 440 C240 400, 420 460, 600 440 C780 420, 960 460, 1200 440 L1200 675 L0 675 Z" fill="url(#hill)" />
          </g>

          {/* Villa: casas con ventanas cálidas */}
          <g className="animate-[drift_26s_ease-in-out_infinite]">
            {[
              { x: 160, y: 430, w: 120, h: 70 },
              { x: 340, y: 420, w: 140, h: 80 },
              { x: 540, y: 435, w: 110, h: 65 },
              { x: 720, y: 428, w: 130, h: 75 },
              { x: 900, y: 438, w: 120, h: 68 },
            ].map((h, i) => (
              <g key={i}>
                <rect x={h.x} y={h.y} width={h.w} height={h.h} rx="6" fill="#0c152d" stroke="#243051" />
                {/* Techo */}
                <path d={`M${h.x - 8} ${h.y} L${h.x + h.w / 2} ${h.y - 26} L${h.x + h.w + 8} ${h.y} Z`} fill="#1a2545" />
                {/* Ventanas */}
                {Array.from({ length: 6 }).map((_, j) => {
                  const col = j % 3
                  const row = Math.floor(j / 3)
                  const wx = h.x + 14 + col * ((h.w - 56) / 2)
                  const wy = h.y + 16 + row * 26
                  const ww = 22
                  const wh = 18
                  const o = 0.8 - (j % 3) * 0.2
                  return (
                    <rect
                      key={j}
                      x={wx}
                      y={wy}
                      width={ww}
                      height={wh}
                      rx="3"
                      fill="#F59E0B"
                      opacity={o}
                      style={{ animation: `flicker ${2 + (j % 3)}s ease-in-out ${j * 0.13}s infinite` }}
                    />
                  )
                })}
                {/* Chimenea humo sutil */}
                <g opacity="0.7">
                  <rect x={h.x + h.w - 20} y={h.y - 30} width="10" height="20" fill="#0c152d" />
                  <circle
                    cx={h.x + h.w - 15}
                    cy={h.y - 40}
                    r="6"
                    fill="#94a3b8"
                    opacity="0.35"
                    style={{ animation: 'smoke 3.6s ease-in-out infinite' }}
                  />
                </g>
              </g>
            ))}
          </g>

          {/* Árbol decorado (centrado-derecha, más grande) */}
          <g id="tree-group" transform="translate(860, 410)">
            <g className="animate-[drift_18s_ease-in-out_infinite]">
              <polygon points="0,0 -48,34 48,34" fill="url(#tree)" />
              <polygon points="0,-38 -62,-10 62,-10" fill="url(#tree)" />
              <polygon points="0,-78 -76,-40 76,-40" fill="url(#tree)" />
              <rect x="-12" y="34" width="24" height="18" fill="#8B5E3C" />
              {/* Bolas */}
              {[-42, -18, 12, 36].map((px, i) => (
                <circle
                  key={i}
                  cx={px}
                  cy={-26 - (i % 2) * 18}
                  r="6"
                  fill={i % 2 === 0 ? '#F87171' : '#FBBF24'}
                  style={{ animation: `twinkle 1.8s ease-in-out ${i * 0.2}s infinite` }}
                />
              ))}
              {/* Estrella */}
              <g transform="translate(0,-94)">
                <polygon points="0,-10 4,-3 12,-3 5,3 7,11 0,6 -7,11 -5,3 -12,-3 -4,-3" fill="#FDE68A" />
              </g>
            </g>
          </g>

          {/* Regalos y trineo (visible en primer plano, izquierda media) */}
          <g id="sleigh-group" transform="translate(260, 520)">
            <g className="animate-[drift_30s_linear_infinite]">
              <rect x="0" y="0" width="36" height="26" rx="4" fill="#EF4444" />
              <rect x="40" y="-6" width="30" height="20" rx="4" fill="#10B981" />
              <path d="M-14 30 C 8 40, 52 40, 86 30" stroke="#C084FC" strokeWidth="3" fill="none" />
              {/* Trineo simple */}
              <path d="M120 6 l44 0 l12 14 l-68 0 Z" fill="#9CA3AF" />
              <path d="M114 20 C130 26, 158 26, 182 20" stroke="#9CA3AF" strokeWidth="4" fill="none" />
            </g>
          </g>

          {/* Suelo nieve */}
          <rect x="0" y="630" width="1200" height="45" fill="#e5efff" opacity="0.4" />
        </svg>

        {/* Animaciones CSS locales */}
        <style>{`
          @keyframes blink { 0%, 100% { opacity: 0.6 } 50% { opacity: 1 } }
          @keyframes flicker { 0%, 100% { opacity: 0.7 } 50% { opacity: 1 } }
          @keyframes smoke { 0% { transform: translateY(0); opacity: 0.4 } 100% { transform: translateY(-18px); opacity: 0 } }
          @keyframes drift { 0%, 100% { transform: translateX(0px) } 50% { transform: translateX(6px) } }
        `}</style>
      </div>
    </div>
  )
}
