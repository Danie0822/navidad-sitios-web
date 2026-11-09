// Propósito: app bajo /navidad-sitios-web/, recargas profundas y 404 de assets.
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
  await expect(page.getByRole('heading', { name: /poquito de vos/i })).toBeVisible()
  await page.getByRole('navigation').getByRole('link', { name: 'Juegos' }).click()
  await expect(page.getByRole('heading', { name: /Jugá un ratito/i })).toBeVisible()
})

test('recarga profunda de juegos', async ({ page }) => {
  await page.goto(`${origin}/navidad-sitios-web/juegos/memoria`)
  await expect(page.getByRole('heading', { name: 'Memoria' })).toBeVisible()
  await page.goto(`${origin}/navidad-sitios-web/juegos/regalos`)
  await expect(page.getByRole('heading', { name: 'Regalos escondidos' })).toBeVisible()
})

test('fallback ?p= de 404.html', async ({ page }) => {
  await page.goto(`${origin}/navidad-sitios-web/?p=${encodeURIComponent('/juegos/memoria')}`)
  await expect(page.getByRole('heading', { name: 'Memoria' })).toBeVisible()
})

test('asset inexistente responde 404', async ({ request }) => {
  const res = await request.get(`${origin}/navidad-sitios-web/assets/no-existe-v2.js`)
  expect(res.status()).toBe(404)
})

test('ruta desconocida muestra aviso', async ({ page }) => {
  await page.goto(`${origin}/navidad-sitios-web/no-existe`)
  await expect(page.getByRole('heading', { name: /No encontramos/i })).toBeVisible()
})
