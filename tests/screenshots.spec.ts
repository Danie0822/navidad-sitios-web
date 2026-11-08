// Propósito: tomar capturas desktop y móvil para transferencia.
import { test, expect } from '@playwright/test'
import fs from 'node:fs'

test('capturas landing (desktop y móvil)', async ({ page, browserName }) => {
  await page.goto('/navidad-sitios-web/')
  await page.waitForLoadState('domcontentloaded')
  // Esperar contenido visible y final de animación (~800ms)
  await expect(page.getByRole('heading', { name: 'La magia está en dar.' })).toBeVisible()
  await page.waitForTimeout(900)
  // Captura temprana adicional (entrada)
  const ePath = '/opt/cursor/artifacts/villa-navidad-early.png'
  await page.screenshot({ path: ePath, fullPage: true })
  // Desktop
  await page.setViewportSize({ width: 1280, height: 800 })
  const dPath = '/opt/cursor/artifacts/villa-navidad-desktop.png'
  await page.screenshot({ path: dPath, fullPage: true })
  if (!fs.existsSync(dPath)) throw new Error('Desktop screenshot no creado')
  // Mobile-like
  await page.setViewportSize({ width: 390, height: 844 })
  const mPath = '/opt/cursor/artifacts/villa-navidad-mobile.png'
  await page.screenshot({ path: mPath, fullPage: true })
  if (!fs.existsSync(mPath)) throw new Error('Mobile screenshot no creado')
  // Captura >=5s para fin de nieve
  await page.waitForTimeout(4200)
  const endPath = '/opt/cursor/artifacts/villa-navidad-late.png'
  await page.screenshot({ path: endPath, fullPage: true })
})
