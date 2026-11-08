// Propósito: validar atrapar regalos en flujo real (sin backdoor), teclado + táctil y reset.
import { test, expect } from '@playwright/test'

test('atrapa regalos real: teclado y táctil, reset', async ({ page }) => {
  await page.goto('/navidad-sitios-web/juegos#atrapa')
  const canvas = page.locator('canvas[aria-label="Juego atrapar regalos"]')
  await canvas.waitFor()
  const score = () => page.locator('#atrapa').getByText(/Puntaje: \d+/)

  // Asegurar empieza en 0
  await expect(score()).toHaveText(/Puntaje: 0/)

  // Simular control con teclado
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowLeft')

  // Mover puntero de lado a lado por ~4s para incrementar probabilidad de acierto
  const box = await canvas.boundingBox()
  if (box) {
    const steps = 10
    for (let i = 0; i < steps; i++) {
      const x = i % 2 === 0 ? box.x + box.width * 0.2 : box.x + box.width * 0.8
      await page.mouse.move(x, box.y + box.height - 12)
      await page.waitForTimeout(400)
    }
  } else {
    await page.waitForTimeout(5000)
  }

  // Verificar puntaje > 0 (al menos un acierto real)
  await expect(score()).toHaveText(/Puntaje: [1-9]\d*/)

  // Reset
  await page.getByRole('region', { name: 'Atrapa regalos' }).getByRole('button', { name: 'Reiniciar' }).click()
  await expect(score()).toHaveText(/Puntaje: 0/)
})
