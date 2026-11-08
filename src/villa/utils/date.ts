/* Propósito: utilidades de fecha/hora (próxima Navidad, formateos). */
export type ChristmasTarget = {
  target: Date
  isToday: boolean
}

// Regla documentada:
// - Se considera Navidad el 25 de diciembre a las 00:00:00 hora local.
// - Si el día actual es 25/dic (cualquier hora), el objetivo pasa a ser el 25/dic del año siguiente.
export function getNextChristmas(now = new Date()): ChristmasTarget {
  const year = now.getFullYear()
  const targetThisYear = new Date(year, 11, 25, 0, 0, 0, 0) // Mes 11 = diciembre
  let target = targetThisYear
  let isToday = false
  if (now >= targetThisYear) {
    // Si ya es 25/dic o posterior, usar el próximo año
    target = new Date(year + 1, 11, 25, 0, 0, 0, 0)
  } else if (
    now.getFullYear() === targetThisYear.getFullYear() &&
    now.getMonth() === targetThisYear.getMonth() &&
    now.getDate() === targetThisYear.getDate() - 0 // mismo día antes de medianoche no aplica; pero por claridad dejamos bandera para mensajes
  ) {
    isToday = true
  }
  return { target, isToday }
}

export function getTimePartsDiff(from: Date, to: Date) {
  const diffMs = Math.max(0, to.getTime() - from.getTime())
  const totalSeconds = Math.floor(diffMs / 1000)
  const days = Math.floor(totalSeconds / (3600 * 24))
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return { days, hours, minutes, seconds, totalSeconds }
}
