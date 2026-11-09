/* Propósito: siluetas SVG originales de memoria (8 IDs inequívocos) y piezas de plantillas. */
import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { title?: string }

const common: SVGProps<SVGSVGElement> = {
  viewBox: '-36 -40 72 80',
  fill: 'none',
  strokeLinejoin: 'round',
  strokeLinecap: 'round',
  'aria-hidden': true,
}

export function SilhouetteRegalo(props: IconProps) {
  return (
    <svg {...common} {...props}>
      <rect x="-22" y="-13" width="44" height="36" rx="3" fill="#A72C36" />
      <rect x="-26" y="-18" width="52" height="10" rx="2" fill="#A72C36" />
      <rect x="-4" y="-18" width="8" height="41" fill="#E7B960" />
      <path d="M0 -18 C-29 -48 -34 -18 0 -18 C29 -48 34 -18 0 -18" stroke="#E7B960" strokeWidth="5" />
    </svg>
  )
}

export function SilhouetteCampana(props: IconProps) {
  return (
    <svg {...common} {...props}>
      <path d="M-23 14 Q-14 3 -14 -12 A14 14 0 0 1 14 -12 Q14 3 23 14 Z" fill="#E7B960" stroke="#A72C36" strokeWidth="3" />
      <circle cy="20" r="5" fill="#A72C36" />
      <path d="M0 -31 V-25" stroke="#A72C36" strokeWidth="5" />
    </svg>
  )
}

export function SilhouetteBaston(props: IconProps) {
  return (
    <svg {...common} {...props}>
      <path d="M-5 28 V-16 C-5 -42 28 -37 23 -13" stroke="#A72C36" strokeWidth="13" />
      <path d="M-10 -10 L0 -5 M-10 8 L0 13 M-10 24 L0 29 M3 -28 L12 -21" stroke="#FFFAF0" strokeWidth="5" />
    </svg>
  )
}

export function SilhouetteGuante(props: IconProps) {
  return (
    <svg {...common} {...props}>
      <path d="M-18 16 V-19 Q-18 -34 -7 -32 Q2 -32 2 -20 V-4 L9 -14 Q18 -22 23 -12 Q27 -4 17 8 L8 23 H-18 Z" fill="#A72C36" />
      <rect x="-22" y="16" width="34" height="13" rx="3" fill="#E7B960" />
    </svg>
  )
}

export function SilhouetteEstrella(props: IconProps) {
  return (
    <svg {...common} {...props}>
      <path
        d="M0 -30 L9 -10 L31 -8 L15 7 L20 29 L0 18 L-20 29 L-15 7 L-31 -8 L-9 -10 Z"
        fill="#E7B960"
        stroke="#A72C36"
        strokeWidth="2"
      />
    </svg>
  )
}

export function SilhouetteLuna(props: IconProps) {
  return (
    <svg {...common} {...props}>
      <path d="M15 -27 A30 30 0 1 0 28 17 A29 29 0 0 1 15 -27" fill="#E7B960" />
    </svg>
  )
}

export function SilhouetteMedia(props: IconProps) {
  return (
    <svg {...common} {...props}>
      <path d="M-12 -25 H12 V9 Q29 13 24 26 Q20 37 6 31 L-14 22 Q-21 18 -12 4 Z" fill="#A72C36" />
      <rect x="-17" y="-29" width="34" height="12" rx="3" fill="#FFFAF0" />
    </svg>
  )
}

export function SilhouetteCasa(props: IconProps) {
  return (
    <svg {...common} {...props}>
      <rect x="-22" y="-8" width="44" height="36" rx="2" fill="#A72C36" />
      <path d="M-30 -6 L0 -32 L30 -6 Z" fill="#183C32" />
      <rect x="-5" y="6" width="10" height="22" rx="2" fill="#E7B960" />
      <rect x="-16" y="-2" width="8" height="10" rx="1" fill="#E7B960" />
      <rect x="9" y="-2" width="8" height="10" rx="1" fill="#E7B960" />
    </svg>
  )
}

export function DorsoEstrella(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M12 3.2 Q12.8 8 16.8 8.8 Q12.8 9.6 12 14.4 Q11.2 9.6 7.2 8.8 Q11.2 8 12 3.2"
        fill="#E7B960"
      />
    </svg>
  )
}

export const MEMORY_SYMBOLS = [
  { id: 'regalo', label: 'regalo', Icon: SilhouetteRegalo },
  { id: 'campana', label: 'campana', Icon: SilhouetteCampana },
  { id: 'baston', label: 'bastón de caramelo', Icon: SilhouetteBaston },
  { id: 'guante', label: 'guante', Icon: SilhouetteGuante },
  { id: 'estrella', label: 'estrella de cinco puntas', Icon: SilhouetteEstrella },
  { id: 'luna', label: 'luna creciente', Icon: SilhouetteLuna },
  { id: 'media', label: 'media', Icon: SilhouetteMedia },
  { id: 'casa', label: 'casa', Icon: SilhouetteCasa },
] as const

export type MemorySymbolId = (typeof MEMORY_SYMBOLS)[number]['id']
