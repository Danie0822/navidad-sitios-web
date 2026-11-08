/* Propósito: previsualización de tarjeta navideña con plantillas puras CSS/SVG. */
import { forwardRef } from 'react'
import { IconArbol, IconCampana, IconEstrella, IconRegalo } from '../../icons/Navidad'

export type CardTemplate = 'clasica' | 'moderna' | 'noel'

export type CardData = {
  destinatario: string
  mensaje: string
  plantilla: CardTemplate
}

export const CardPreview = forwardRef<HTMLDivElement, CardData>(function CardPreview(
  { destinatario, mensaje, plantilla },
  ref,
) {
  return (
    <div
      ref={ref}
      className="relative w-[640px] h-[360px] sm:w-[720px] sm:h-[405px] md:w-[840px] md:h-[472px] rounded-xl overflow-hidden border bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100"
      role="img"
      aria-label={`Tarjeta ${plantilla} para ${destinatario}`}
    >
      {plantilla === 'clasica' && <FondoClasico />}
      {plantilla === 'moderna' && <FondoModerno />}
      {plantilla === 'noel' && <FondoNoel />}
      <div className="absolute inset-0 p-6 sm:p-8 flex flex-col">
        <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
          <IconEstrella className="w-5 h-5" aria-hidden="true" />
          <span className="font-semibold tracking-wide uppercase text-xs">Felices Fiestas</span>
        </div>
        <div className="mt-auto">
          <p className="text-sm text-neutral-600 dark:text-neutral-300">Para:</p>
          <h3 className="text-2xl sm:text-3xl font-bold break-words">{destinatario || 'Destinatario'}</h3>
          <p className="mt-2 text-base sm:text-lg leading-snug break-words line-clamp-[6]">
            {mensaje || 'Que esta Navidad esté llena de alegría, paz y buenos momentos.'}
          </p>
        </div>
      </div>
    </div>
  )
})

function FondoClasico() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-red-100 via-white to-emerald-100 dark:from-neutral-800 dark:via-neutral-900 dark:to-neutral-800">
      <div className="absolute -left-8 -top-8 rotate-[-12deg] opacity-30">
        <IconRegalo className="w-40 h-40 text-red-500" />
      </div>
      <div className="absolute -right-6 bottom-4 rotate-[8deg] opacity-30">
        <IconArbol className="w-36 h-36 text-emerald-500" />
      </div>
    </div>
  )
}

function FondoModerno() {
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fee2e2" />
          <stop offset="100%" stopColor="#dcfce7" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="800" height="450" fill="url(#g1)" />
      <g opacity="0.15">
        <circle cx="150" cy="100" r="60" fill="#f59e0b" />
        <circle cx="640" cy="320" r="80" fill="#10b981" />
        <circle cx="400" cy="220" r="50" fill="#ef4444" />
      </g>
    </svg>
  )
}

function FondoNoel() {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-gradient-to-b from-red-600/10 to-transparent" />
      <div className="absolute left-4 top-4 opacity-40">
        <IconCampana className="w-10 h-10 text-amber-500" />
      </div>
      <div className="absolute right-6 bottom-6 opacity-40">
        <IconRegalo className="w-10 h-10 text-emerald-500" />
      </div>
    </div>
  )
}
