/* Propósito: landing navideña protagonista con escena animada y contador. */
import { Countdown } from '../components/Countdown'
import { Snowfall } from '../components/Snowfall'
import { LightGarland } from '../components/LightGarland'
import { ChristmasScene } from '../components/scene/ChristmasScene'
import { IconArbol, IconRegalo } from '../icons/Navidad'
import { Link } from 'react-router-dom'

export function Landing() {
  return (
    <div className="relative">
      <Snowfall />
      <section className="pt-8 sm:pt-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-red-700 dark:text-red-200 drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)]">
          Villa Navidad
        </h1>
        <LightGarland />
        <div className="mt-6">
          <ChristmasScene />
        </div>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/tarjetas"
            className="inline-flex items-center gap-2 rounded-md bg-red-600 hover:bg-red-700 text-white px-4 py-2 focus:outline-none focus-visible:ring-2 ring-red-300"
          >
            <IconRegalo className="w-5 h-5" aria-hidden="true" />
            Tarjetas
          </Link>
          <Link
            to="/juegos"
            className="inline-flex items-center gap-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 focus:outline-none focus-visible:ring-2 ring-emerald-300"
          >
            <IconArbol className="w-5 h-5" aria-hidden="true" />
            Juegos
          </Link>
        </div>
        <div className="mt-10">
          <Countdown />
        </div>
      </section>
    </div>
  )
}
