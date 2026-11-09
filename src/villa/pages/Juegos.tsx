/* Propósito: catálogo de exactamente dos juegos ilustrados. */
import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FocusHeading } from '../components/FocusHeading'
import { PauseButton } from '../motion/MotionContext'
import { CatalogMemoriaArt, CatalogRegalosArt } from '../components/catalog/CatalogArt'

export function Juegos() {
  const loc = useLocation() as { state?: { from?: string } }

  useEffect(() => {
    const from = loc.state?.from
    if (from === 'memoria') document.getElementById('catalog-memoria')?.focus()
    if (from === 'regalos') document.getElementById('catalog-regalos')?.focus()
  }, [loc.state])

  return (
    <section aria-labelledby="heading-juegos">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <FocusHeading id="heading-juegos">Jugá un ratito.</FocusHeading>
          <p className="mt-3 text-[var(--muted)]">Dos juegos. Toda la magia.</p>
        </div>
        <PauseButton />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Link
          id="catalog-memoria"
          to="/juegos/memoria"
          className="group rounded-2xl text-left focus:outline-none"
        >
          <div className="catalog-art motion-on">
            <CatalogMemoriaArt />
          </div>
          <h2 className="mt-5">Memoria</h2>
          <p className="mt-1 text-[var(--muted)]">Encontrá las ocho parejas.</p>
          <span className="btn-cta mt-4">Jugar memoria</span>
        </Link>

        <Link
          id="catalog-regalos"
          to="/juegos/regalos"
          className="group rounded-2xl text-left focus:outline-none"
        >
          <div className="catalog-art motion-on">
            <CatalogRegalosArt />
          </div>
          <h2 className="mt-5">Regalos escondidos</h2>
          <p className="mt-1 text-[var(--muted)]">Tocá el regalo antes de que se esconda.</p>
          <span className="btn-cta mt-4">Buscar regalos</span>
        </Link>
      </div>
    </section>
  )
}
