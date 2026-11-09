/* Propósito: portada aprobada con teatro del regalo y control de pausa junto a la escena. */
import { Link } from 'react-router-dom'
import { Countdown } from '../components/Countdown'
import { SnowfallBox } from '../components/Snowfall'
import { ChristmasSceneScout } from '../components/scene/ChristmasSceneScout'
import { FocusHeading } from '../components/FocusHeading'
import { IconArbol, IconRegalo } from '../icons/Navidad'
import { PauseButton } from '../motion/MotionContext'

export function Landing() {
  return (
    <div className="relative text-[var(--forest)]">
      <section>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="uppercase tracking-[0.18em] text-xs text-[var(--muted)]">Un pequeño mundo para compartir</p>
            <FocusHeading className="mt-3">
              La magia
              <br />
              está en dar.
            </FocusHeading>
            <p className="mt-3 text-[var(--muted)]">Creá una tarjeta. Regalá un ratito de alegría.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/tarjetas" className="btn-cta gap-2">
                <IconRegalo className="w-5 h-5" aria-hidden="true" />
                Crear tarjeta
              </Link>
              <Link to="/juegos" className="btn-ghost gap-2">
                <IconArbol className="w-5 h-5" aria-hidden="true" />
                Jugar
              </Link>
            </div>
          </div>

          <div>
            <div className="relative">
              <div className="mx-auto w-full max-w-[560px] aspect-[600/620]">
                <SnowfallBox
                  className="absolute inset-0 overflow-hidden pointer-events-none"
                  style={{ clipPath: "path('M0 620 V288 A300 288 0 0 1 600 288 V620 Z')" }}
                />
                <ChristmasSceneScout />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <PauseButton />
            </div>
          </div>
        </div>

        <div className="mt-10">
          <div className="rounded-xl bg-[var(--forest)] text-white p-4 sm:p-6">
            <h2 className="sr-only">Cuenta regresiva</h2>
            <Countdown />
          </div>
        </div>
      </section>
    </div>
  )
}
