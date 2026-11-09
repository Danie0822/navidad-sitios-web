/* Propósito: detectar si dest/msg salen del área segura 1080 canónica. */

const SLOP = 3

export function cardTextOverflows(root: HTMLElement): boolean {
  const safe = root.querySelector('[data-safe-area]') as HTMLElement | null
  if (!safe) return true
  const box = safe.getBoundingClientRect()
  if (box.width < 2 || box.height < 2) return true

  const parts = root.querySelectorAll<HTMLElement>('[data-fit]')
  for (const el of parts) {
    if (!el.textContent) continue
    const r = el.getBoundingClientRect()
    if (
      r.bottom - box.bottom > SLOP ||
      r.right - box.right > SLOP ||
      box.left - r.left > SLOP ||
      box.top - r.top > SLOP
    ) {
      return true
    }
  }
  return false
}
