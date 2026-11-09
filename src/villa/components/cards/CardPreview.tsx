/* Propósito: tres composiciones distintas 1080²; texto HTML para saltos, acentos y emoji. */
import { forwardRef } from 'react'

export type CardTemplate = 'villa' | 'bosque' | 'regalos'

export type CardData = {
  destinatario: string
  mensaje: string
  plantilla: CardTemplate
}

type CardArtProps = CardData & {
  mode?: 'preview' | 'thumb' | 'export'
}

export const TEMPLATES: { id: CardTemplate; label: string }[] = [
  { id: 'villa', label: 'Villa' },
  { id: 'bosque', label: 'Bosque' },
  { id: 'regalos', label: 'Regalos' },
]

export const CardPreview = forwardRef<HTMLDivElement, CardArtProps>(function CardPreview(
  { destinatario, mensaje, plantilla, mode = 'preview' },
  ref,
) {
  const staticArt = mode === 'export' || mode === 'thumb'
  const showText = mode !== 'thumb'
  const dest = destinatario.trim()
  const msg = mensaje
  const titleNode =
    plantilla === 'regalos' ? (
      <>
        Un regalo
        <br />
        para vos.
      </>
    ) : (
      'Feliz Navidad'
    )
  const destLine = dest ? `Para ${dest}` : mode === 'preview' ? 'Para alguien especial' : ''

  return (
    <div
      ref={ref}
      className={`card-art ${staticArt ? '' : 'motion-on'}`}
      data-template={plantilla}
      data-mode={mode}
      role={mode === 'thumb' ? undefined : 'img'}
      aria-label={mode === 'thumb' ? undefined : `Tarjeta ${plantilla}${dest ? `, ${dest}` : ''}`}
    >
      {plantilla === 'villa' && <VillaArt />}
      {plantilla === 'bosque' && <BosqueArt />}
      {plantilla === 'regalos' && <RegalosArt />}
      {showText && (
        <div
          className={`absolute inset-0 pointer-events-none ${
            plantilla === 'regalos' ? 'card-copy-regalos' : 'card-copy-center'
          }`}
        >
          <p className="card-title font-serif">{titleNode}</p>
          <p className="card-dest" data-fit="dest">
            {destLine}
          </p>
          <p className="card-msg" data-fit="msg">
            {msg || (mode === 'preview' ? 'Escribí un deseo. Los saltos de línea también viajan.' : '')}
          </p>
        </div>
      )}
    </div>
  )
})

function VillaArt() {
  return (
    <svg viewBox="0 0 1080 1080" className="absolute inset-0 w-full h-full" aria-hidden="true">
      <rect width="1080" height="1080" fill="#70232F" />
      <path d="M0 896 Q270 783 648 891 T1080 870 V1080 H0 Z" fill="#E9DAC3" />
      <g className="anim-star">
        <path d="M81 95 Q86 103 95 108 Q86 113 81 122 Q76 113 67 108 Q76 103 81 95" fill="#E7B960" />
        <path d="M913 203 Q918 211 927 216 Q918 221 913 230 Q908 221 899 216 Q908 211 913 203" fill="#E7B960" />
        <path d="M203 702 Q208 710 216 716 Q208 721 203 730 Q198 721 189 716 Q198 710 203 702" fill="#E7B960" />
        <path d="M953 675 Q958 683 967 689 Q958 694 953 703 Q948 694 939 689 Q948 683 953 675" fill="#E7B960" />
      </g>
      <g transform="translate(216 910) scale(3.1)">
        <rect x="-22" y="-8" width="44" height="36" rx="2" fill="#B85B4E" />
        <path d="M-30 -6 L0 -32 L30 -6 Z" fill="#183C32" />
        <rect x="-5" y="6" width="10" height="22" rx="2" fill="#E7B960" className="anim-window" />
        <rect x="-16" y="-2" width="8" height="10" rx="1" fill="#E7B960" />
        <rect x="9" y="-2" width="8" height="10" rx="1" fill="#E7B960" />
      </g>
      <g transform="translate(859 910) scale(1.22)">
        <rect x="-5" y="0" width="10" height="20" fill="#8C694B" />
        <g className="anim-tree">
          <path d="M0 -138 L35 -66 H22 L55 -15 H38 L66 23 H-66 L-38 -15 H-55 L-22 -66 H-35 Z" fill="#183C32" />
        </g>
        <g className="anim-star-sm">
          <path d="M0 -157 Q2 -147 12 -145 Q2 -143 0 -133 Q-2 -143 -12 -145 Q-2 -147 0 -157" fill="#E7B960" />
        </g>
        <circle cx="-12" cy="-68" r="4" fill="#E7B960" />
        <circle cx="17" cy="-30" r="4" fill="#E7B960" />
        <circle cx="-30" cy="2" r="4" fill="#E7B960" />
        <circle cx="32" cy="12" r="4" fill="#E7B960" />
      </g>
    </svg>
  )
}

function BosqueArt() {
  return (
    <svg viewBox="0 0 1080 1080" className="absolute inset-0 w-full h-full" aria-hidden="true">
      <rect width="1080" height="1080" fill="#FFFAF0" />
      <g transform="translate(76 76)">
        <g className="anim-forest">
          <CornerBranch />
        </g>
      </g>
      <g transform="translate(1004 76) scale(-1 1)">
        <g className="anim-forest">
          <CornerBranch />
        </g>
      </g>
      <g transform="translate(76 1004) scale(1 -1)">
        <g className="anim-forest">
          <CornerBranch />
        </g>
      </g>
      <g transform="translate(1004 1004) scale(-1 -1)">
        <g className="anim-forest">
          <CornerBranch />
        </g>
      </g>
    </svg>
  )
}

function CornerBranch() {
  return (
    <>
      <path d="M0 284 Q27 40 270 0" stroke="#183C32" strokeWidth="11" fill="none" />
      <path d="M22 200 q-54 -11 -38 -70 q59 16 38 70 M30 192 q8 -65 68 -49 q-16 54 -68 49" fill="#183C32" />
      <path d="M62 162 q-54 -11 -38 -70 q59 16 38 70 M70 154 q8 -65 68 -49 q-16 54 -68 49" fill="#183C32" />
      <path d="M103 124 q-54 -11 -38 -70 q59 16 38 70 M111 116 q8 -65 68 -49 q-16 54 -68 49" fill="#183C32" />
      <path d="M143 86 q-54 -11 -38 -70 q59 16 38 70 M151 78 q8 -65 68 -49 q-16 54 -68 49" fill="#183C32" />
      <path d="M184 49 q-54 -11 -38 -70 q59 16 38 70 M192 41 q8 -65 68 -49 q-16 54 -68 49" fill="#183C32" />
      <circle cx="76" cy="81" r="13" fill="#A72C36" />
      <circle cx="108" cy="57" r="11" fill="#A72C36" />
    </>
  )
}

function RegalosArt() {
  return (
    <svg viewBox="0 0 1080 1080" className="absolute inset-0 w-full h-full" aria-hidden="true">
      <rect width="1080" height="1080" fill="#183C32" />
      <rect y="92" width="1080" height="35" fill="#A72C36" />
      <rect x="797" width="35" height="1080" fill="#A72C36" />
      <g className="anim-ribbon">
        <path d="M814 113 C617 -51 608 154 814 113 C997 -59 1021 146 814 113" stroke="#A72C36" strokeWidth="32" fill="none" />
      </g>
      <g transform="translate(197 915) scale(3.5)">
        <g className="anim-gift-lid">
          <rect x="-26" y="-18" width="52" height="10" rx="2" fill="#A72C36" />
          <path d="M0 -18 C-29 -48 -34 -18 0 -18 C29 -48 34 -18 0 -18" stroke="#E7B960" strokeWidth="5" fill="none" />
        </g>
        <rect x="-22" y="-13" width="44" height="36" rx="3" fill="#A72C36" />
        <rect x="-4" y="-18" width="8" height="41" fill="#E7B960" />
      </g>
      <g transform="translate(378 980) scale(1.9)">
        <rect x="-22" y="-13" width="44" height="36" rx="3" fill="#A72C36" />
        <rect x="-26" y="-18" width="52" height="10" rx="2" fill="#A72C36" />
        <rect x="-4" y="-18" width="8" height="41" fill="#E7B960" />
        <path d="M0 -18 C-29 -48 -34 -18 0 -18 C29 -48 34 -18 0 -18" stroke="#E7B960" strokeWidth="5" fill="none" />
      </g>
      <g className="anim-star-sm">
        <path d="M913 791 Q918 810 937 816 Q918 821 913 840 Q908 821 889 816 Q908 810 913 791" fill="#E7B960" />
      </g>
    </svg>
  )
}
