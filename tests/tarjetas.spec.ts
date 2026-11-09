// Propósito: edición de tarjeta y descarga PNG 1080 canónico.
import { test, expect } from '@playwright/test'
import fs from 'node:fs'
import { PNG } from 'pngjs'

test('edición y descarga de tarjeta 1080', async ({ page }) => {
  await page.goto('/navidad-sitios-web/tarjetas')
  await expect(page.getByRole('heading', { name: /poquito de vos/i })).toBeVisible()
  await page.getByRole('textbox', { name: 'Para' }).fill('Daniel')
  await page.getByRole('textbox', { name: 'Tu mensaje' }).fill('¡Feliz Navidad! Muchas gracias por todo.')
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: /Descargar PNG/ }).click(),
  ])
  const path = await download.path()
  expect(path).not.toBeNull()
  if (path) {
    const buf = fs.readFileSync(path)
    expect(buf.length).toBeGreaterThan(1000)
    const png = PNG.sync.read(buf)
    expect(png.width).toBe(1080)
    expect(png.height).toBe(1080)
  }
})

test('cambiar plantilla conserva campos', async ({ page }) => {
  await page.goto('/navidad-sitios-web/tarjetas')
  await page.getByRole('textbox', { name: 'Para' }).fill('Sofía')
  await page.getByRole('textbox', { name: 'Tu mensaje' }).fill('Que nunca nos falten las ganas.')
  await page.getByRole('button', { name: /Bosque/ }).click()
  await expect(page.getByRole('textbox', { name: 'Para' })).toHaveValue('Sofía')
  await expect(page.getByRole('textbox', { name: 'Tu mensaje' })).toHaveValue('Que nunca nos falten las ganas.')
  await expect(page.getByRole('button', { name: /Bosque/ })).toHaveAttribute('aria-pressed', 'true')
})
