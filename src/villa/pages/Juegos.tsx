/* Propósito: página que agrupa los dos minijuegos requeridos. */
import { MemoryGame } from '../games/MemoryGame'
import { CatchGiftsGame } from '../games/CatchGiftsGame'

export function Juegos() {
  return (
    <section aria-labelledby="heading-juegos" className="space-y-10">
      <h2 id="heading-juegos" className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">Juegos</h2>
      <div id="memoria">
        <MemoryGame />
      </div>
      <div id="atrapa">
        <CatchGiftsGame />
      </div>
    </section>
  )
}
