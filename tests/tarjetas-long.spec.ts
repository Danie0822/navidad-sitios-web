// Propósito: verificar export con texto largo y que la imagen tenga contenido real (no vacía).
import { test, expect } from '@playwright/test'
import fs from 'node:fs'
import { PNG } from 'pngjs'

test('tarjeta con texto largo exporta PNG no vacío y con variación de píxeles', async ({ page }) => {
  await page.goto('/tarjetas')
  await page.getByLabel('Destinatario').fill('Familia Pérez-García y amistades queridas')
  // Mensaje largo (mayor que límites visuales para probar truncamiento sin cortes)
  await page.getByLabel('Mensaje').fill(
    'Les deseamos una Navidad llena de paz, alegría y momentos inolvidables. ' +
    'Gracias por su cariño y por acompañarnos durante todo el año. ¡Felicidades!'
  )

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: /Descargar imagen/ }).click(),
  ])
  const filePath = await download.path()
  expect(filePath).toBeTruthy()
  if (!filePath) return

  const buf = fs.readFileSync(filePath)
  expect(buf.length).toBeGreaterThan(10_000) // debe tener tamaño no trivial

  const png = PNG.sync.read(buf)
  // Calcular proporción de píxeles "no blancos" aproximados (contenido)
  let nonWhite = 0
  const total = png.width * png.height
  for (let y = Math.floor(png.height * 0.3); y < Math.floor(png.height * 0.9); y += 4) {
    for (let x = Math.floor(png.width * 0.1); x < Math.floor(png.width * 0.9); x += 4) {
      const idx = (png.width * y + x) << 2
      const r = png.data[idx], g = png.data[idx + 1], b = png.data[idx + 2], a = png.data[idx + 3]
      if (a > 0 && !(r > 245 && g > 245 && b > 245)) nonWhite++
    }
  }
  const ratio = nonWhite / (total / 16) // porque muestreamos cada 4px
  expect(ratio).toBeGreaterThan(0.05) // al menos 5% de variación indica que hay contenido (texto/figuras)

  // Guardar artefacto para transferencia
  try {
    const artifactPath = '/opt/cursor/artifacts/tarjeta-ejemplo.png'
    fs.writeFileSync(artifactPath, buf)
    // eslint-disable-next-line no-empty
  } catch {}
})
