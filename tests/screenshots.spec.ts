// Propósito: capturas reales de todas las rutas desktop/móvil, movimiento y pausa.
import { test, expect } from '@playwright/test'
import fs from 'node:fs'

const ART = '/opt/cursor/artifacts'
const routes = [
  { path: '/navidad-sitios-web/', name: 'inicio', wait: /La magia/ },
  { path: '/navidad-sitios-web/tarjetas', name: 'tarjetas', wait: /poquito de vos/i },
  { path: '/navidad-sitios-web/juegos', name: 'juegos', wait: /Jugá un ratito/i },
  { path: '/navidad-sitios-web/juegos/memoria', name: 'memoria', wait: /^Memoria$/ },
  { path: '/navidad-sitios-web/juegos/regalos', name: 'regalos', wait: /Regalos escondidos/ },
]

test('capturas de todas las rutas (desktop y móvil)', async ({ page }) => {
  test.setTimeout(90_000)
  fs.mkdirSync(ART, { recursive: true })
  for (const r of routes) {
    await page.goto(r.path)
    await page.waitForLoadState('domcontentloaded')
    await expect(page.getByRole('heading', { name: r.wait })).toBeVisible()
    if (r.name === 'tarjetas') {
      await page.getByRole('textbox', { name: 'Para' }).fill('Sofía')
      await page.getByRole('textbox', { name: 'Tu mensaje' }).fill('Que nunca nos falten\nlas ganas de encontrarnos.\nCon todo mi cariño.')
    }
    await page.waitForTimeout(800)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.screenshot({ path: `${ART}/v2-${r.name}-desktop.png`, fullPage: true })
    await page.setViewportSize({ width: 390, height: 844 })
    await page.screenshot({ path: `${ART}/v2-${r.name}-mobile.png`, fullPage: true })
  }
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/navidad-sitios-web/')
  await expect(page.getByRole('heading', { name: /La magia/ })).toBeVisible()
  await page.waitForTimeout(1300)
  await page.screenshot({ path: `${ART}/v2-inicio-motion-1s.png`, fullPage: true })
  await page.waitForTimeout(2400)
  await page.screenshot({ path: `${ART}/v2-inicio-motion-3s.png`, fullPage: true })
  await page.getByRole('button', { name: /Pausar animaciones/ }).click()
  await page.screenshot({ path: `${ART}/v2-inicio-pausa.png`, fullPage: true })
  await page.goto('/navidad-sitios-web/tarjetas')
  await page.getByRole('textbox', { name: 'Para' }).fill('Sofía')
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.screenshot({ path: `${ART}/v2-tarjetas-editando.png`, fullPage: true })
  await page.getByRole('button', { name: /Pausar animación/ }).click()
  await page.screenshot({ path: `${ART}/v2-tarjetas-pausa.png`, fullPage: true })

  await page.goto('/navidad-sitios-web/juegos/regalos')
  await page.getByRole('button', { name: 'Jugar' }).click()
  await page.locator('[data-open="true"]').waitFor({ timeout: 4000 })
  await page.screenshot({ path: `${ART}/v2-regalos-jugando.png`, fullPage: true })
  await page.getByRole('button', { name: 'Pausar' }).click()
  await page.screenshot({ path: `${ART}/v2-regalos-pausa.png`, fullPage: true })

  for (const w of [320, 768, 1024] as const) {
    await page.setViewportSize({ width: w, height: 800 })
    await page.goto('/navidad-sitios-web/')
    await expect(page.getByRole('heading', { name: /La magia/ })).toBeVisible()
    await page.screenshot({ path: `${ART}/v2-inicio-${w}.png`, fullPage: true })
    await page.goto('/navidad-sitios-web/tarjetas')
    await expect(page.getByRole('heading', { name: /poquito de vos/i })).toBeVisible()
    await page.screenshot({ path: `${ART}/v2-tarjetas-${w}.png`, fullPage: true })
    await page.goto('/navidad-sitios-web/juegos')
    await expect(page.getByRole('heading', { name: /Jugá un ratito/i })).toBeVisible()
    await page.screenshot({ path: `${ART}/v2-juegos-${w}.png`, fullPage: true })
  }
})

test('fotogramas de teatro del regalo (ciclo 8s)', async ({ page }) => {
  test.setTimeout(20_000)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto('/navidad-sitios-web/')
  await expect(page.getByRole('heading', { name: /La magia/ })).toBeVisible()
  await page.screenshot({ path: `${ART}/v2-teatro-0ms.png` })
  await page.waitForTimeout(1200)
  await page.screenshot({ path: `${ART}/v2-teatro-1200ms.png` })
  await page.waitForTimeout(2400)
  await page.screenshot({ path: `${ART}/v2-teatro-3600ms.png` })
  await page.waitForTimeout(2400)
  await page.screenshot({ path: `${ART}/v2-teatro-6000ms.png` })
  await page.waitForTimeout(2000)
  await page.screenshot({ path: `${ART}/v2-teatro-8000ms.png` })
})
