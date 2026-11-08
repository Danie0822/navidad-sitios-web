// Propósito: edición de tarjeta y descarga de imagen sin cortes.
import { test, expect } from '@playwright/test'
import fs from 'node:fs'

test('edición y descarga de tarjeta', async ({ page, context }, testInfo) => {
  await page.goto('/navidad-sitios-web/tarjetas')
  await expect(page.getByRole('heading', { name: 'Tarjetas' })).toBeVisible()
  await page.getByLabel('Destinatario').fill('Daniel')
  await page.getByLabel('Mensaje').fill('¡Feliz Navidad! Muchas gracias por todo.')
  const [ download ] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: /Descargar imagen/ }).click(),
  ])
  const path = await download.path()
  expect(path).not.toBeNull()
  if (path) {
    const buf = fs.readFileSync(path)
    expect(buf.length).toBeGreaterThan(1000)
  }
})
