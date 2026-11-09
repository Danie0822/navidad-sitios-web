/* Propósito: página exclusiva de Regalos escondidos. */
import { Link } from 'react-router-dom'
import { FocusHeading } from '../components/FocusHeading'
import { HiddenGiftsGame } from '../games/HiddenGiftsGame'

export function RegalosPage() {
  return (
    <section aria-labelledby="heading-regalos">
      <p className="mb-4">
        <Link to="/juegos" state={{ from: 'regalos' }} className="nav-link px-0 text-[var(--cta)]">
          Volver a juegos
        </Link>
      </p>
      <FocusHeading id="heading-regalos">Regalos escondidos</FocusHeading>
      <p className="mt-2 text-[var(--muted)]">Buscá el regalo que asoma. Tocá su ventana antes de que se esconda.</p>
      <div className="mt-8">
        <HiddenGiftsGame />
      </div>
    </section>
  )
}
