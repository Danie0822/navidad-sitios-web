// Propósito: atrapar al menos un regalo y aumentar el puntaje (modo test).
import { test, expect } from '@playwright/test'

test('atrapa regalos: suma de puntos en modo test', async ({ page }) => {
  await page.goto('/juegos?test=1#atrapa')
  const canvas = page.locator('canvas[aria-label="Juego atrapar regalos"]')
  await canvas.waitFor()
  // Mover puntero al centro antes del spawn para alinear con testMode
  const box = await canvas.boundingBox()
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height - 10)
    await page.mouse.down()
    await page.mouse.up()
  }
  // Esperar al menos un spawn y caída
  await page.waitForTimeout(3000)
  await expect(page.getByText(/Puntaje: [1-9]/)).toBeVisible()
})
