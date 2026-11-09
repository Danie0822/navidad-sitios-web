/* Propósito: barajar copias de un arreglo sin mutar el original. */
export function shuffle<T>(items: readonly T[], rng: () => number = Math.random): T[] {
  const next = items.slice()
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}
