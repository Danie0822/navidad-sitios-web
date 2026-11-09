// Propósito: Regalos escondidos — captura atómica, pausa y reinicio (reemplaza atrapa).
import { test, expect } from '@playwright/test'

test('regalos: jugar, sumar un punto y reiniciar', async ({ page }) => {
  await page.goto('/navidad-sitios-web/juegos/regalos')
  await page.getByRole('button', { name: 'Jugar' }).click()
  const open = page.locator('[data-window][data-open="true"]')
  await open.waitFor({ timeout: 4000 })
  const idx = await open.getAttribute('data-window')
  await open.click()
  await expect(page.getByText(/Regalos 1/)).toBeVisible()
  await page.locator(`[data-window="${idx}"]`).dblclick()
  await expect(page.getByText(/Regalos 1/)).toBeVisible()
  await page.getByRole('button', { name: 'Reiniciar' }).click()
  await expect(page.getByRole('button', { name: 'Jugar' })).toBeVisible()
  await expect(page.getByText(/Tiempo/)).toHaveCount(0)
})
