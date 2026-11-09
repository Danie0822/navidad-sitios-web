// Propósito: export con texto largo real, acentos y PNG con contenido (sin truncar en el campo).
import { test, expect } from '@playwright/test'
import fs from 'node:fs'
import { PNG } from 'pngjs'

test('tarjeta con texto largo exporta PNG 1080 no vacío', async ({ page }) => {
  await page.goto('/navidad-sitios-web/tarjetas')
  const dest = 'Familia Pérez-García y amistades queridas'
  const msg =
    'Les deseamos una Navidad llena de paz, alegría y momentos inolvidables. ' +
    'Gracias por su cariño y por acompañarnos durante todo el año. ¡Felicidades! 🎄'
  await page.getByRole('textbox', { name: 'Para' }).fill(dest)
  await page.getByRole('textbox', { name: 'Tu mensaje' }).fill(msg)
  await expect(page.getByRole('textbox', { name: 'Para' })).toHaveValue(dest)
  await expect(page.getByRole('textbox', { name: 'Tu mensaje' })).toHaveValue(msg)

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: /Descargar PNG/ }).click(),
  ])
  const filePath = await download.path()
  expect(filePath).toBeTruthy()
  if (!filePath) return

  const buf = fs.readFileSync(filePath)
  expect(buf.length).toBeGreaterThan(10_000)

  const png = PNG.sync.read(buf)
  expect(png.width).toBe(1080)
  expect(png.height).toBe(1080)
  let nonWhite = 0
  const total = png.width * png.height
  for (let y = Math.floor(png.height * 0.3); y < Math.floor(png.height * 0.9); y += 4) {
    for (let x = Math.floor(png.width * 0.1); x < Math.floor(png.width * 0.9); x += 4) {
      const idx = (png.width * y + x) << 2
      const r = png.data[idx],
        g = png.data[idx + 1],
        b = png.data[idx + 2],
        a = png.data[idx + 3]
      if (a > 0 && !(r > 245 && g > 245 && b > 245)) nonWhite++
    }
  }
  const ratio = nonWhite / (total / 16)
  expect(ratio).toBeGreaterThan(0.05)

  try {
    fs.writeFileSync('/opt/cursor/artifacts/tarjeta-ejemplo.png', buf)
  } catch {}
})

test('preview sin scroll horizontal interno en 320', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 })
  await page.goto('/navidad-sitios-web/tarjetas')
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement.scrollWidth > document.documentElement.clientWidth + 2
    const frame = document.querySelector('[data-preview="live"]') as HTMLElement | null
    if (!frame) return { doc, innerScrollable: true }
    const ox = getComputedStyle(frame).overflowX
    const innerScrollable = (ox === 'auto' || ox === 'scroll') && frame.scrollWidth > frame.clientWidth + 2
    return { doc, innerScrollable, ox }
  })
  expect(overflow.doc).toBe(false)
  expect(overflow.innerScrollable).toBe(false)
})
