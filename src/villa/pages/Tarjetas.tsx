/* Propósito: taller de tarjetas Scout V2. */
import { CardEditor } from '../components/cards/CardEditor'
import { FocusHeading } from '../components/FocusHeading'

export function Tarjetas() {
  return (
    <section aria-labelledby="heading-tarjetas">
      <FocusHeading id="heading-tarjetas">Un poquito de vos, en una tarjeta.</FocusHeading>
      <p className="mt-3 text-[var(--muted)]">Elegí un diseño, escribí algo lindo y llevátelo en PNG.</p>
      <div className="mt-8">
        <CardEditor />
      </div>
    </section>
  )
}
