// Propósito: verificar navegación básica entre las tres secciones.
import { test, expect } from '@playwright/test'

test('navegación principal', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Villa Navidad' })).toBeVisible()

  await page.getByRole('navigation').getByRole('link', { name: 'Tarjetas' }).click()
  await expect(page.getByRole('heading', { name: 'Tarjetas' })).toBeVisible()

  await page.getByRole('navigation').getByRole('link', { name: 'Juegos' }).click()
  await expect(page.getByRole('heading', { name: 'Juegos' })).toBeVisible()
})
