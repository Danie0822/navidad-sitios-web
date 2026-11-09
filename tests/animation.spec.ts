// Propósito: movimiento continuo perceptible, pausa y reduced-motion estático.
import { test, expect } from '@playwright/test'

test('inicio: animación del regalo corre y pausa la congela', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/navidad-sitios-web/')
  const lid = page.locator('.anim-gift-lid').first()
  await expect(lid).toBeVisible()
  const running = await lid.evaluate((el) => getComputedStyle(el).animationPlayState)
  expect(running).toBe('running')
  const name = await lid.evaluate((el) => getComputedStyle(el).animationName)
  expect(name).not.toBe('none')
  await page.getByRole('button', { name: /Pausar animaciones/ }).click()
  const paused = await lid.evaluate((el) => getComputedStyle(el).animationPlayState)
  expect(paused).toBe('paused')
  await page.getByRole('button', { name: /Continuar animaciones/ }).click()
  const resumed = await lid.evaluate((el) => getComputedStyle(el).animationPlayState)
  expect(resumed).toBe('running')
})

test('reduced-motion: pose estática sin loop', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/navidad-sitios-web/')
  await expect(page.getByRole('button', { name: /Pausar animaciones/ })).toHaveCount(0)
  const lid = page.locator('.anim-gift-lid').first()
  const name = await lid.evaluate((el) => getComputedStyle(el).animationName)
  expect(name === 'none' || name === '').toBeTruthy()
})

test('nieve continua no se apaga a los 4s', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/navidad-sitios-web/')
  const snow = page.locator('canvas.snow-canvas')
  await expect(snow).toBeVisible()
  await page.waitForTimeout(5200)
  await expect(snow).toBeVisible()
})
