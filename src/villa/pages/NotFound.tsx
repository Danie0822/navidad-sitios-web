/* Propósito: ruta desconocida dentro de la SPA, con navegación intacta. */
import { Link } from 'react-router-dom'
import { FocusHeading } from '../components/FocusHeading'

export function NotFound() {
  return (
    <section>
      <FocusHeading>No encontramos esa página.</FocusHeading>
      <p className="mt-3 text-[var(--muted)]">Volvé al inicio o elegí Tarjetas o Juegos.</p>
      <p className="mt-6">
        <Link to="/" className="btn-cta">
          Ir al inicio
        </Link>
      </p>
    </section>
  )
}
