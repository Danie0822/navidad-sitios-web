// Propósito: contraste real de ::placeholder por composición alpha (≥4.5). Equivalente al fix de PR2.
import { test, expect } from '@playwright/test'

function srgbToLin(c: number) {
  c /= 255
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}
function lum(r: number, g: number, b: number) {
  return 0.2126 * srgbToLin(r) + 0.7152 * srgbToLin(g) + 0.0722 * srgbToLin(b)
}
function ratio(fg: [number, number, number], bg: [number, number, number]) {
  const L1 = lum(...fg)
  const L2 = lum(...bg)
  return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)
}

test('placeholders dest/msg contrastan ≥4.5 sobre el fondo del campo', async ({ page }) => {
  await page.goto('/navidad-sitios-web/tarjetas')
  for (const id of ['#dest', '#msg']) {
    const measured = await page.locator(id).evaluate((el) => {
      const ph = getComputedStyle(el, '::placeholder')
      const bg = getComputedStyle(el)
      return { color: ph.color, backgroundColor: bg.backgroundColor, opacity: ph.opacity }
    })
    const fgM = measured.color.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)/i)
    const bgM = measured.backgroundColor.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)/i)
    expect(fgM, `color parse ${id} ${measured.color}`).toBeTruthy()
    expect(bgM, `bg parse ${id} ${measured.backgroundColor}`).toBeTruthy()
    const fa = fgM![4] == null ? Number(measured.opacity) : Number(fgM![4])
    const fr = Number(fgM![1])
    const fg = Number(fgM![2])
    const fb = Number(fgM![3])
    const br = Number(bgM![1])
    const bg = Number(bgM![2])
    const bb = Number(bgM![3])
    const comp: [number, number, number] = [fr * fa + br * (1 - fa), fg * fa + bg * (1 - fa), fb * fa + bb * (1 - fa)]
    const r = ratio(comp, [br, bg, bb])
    expect(r, `${id} ratio ${r} color=${measured.color} bg=${measured.backgroundColor}`).toBeGreaterThanOrEqual(4.5)
  }
})
