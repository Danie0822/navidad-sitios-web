/* Propósito: contador regresivo a la próxima Navidad, robusto y accesible. */
import { useEffect, useMemo, useState } from 'react'
import { getNextChristmas, getTimePartsDiff } from '../utils/date'

export function Countdown() {
  const [now, setNow] = useState<Date>(() => new Date())
  const { target } = useMemo(() => getNextChristmas(now), [now])
  const { days, hours, minutes, seconds, totalSeconds } = useMemo(
    () => getTimePartsDiff(now, target),
    [now, target],
  )

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <section aria-labelledby="heading-countdown" className="text-center">
      <p id="heading-countdown" className="text-sm text-white/80">
        Cuenta regresiva a Navidad · Objetivo {target.toLocaleDateString()} 00:00 (hora local)
      </p>
      <div
        className="mt-3 grid grid-cols-4 gap-8 sm:gap-10 max-w-xl mx-auto"
        role="timer"
        aria-live="polite"
        aria-atomic="true"
        aria-label="Tiempo restante"
      >
        <TimeNum label="DÍAS" value={days} />
        <TimeNum label="HORAS" value={hours} />
        <TimeNum label="MIN" value={minutes} />
        <TimeNum label="SEG" value={seconds} />
      </div>
      {totalSeconds === 0 ? (
        <p className="mt-3 text-emerald-200">¡Feliz Navidad!</p>
      ) : null}
    </section>
  )
}

function TimeNum({ label, value }: { label: string; value: number }) {
  const padded = value.toString().padStart(2, '0')
  return (
    <div className="px-2 py-1">
      <div className="text-4xl sm:text-5xl font-bold tabular-nums text-white" aria-hidden="true">
        {padded}
      </div>
      <div className="text-[11px] uppercase tracking-[0.18em] text-white/75">{label}</div>
    </div>
  )
}
