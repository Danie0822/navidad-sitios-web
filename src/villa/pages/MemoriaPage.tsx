/* Propósito: página exclusiva del juego de memoria. */
import { Link } from 'react-router-dom'
import { FocusHeading } from '../components/FocusHeading'
import { MemoryGame } from '../games/MemoryGame'

export function MemoriaPage() {
  return (
    <section aria-labelledby="heading-memoria">
      <p className="mb-4">
        <Link to="/juegos" state={{ from: 'memoria' }} className="nav-link px-0 text-[var(--cta)]">
          Volver a juegos
        </Link>
      </p>
      <FocusHeading id="heading-memoria">Memoria</FocusHeading>
      <p className="mt-2 text-[var(--muted)]">Encontrá dos símbolos iguales.</p>
      <div className="mt-8">
        <MemoryGame />
      </div>
    </section>
  )
}
