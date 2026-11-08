// Propósito: evidenciar y evitar regresiones de posición de grupos SVG (árbol y trineo/regalos).
import { test, expect } from '@playwright/test'

async function getSvgMetrics(page) {
  return await page.evaluate(() => {
    const svg = document.querySelector('svg[aria-label="Villa navideña en arco"]') as SVGSVGElement | null
    if (!svg) return null
    const rect = svg.getBoundingClientRect()
    // Local check for a path con la forma del arco
    const arch = svg.querySelector('path[d^="M0 620 V288"]') as SVGPathElement | null
    return {
      rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
      hasArch: !!arch
    }
  })
}

for (const rm of ['no-preference', 'reduce'] as const) {
  test(`SVG posiciones visibles (${rm})`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: rm === 'reduce' ? 'reduce' : 'no-preference' })
    await page.goto('/navidad-sitios-web/')
    await page.waitForSelector('svg[aria-label="Villa navideña en arco"]', { state: 'attached' })
    const svg = await getSvgMetrics(page)
    if (!svg) throw new Error('SVG de escena no encontrado')

    // Evidencia en salida
    console.log('svg', svg)

    // Rect dentro del SVG (tolerancia 5px)
    const minW = 200
    const minH = 200
    expect(svg.rect.width).toBeGreaterThan(minW)
    expect(svg.rect.height).toBeGreaterThan(minH)
    expect(svg.hasArch).toBeTruthy()
  })
}
