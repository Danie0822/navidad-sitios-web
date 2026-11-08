// Propósito: evidenciar y evitar regresiones de posición de grupos SVG (árbol y trineo/regalos).
import { test, expect } from '@playwright/test'

async function getMetrics(page, id: string) {
  return await page.evaluate((gid) => {
    const el = document.getElementById(gid)!
    const bbox = (el as unknown as SVGGraphicsElement).getBBox()
    const rect = (el as Element).getBoundingClientRect()
    const style = getComputedStyle(el)
    const attrTransform = (el as Element).getAttribute('transform')
    const svg = el.closest('svg') as SVGSVGElement
    const svgRect = svg.getBoundingClientRect()
    return {
      id: gid,
      attrTransform,
      cssTransform: style.transform,
      bbox: { x: bbox.x, y: bbox.y, width: bbox.width, height: bbox.height },
      rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
      svgRect: { x: svgRect.x, y: svgRect.y, width: svgRect.width, height: svgRect.height },
    }
  }, id)
}

for (const rm of ['no-preference', 'reduce'] as const) {
  test(`SVG posiciones visibles (${rm})`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: rm === 'reduce' ? 'reduce' : 'no-preference' })
    await page.goto('/')
    const tree = await getMetrics(page, 'tree-group')
    const sleigh = await getMetrics(page, 'sleigh-group')

    // Evidencia en salida
    console.log('tree', tree)
    console.log('sleigh', sleigh)

    // Rect dentro del SVG (tolerancia 5px)
    for (const m of [tree, sleigh]) {
      const tol = 5
      const minW = Math.max(20, m.svgRect.width * 0.03)
      const minH = Math.max(10, m.svgRect.height * 0.03)
      expect(m.rect.width).toBeGreaterThan(minW)
      expect(m.rect.height).toBeGreaterThan(minH)
      expect(m.rect.x).toBeGreaterThanOrEqual(m.svgRect.x - tol)
      expect(m.rect.y).toBeGreaterThanOrEqual(m.svgRect.y - tol)
      expect(m.rect.x + m.rect.width).toBeLessThanOrEqual(m.svgRect.x + m.svgRect.width + tol)
      expect(m.rect.y + m.rect.height).toBeLessThanOrEqual(m.svgRect.y + m.svgRect.height + tol)
      // Debe existir transform del atributo (no sobreescrito)
      expect(m.attrTransform).toMatch(/translate\(/)
    }
  })
}
