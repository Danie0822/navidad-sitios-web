/* Propósito: escena SVG aprobada (arco granate con villa de papel recortado). Sin dependencia externa. */
export function ChristmasSceneScout() {
  // El SVG usa viewBox 0 0 600 620 (arco). Animaciones menores pueden añadirse fuera.
  return (
    <svg
      viewBox="0 0 600 620"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Villa navideña en arco"
      className="w-full h-full"
    >
      <defs>
        <clipPath id="arch">
          <path d="M0 620 V288 A300 288 0 0 1 600 288 V620 Z" />
        </clipPath>
      </defs>
      <g clipPath="url(#arch)">
        <path d="M0 620 V288 A300 288 0 0 1 600 288 V620 Z" fill="#70232F" />
        <path d="M0 390 Q135 235 305 365 T600 350 V620 H0 Z" fill="#88303A" />
        {/* luna */}
        <circle cx="450" cy="160" r="45" fill="#E7B960" />
        <circle cx="465" cy="144" r="42" fill="#70232F" />
        {/* estrellas (subset) */}
        <circle cx="269" cy="409" r="1.6" fill="#F7F1E5" opacity=".65" />
        <circle cx="550" cy="44" r="1.6" fill="#F7F1E5" opacity=".65" />
        <circle cx="263" cy="362" r="1.2" fill="#F7F1E5" opacity=".65" />
        <circle cx="168" cy="87" r="1.6" fill="#F7F1E5" opacity=".65" />
        <circle cx="564" cy="82" r="2" fill="#F7F1E5" opacity=".65" />
        <circle cx="263" cy="36" r="2" fill="#F7F1E5" opacity=".65" />
        <path d="M125 151 Q127 158 134 160 Q127 162 125 169 Q123 162 116 160 Q123 158 125 151" fill="#E7B960"/>
        <path d="M337 78 Q339 83 344 85 Q339 87 337 92 Q335 87 330 85 Q335 83 337 78" fill="#E7B960"/>
        <path d="M510 272 Q512 277 517 279 Q512 281 510 286 Q508 281 503 279 Q508 277 510 272" fill="#E7B960"/>

        {/* colinas y nieve */}
        <path d="M0 478 Q140 402 324 451 T600 457 V620 H0 Z" fill="#DDCDB7" />
        <path d="M0 541 Q164 476 313 509 T600 503 V620 H0 Z" fill="#F6EBDD"/>
        <path d="M291 620 Q423 562 351 503 Q467 543 397 620" fill="#DFD0B9"/>
        <path d="M0 606 Q145 572 259 607 T600 590 V620 H0 Z" fill="#FFFAF0"/>

        {/* árboles */}
        <g transform="translate(87 454) scale(0.72)">
          <rect x="-6" y="0" width="12" height="35" fill="#876548" />
          <path d="M0 -188 Q-23.4 -125 -52 -80 Q0 -66 52 -80 Q23.4 -125 0 -188" fill="#245345"/>
          <path d="M0 -151 Q-32.85 -88 -73 -43 Q0 -29 73 -43 Q32.85 -88 0 -151" fill="#1D493D"/>
          <path d="M0 -106 Q-41.85 -43 -93 2 Q0 16 93 2 Q41.85 -43 0 -106" fill="#153E33"/>
          <path d="M0 -207 Q2 -195 14 -193 Q2 -191 0 -179 Q-2 -191 -14 -193 Q-2 -195 0 -207" fill="#E7B960"/>
          <circle cx="-17" cy="-124" r="5" fill="#E7B960"/>
          <circle cx="25" cy="-89" r="5" fill="#E7B960"/>
          <circle cx="-35" cy="-57" r="5" fill="#E7B960"/>
          <circle cx="17" cy="-32" r="5" fill="#E7B960"/>
          <circle cx="-48" cy="-2" r="5" fill="#E7B960"/>
          <circle cx="48" cy="4" r="5" fill="#E7B960"/>
        </g>
        <g id="tree-group" transform="translate(345 466) scale(1.42)">
          <rect x="-6" y="0" width="12" height="35" fill="#876548" />
          <path d="M0 -188 Q-23.4 -125 -52 -80 Q0 -66 52 -80 Q23.4 -125 0 -188" fill="#245345"/>
          <path d="M0 -151 Q-32.85 -88 -73 -43 Q0 -29 73 -43 Q32.85 -88 0 -151" fill="#1D493D"/>
          <path d="M0 -106 Q-41.85 -43 -93 2 Q0 16 93 2 Q41.85 -43 0 -106" fill="#153E33"/>
          <path d="M0 -207 Q2 -195 14 -193 Q2 -191 0 -179 Q-2 -191 -14 -193 Q-2 -195 0 -207" fill="#E7B960"/>
          <circle cx="-17" cy="-124" r="5" fill="#E7B960"/>
          <circle cx="25" cy="-89" r="5" fill="#E7B960"/>
          <circle cx="-35" cy="-57" r="5" fill="#E7B960"/>
          <circle cx="17" cy="-32" r="5" fill="#E7B960"/>
          <circle cx="-48" cy="-2" r="5" fill="#E7B960"/>
          <circle cx="48" cy="4" r="5" fill="#E7B960"/>
        </g>
        <g transform="translate(32 573) scale(0.7)">
          <rect x="-6" y="0" width="12" height="35" fill="#876548" />
          <path d="M0 -188 Q-23.4 -125 -52 -80 Q0 -66 52 -80 Q23.4 -125 0 -188" fill="#245345"/>
          <path d="M0 -151 Q-32.85 -88 -73 -43 Q0 -29 73 -43 Q32.85 -88 0 -151" fill="#1D493D"/>
          <path d="M0 -106 Q-41.85 -43 -93 2 Q0 16 93 2 Q41.85 -43 0 -106" fill="#153E33"/>
          <path d="M0 -207 Q2 -195 14 -193 Q2 -191 0 -179 Q-2 -191 -14 -193 Q-2 -195 0 -207" fill="#E7B960"/>
          <circle cx="-17" cy="-124" r="5" fill="#E7B960"/>
          <circle cx="25" cy="-89" r="5" fill="#E7B960"/>
          <circle cx="-35" cy="-57" r="5" fill="#E7B960"/>
          <circle cx="17" cy="-32" r="5" fill="#E7B960"/>
          <circle cx="-48" cy="-2" r="5" fill="#E7B960"/>
          <circle cx="48" cy="4" r="5" fill="#E7B960"/>
        </g>

        {/* casas */}
        <g transform="translate(166 480) scale(0.85)">
          <rect x="-49" y="-72" width="98" height="88" rx="3" fill="#CC8367" />
          <rect x="23" y="-123" width="14" height="43" rx="2" fill="#E9CDB1" />
          <path d="M-64 -69 L0 -128 L64 -69 Z" fill="#F6EBDD"/>
          <path d="M-55 -67 L0 -113 L55 -67 Z" fill="#6F3334"/>
          <rect x="-11" y="-31" width="22" height="47" rx="11" fill="#623F32" />
          <rect x="-35" y="-53" width="16" height="23" rx="3" fill="#E7B960" />
          <path d="M-27 -53 V-30 M-35 -42 H-19" stroke="#7F4D3D" strokeWidth="2"/>
          <rect x="20" y="-53" width="16" height="23" rx="3" fill="#E7B960" />
          <path d="M28 -53 V-30 M20 -42 H36" stroke="#7F4D3D" strokeWidth="2"/>
          <path d="M-53 16 Q0 5 55 16" stroke="#FFF5E7" strokeWidth="8" fill="none"/>
        </g>
        <g transform="translate(458 470) scale(0.95)">
          <rect x="-49" y="-72" width="98" height="88" rx="3" fill="#B6554F" />
          <rect x="23" y="-123" width="14" height="43" rx="2" fill="#E9CDB1" />
          <path d="M-64 -69 L0 -128 L64 -69 Z" fill="#F6EBDD"/>
          <path d="M-55 -67 L0 -113 L55 -67 Z" fill="#6F3334"/>
          <rect x="-11" y="-31" width="22" height="47" rx="11" fill="#623F32" />
          <rect x="-35" y="-53" width="16" height="23" rx="3" fill="#E7B960" />
          <path d="M-27 -53 V-30 M-35 -42 H-19" stroke="#7F4D3D" strokeWidth="2"/>
          <rect x="20" y="-53" width="16" height="23" rx="3" fill="#E7B960" />
          <path d="M28 -53 V-30 M20 -42 H36" stroke="#7F4D3D" strokeWidth="2"/>
          <path d="M-53 16 Q0 5 55 16" stroke="#FFF5E7" strokeWidth="8" fill="none"/>
        </g>

        {/* regalos */}
        <g id="gift-group" transform="translate(204 542) scale(1)">
          <rect x="0" y="0" width="50" height="43" rx="3" fill="#A72C36" />
          <rect x="-3" y="-3" width="56" height="11" rx="2" fill="#C64746" />
          <rect x="20" y="-3" width="9" height="46" fill="#E7B960" />
          <path d="M24 -3 C-10 -30 3 -38 24 -3 C57 -35 59 -18 24 -3" stroke="#E7B960" strokeWidth="4" fill="none"/>
        </g>
        <g transform="translate(260 563) scale(0.7)">
          <rect x="0" y="0" width="50" height="43" rx="3" fill="#A72C36" />
          <rect x="-3" y="-3" width="56" height="11" rx="2" fill="#C64746" />
          <rect x="20" y="-3" width="9" height="46" fill="#E7B960" />
          <path d="M24 -3 C-10 -30 3 -38 24 -3 C57 -35 59 -18 24 -3" stroke="#E7B960" strokeWidth="4" fill="none"/>
        </g>
      </g>
      {/* Borde dorado del arco */}
      <path d="M12 608 V288 A288 276 0 0 1 588 288 V608" stroke="#E7B960" strokeOpacity=".42" strokeWidth="1" fill="none"/>
    </svg>
  )
}
