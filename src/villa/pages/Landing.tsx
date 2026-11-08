/* Propósito: landing navideña con diseño aprobado (copy grande y escena en arco), animaciones de entrada sutiles y contador. */
import { Countdown } from '../components/Countdown'
import { SnowfallBox } from '../components/Snowfall'
import { ChristmasSceneScout } from '../components/scene/ChristmasSceneScout'
import { IconArbol, IconRegalo } from '../icons/Navidad'
import { Link } from 'react-router-dom'

export function Landing() {
  return (
    <div className="relative bg-[var(--bg-ivory)] text-[var(--forest)]">
      <section className="pt-8 sm:pt-12">
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 grid md:grid-cols-2 gap-8 items-center">
          {/* Copy grande izquierda */}
          <div
            className="animate-[fadeUp_420ms_ease-out_forwards] opacity-0"
            style={{ animationFillMode: 'forwards' as const }}
          >
            <p className="uppercase tracking-[0.18em] text-xs text-neutral-500">Un pequeño mundo para compartir</p>
            <h1 className="mt-3 text-[40px] leading-[1.05] sm:text-6xl font-extrabold"
                style={{ fontFamily: '\'Fraunces Variable\', \'Fraunces\', ui-serif, Georgia, serif' }}>
              La magia<br/>está en dar.
            </h1>
            <p className="mt-3 text-neutral-700">Creá una tarjeta. Regalá un ratito de alegría.</p>
            <div className="mt-6 flex gap-3">
              <Link
                to="/tarjetas"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--cta)] hover:brightness-110 text-white px-5 py-2.5 focus:outline-none focus-visible:ring-2 ring-[var(--cta)]"
              >
                <IconRegalo className="w-5 h-5" aria-hidden="true" />
                Crear tarjeta
              </Link>
              <Link
                to="/juegos"
                className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-5 py-2.5 hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 ring-neutral-400"
              >
                <IconArbol className="w-5 h-5" aria-hidden="true" />
                Jugar
              </Link>
            </div>
          </div>

          {/* Escena en arco derecha */}
          <div
            className="animate-[fadeIn_650ms_ease-out_forwards] opacity-0"
            style={{ animationFillMode: 'forwards' as const }}
          >
            <div className="relative">
              <div className="mx-auto w-full max-w-[560px] aspect-[600/620]">
                {/* Nieve confinada al arco mediante clip-path path del SVG */}
                <SnowfallBox
                  className="absolute inset-0 pointer-events-none"
                  style={{ clipPath: "path('M0 620 V288 A300 288 0 0 1 600 288 V620 Z')" }}
                />
                <ChristmasSceneScout />
              </div>
              {/* estrella dorada de cierre */}
              <div
                className="absolute -top-4 right-8 w-4 h-4 rounded-full"
                style={{
                  background: 'var(--gold)',
                  animation: 'fadeIn 180ms ease-out 800ms forwards',
                  opacity: 0,
                }}
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        {/* Banda de contador en verde bosque */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 mt-10">
          <div className="rounded-xl bg-[var(--forest)] text-white p-4 sm:p-6">
            <h2 className="sr-only">Cuenta regresiva</h2>
            <Countdown />
          </div>
        </div>
      </section>
    </div>
  )
}
