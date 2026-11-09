// Propósito: contraste WCAG AA del ::placeholder de #dest y #msg (axe no mide el pseudo-elemento).
import { test, expect } from '@playwright/test'

type PlaceholderSample = {
  id: string
  rawColor: string
  rawBackground: string
  opacity: string
  fg: [number, number, number, number]
  bg: [number, number, number]
  composed: [number, number, number]
  ratio: number
}

function srgbToLin(c: number) {
  c /= 255
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

function lum([r, g, b]: [number, number, number]) {
  return 0.2126 * srgbToLin(r) + 0.7152 * srgbToLin(g) + 0.0722 * srgbToLin(b)
}

function contrast(fg: [number, number, number], bg: [number, number, number]) {
  const L1 = lum(fg)
  const L2 = lum(bg)
  return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)
}

function parseColor(value: string): { rgb: [number, number, number]; alpha: number; space: string } | null {
  const rgb = value.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i)
  if (rgb) {
    return {
      rgb: [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])],
      alpha: rgb[4] === undefined ? 1 : Number(rgb[4]),
      space: rgb[0].startsWith('rgba') ? 'rgba' : 'rgb',
    }
  }
  const modern = value.match(/^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)$/i)
  if (modern) {
    return {
      rgb: [Number(modern[1]) * 255, Number(modern[2]) * 255, Number(modern[3]) * 255],
      alpha: modern[4] === undefined ? 1 : Number(modern[4]),
      space: 'color(srgb)',
    }
  }
  return null
}

test('::placeholder de #dest y #msg cumple AA 4.5:1 sobre el fondo del input vacío', async ({ page }) => {
  await page.goto('/navidad-sitios-web/tarjetas')
  await expect(page.getByRole('heading', { name: 'Tarjetas' })).toBeVisible()

  const dest = page.locator('#dest')
  const msg = page.locator('#msg')
  await expect(dest).toBeEnabled()
  await expect(msg).toBeEnabled()
  await expect(dest).toHaveValue('')
  await expect(msg).toHaveValue('')

  const samples = await page.evaluate(() => {
    function sample(id: string) {
      const el = document.getElementById(id)
      if (!el) throw new Error(`No se encontró #${id}`)
      const ph = getComputedStyle(el, '::placeholder')
      const cs = getComputedStyle(el)
      return {
        id,
        rawColor: ph.color,
        rawBackground: cs.backgroundColor,
        opacity: ph.opacity,
      }
    }
    return [sample('dest'), sample('msg')]
  })

  const results: PlaceholderSample[] = []
  for (const s of samples) {
    const fgParsed = parseColor(s.rawColor)
    const bgParsed = parseColor(s.rawBackground)
    expect(fgParsed, `foreground RAW no convertible (${s.id}): ${s.rawColor}`).not.toBeNull()
    expect(bgParsed, `background RAW no convertible (${s.id}): ${s.rawBackground}`).not.toBeNull()
    if (!fgParsed || !bgParsed) continue

    const elementOpacity = Number(s.opacity)
    expect(Number.isFinite(elementOpacity)).toBe(true)
    const alpha = Math.min(1, Math.max(0, fgParsed.alpha * elementOpacity))
    const composed: [number, number, number] = [
      fgParsed.rgb[0] * alpha + bgParsed.rgb[0] * (1 - alpha),
      fgParsed.rgb[1] * alpha + bgParsed.rgb[1] * (1 - alpha),
      fgParsed.rgb[2] * alpha + bgParsed.rgb[2] * (1 - alpha),
    ]
    const ratio = contrast(composed, bgParsed.rgb)
    results.push({
      id: s.id,
      rawColor: s.rawColor,
      rawBackground: s.rawBackground,
      opacity: s.opacity,
      fg: [fgParsed.rgb[0], fgParsed.rgb[1], fgParsed.rgb[2], alpha],
      bg: bgParsed.rgb,
      composed,
      ratio,
    })
    expect(ratio, `${s.id} placeholder ${ratio.toFixed(2)}:1 RAW fg=${s.rawColor} bg=${s.rawBackground}`).toBeGreaterThanOrEqual(4.5)
  }

  expect(results).toHaveLength(2)
  for (const r of results) {
    // sanity: no reportar negro inventado
    expect(r.rawColor).not.toMatch(/^rgb\(\s*0\s*,\s*0\s*,\s*0\s*\)$/)
    expect(r.composed[0] + r.composed[1] + r.composed[2]).toBeGreaterThan(0)
  }
})
