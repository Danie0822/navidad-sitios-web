// Propósito: verificar que la nieve está confinada al arco y no cubre cabecera/controles.
import { test, expect } from '@playwright/test'

function within(a: {x:number;y:number;width:number;height:number}, b: {x:number;y:number;width:number;height:number}, tol=2) {
  expect(a.x).toBeGreaterThanOrEqual(b.x - tol)
  expect(a.y).toBeGreaterThanOrEqual(b.y - tol)
  expect(a.x + a.width).toBeLessThanOrEqual(b.x + b.width + tol)
  expect(a.y + a.height).toBeLessThanOrEqual(b.y + b.height + tol)
}

test(`nieve confinada (no-preference) inicio y >=5s`, async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/navidad-sitios-web/')
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(200)
  const nav = page.getByRole('navigation')
  const svg = page.locator('svg[aria-label="Villa navideña en arco"]')
  const snow = page.locator('canvas.snow-canvas')
  await expect(svg).toBeVisible()
  const navBox = await nav.boundingBox()
  const svgBox = await svg.boundingBox()
  const snowBox = await snow.boundingBox().catch(() => null)
  expect(snowBox).not.toBeNull()
  within(snowBox!, svgBox!)
  expect(snowBox!.y).toBeGreaterThanOrEqual((navBox?.y ?? 0) + (navBox?.height ?? 0) - 2)
  await page.waitForTimeout(5200)
  const snowBox2 = await snow.boundingBox().catch(() => null)
  if (snowBox2) within(snowBox2, (await svg.boundingBox())!)
})

test(`nieve confinada (reduce) sin canvas global`, async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/navidad-sitios-web/')
  await page.waitForLoadState('domcontentloaded')
  await expect(page.locator('canvas.snow-canvas')).toHaveCount(0, { timeout: 1500 })
})
