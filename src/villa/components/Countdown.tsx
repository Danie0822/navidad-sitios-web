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
      <h2 id="heading-countdown" className="text-2xl sm:text-3xl font-semibold text-red-700 dark:text-red-300">
        Cuenta regresiva para la próxima Navidad
      </h2>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
        Objetivo: {target.toLocaleDateString()} 00:00:00 (hora local)
      </p>
      <div
        className="mt-4 grid grid-cols-4 gap-3 sm:gap-4 max-w-xl mx-auto"
        role="timer"
        aria-live="polite"
        aria-atomic="true"
        aria-label="Tiempo restante"
      >
        <TimeBox label="días" value={days} />
        <TimeBox label="horas" value={hours} />
        <TimeBox label="min" value={minutes} />
        <TimeBox label="seg" value={seconds} />
      </div>
      {totalSeconds === 0 ? (
        <p className="mt-3 text-emerald-700 dark:text-emerald-300">¡Feliz Navidad!</p>
      ) : null}
    </section>
  )
}

function TimeBox({ label, value }: { label: string; value: number }) {
  const padded = value.toString().padStart(2, '0')
  return (
    <div className="rounded-lg bg-white/80 dark:bg-neutral-800/80 border border-red-200 dark:border-neutral-700 px-2 py-3">
      <div className="text-3xl sm:text-4xl font-bold tabular-nums text-red-700 dark:text-red-300" aria-hidden="true">
        {padded}
      </div>
      <div className="text-xs uppercase tracking-wide text-neutral-600 dark:text-neutral-400">{label}</div>
    </div>
  )
}
