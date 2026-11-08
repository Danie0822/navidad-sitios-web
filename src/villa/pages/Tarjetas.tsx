/* Propósito: página de edición y descarga de tarjetas navideñas. */
import { CardEditor } from '../components/cards/CardEditor'

export function Tarjetas() {
  return (
    <section aria-labelledby="heading-tarjetas">
      <h2 id="heading-tarjetas" className="text-3xl font-bold text-red-700 dark:text-red-300">Tarjetas</h2>
      <p className="mt-1 text-neutral-600 dark:text-neutral-400">
        Edita y descarga tu tarjeta como imagen PNG sin dependencias externas frágiles.
      </p>
      <div className="mt-6">
        <CardEditor />
      </div>
    </section>
  )
}
