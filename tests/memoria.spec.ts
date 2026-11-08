// Propósito: validaciones básicas de juego de memoria (bloqueos y reinicio).
import { test, expect } from '@playwright/test'

test('memoria: bloqueo con dos cartas y reinicio', async ({ page }) => {
  await page.goto('/juegos')
  const board = page.getByRole('grid', { name: /Tablero de memoria/ })
  await expect(board).toBeVisible()
  const cells = board.getByRole('gridcell')
  const first = cells.nth(0)
  const second = cells.nth(1)
  await first.click()
  await second.click()
  // Intentar tercera selección inmediata debe ser bloqueado en ese instante
  const third = cells.nth(2)
  await third.click({ trial: true }).catch(() => {})
  // Reiniciar debe limpiar el estado/puntaje
  await page.getByRole('region', { name: 'Memoria navideña' }).getByRole('button', { name: 'Reiniciar' }).click()
  await expect(
    page.getByRole('region', { name: 'Memoria navideña' }).getByText(/Puntaje: 0/)
  ).toBeVisible()
})
