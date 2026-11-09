// Propósito: navegación entre secciones V2 y catálogo de exactamente dos juegos.
import { test, expect } from '@playwright/test'

test('navegación principal', async ({ page }) => {
  await page.goto('/navidad-sitios-web/')
  await expect(page.getByRole('link', { name: 'Villa Navidad' })).toBeVisible()

  await page.getByRole('navigation').getByRole('link', { name: 'Tarjetas' }).click()
  await expect(page.getByRole('heading', { name: /poquito de vos/i })).toBeVisible()

  await page.getByRole('navigation').getByRole('link', { name: 'Juegos' }).click()
  await expect(page.getByRole('heading', { name: /Jugá un ratito/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /Jugar memoria/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /Buscar regalos/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /Jugar memoria/ })).toHaveCount(1)
  await expect(page.getByRole('link', { name: /Buscar regalos/ })).toHaveCount(1)
})

test('rutas de juego aisladas y volver', async ({ page }) => {
  await page.goto('/navidad-sitios-web/juegos')
  await page.getByRole('link', { name: /Jugar memoria/ }).click()
  await expect(page.getByRole('heading', { name: 'Memoria' })).toBeVisible()
  await expect(page.getByRole('grid', { name: /Tablero de memoria/ })).toBeVisible()
  await expect(page.getByRole('grid', { name: /Ventanas de regalos/ })).toHaveCount(0)
  await page.getByRole('link', { name: 'Volver a juegos' }).click()
  await expect(page.getByRole('heading', { name: /Jugá un ratito/i })).toBeVisible()
  await expect(page.locator('#catalog-memoria')).toBeFocused()

  await page.getByRole('link', { name: /Buscar regalos/ }).click()
  await expect(page.getByRole('heading', { name: 'Regalos escondidos' })).toBeVisible()
  await expect(page.getByRole('grid', { name: /Tablero de memoria/ })).toHaveCount(0)
  await page.getByRole('link', { name: 'Volver a juegos' }).click()
  await expect(page.locator('#catalog-regalos')).toBeFocused()
})
