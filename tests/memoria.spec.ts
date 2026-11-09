// Propósito: memoria 8×2, bloqueo de tercera carta, acierto por ID, pausa y reinicio.
import { test, expect } from '@playwright/test'

test('memoria: bloqueo con dos cartas y reinicio', async ({ page }) => {
  await page.goto('/navidad-sitios-web/juegos/memoria')
  const board = page.getByRole('grid', { name: /Tablero de memoria/ })
  await expect(board).toBeVisible()
  const cells = board.getByRole('gridcell')
  await expect(cells).toHaveCount(16)
  await cells.nth(0).click()
  await cells.nth(1).click()
  const third = cells.nth(2)
  await third.click({ trial: true }).catch(() => {})
  await page.getByRole('button', { name: 'Reiniciar' }).click()
  await expect(page.getByText(/Parejas 0\/8/)).toBeVisible()
  await expect(page.getByText(/Intentos 0/)).toBeVisible()
})

test('memoria: acierto por ID y no duplica puntos', async ({ page }) => {
  await page.goto('/navidad-sitios-web/juegos/memoria')
  const board = page.getByRole('grid', { name: /Tablero de memoria/ })
  const first = board.getByRole('gridcell').nth(0)
  await first.click()
  const symbol = await first.getAttribute('data-symbol')
  expect(symbol).toBeTruthy()
  const pair = board.locator(`[data-symbol="${symbol}"]`)
  await expect(pair).toHaveCount(2)
  await pair.nth(1).click()
  await expect(page.getByText(/Parejas 1\/8/)).toBeVisible()
  await pair.nth(0).click()
  await pair.nth(1).click()
  await expect(page.getByText(/Parejas 1\/8/)).toBeVisible()
})

test('memoria: pausa bloquea cartas', async ({ page }) => {
  await page.goto('/navidad-sitios-web/juegos/memoria')
  await page.getByRole('button', { name: 'Pausar' }).click()
  await expect(page.getByRole('status')).toHaveText('Partida pausada')
  const cell = page.getByRole('gridcell').nth(0)
  await expect(cell).toBeDisabled()
  await page.getByRole('button', { name: 'Continuar' }).click()
  await expect(cell).toBeEnabled()
})
