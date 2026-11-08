// Propósito: verificar que la app funciona bajo subruta /navidad-sitios-web/ en build/preview.
import { test, expect } from '@playwright/test'
const origin = 'http://localhost:5174'

test('landing bajo base path', async ({ page }) => {
  await page.goto(`${origin}/navidad-sitios-web/`)
  await expect(page.getByRole('link', { name: 'Villa Navidad' })).toBeVisible()
  await expect(page.getByText(/Cuenta regresiva a Navidad/i)).toBeVisible()
})

test('navegación bajo base path', async ({ page }) => {
  await page.goto(`${origin}/navidad-sitios-web/`)
  await page.getByRole('navigation').getByRole('link', { name: 'Tarjetas' }).click()
  await expect(page.getByRole('heading', { name: 'Tarjetas' })).toBeVisible()
  await page.getByRole('navigation').getByRole('link', { name: 'Juegos' }).click()
  await expect(page.getByRole('heading', { name: 'Juegos' })).toBeVisible()
})
