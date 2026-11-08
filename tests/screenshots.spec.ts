// Propósito: tomar capturas desktop y móvil para transferencia.
import { test } from '@playwright/test'
import fs from 'node:fs'

test('capturas landing (desktop y móvil)', async ({ page, browserName }) => {
  await page.goto('/')
  await page.waitForLoadState('domcontentloaded')
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
})
