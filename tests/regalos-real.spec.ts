// Propósito: flujo real de Regalos escondidos: teclado, pausa, fin de ronda sin puntos extra.
import { test, expect } from '@playwright/test'

test('regalos real: teclado, pausa y reset', async ({ page }) => {
  await page.goto('/navidad-sitios-web/juegos/regalos')
  await page.getByRole('button', { name: 'Jugar' }).click()
  const board = page.getByRole('grid', { name: /Ventanas de regalos/ })
  await expect(board.getByRole('gridcell')).toHaveCount(9)
  await board.getByRole('gridcell').nth(0).focus()
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowDown')
  const open = page.locator('[data-window][data-open="true"]')
  await open.waitFor({ timeout: 4000 })
  const idx = await open.getAttribute('data-window')
  await board.locator(`[data-window="${idx}"]`).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByText(/Regalos [1-9]/)).toBeVisible({ timeout: 8000 })

  const timeBefore = await page.getByText(/Tiempo \d+s/).innerText()
  await page.getByRole('button', { name: 'Pausar' }).click()
  await expect(page.getByText('Ronda pausada')).toBeVisible()
  await page.waitForTimeout(1500)
  await expect(page.getByText(timeBefore)).toBeVisible()
  await page.getByRole('button', { name: 'Continuar' }).click()

  await page.getByRole('button', { name: 'Reiniciar' }).click()
  await expect(page.getByRole('button', { name: 'Jugar' })).toBeVisible()
})

test('regalos: fin de ronda no suma después de cero', async ({ page }) => {
  test.setTimeout(45_000)
  await page.goto('/navidad-sitios-web/juegos/regalos')
  await page.getByRole('button', { name: 'Jugar' }).click()
  await expect(page.getByText(/Tiempo \d+s/)).toBeVisible()
  await page.waitForTimeout(31_000)
  await expect(page.getByText(/Atrapaste \d+ regalos/)).toBeVisible()
  const result = await page.getByText(/Atrapaste \d+ regalos/).innerText()
  await page.locator('[data-window="0"]').click({ force: true }).catch(() => {})
  await expect(page.getByText(result)).toBeVisible()
})
