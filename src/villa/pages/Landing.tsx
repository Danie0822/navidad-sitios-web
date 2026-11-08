/* Propósito: landing navideña protagonista con escena animada y contador. */
import { Countdown } from '../components/Countdown'
import { Snowfall } from '../components/Snowfall'
import { LightGarland } from '../components/LightGarland'
import { IconArbol, IconRegalo, IconCopos } from '../icons/Navidad'
import { Link } from 'react-router-dom'

export function Landing() {
  return (
    <div className="relative">
      <Snowfall />
      <section className="pt-8 sm:pt-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-red-700 dark:text-red-300">
          Villa Navidad
        </h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Celebración simple, alegre y accesible. Muy poco texto, mucha magia.
        </p>
        <LightGarland />
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

      <section className="mt-12 sm:mt-16">
        <div className="mx-auto max-w-5xl grid sm:grid-cols-3 gap-6">
          <Card
            title="Tarjetas personalizadas"
            desc="Edita destinatario y mensaje, previsualiza y descarga como imagen."
            icon={<IconRegalo className="w-8 h-8 text-red-600 dark:text-red-300" aria-hidden="true" />}
            to="/tarjetas"
          />
          <Card
            title="Memoria navideña"
            desc="Encuentra parejas; puntuación, bloqueo correcto y reinicio limpio."
            icon={<IconCopos className="w-8 h-8 text-sky-500" aria-hidden="true" />}
            to="/juegos#memoria"
          />
          <Card
            title="Atrapa regalos"
            desc="Mueve el trineo y suma puntos sin dobles cobros; teclado y táctil."
            icon={<IconArbol className="w-8 h-8 text-emerald-500" aria-hidden="true" />}
            to="/juegos#atrapa"
          />
        </div>
      </section>
    </div>
  )
}

function Card(props: { title: string; desc: string; icon: React.ReactNode; to: string }) {
  return (
    <Link
      to={props.to}
      className="block rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 p-5 hover:shadow-md transition-shadow focus:outline-none focus-visible:ring-2 ring-red-400"
    >
      <div className="flex items-center gap-3">
        {props.icon}
        <div>
          <h3 className="text-lg font-semibold">{props.title}</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{props.desc}</p>
        </div>
      </div>
    </Link>
  )
}
