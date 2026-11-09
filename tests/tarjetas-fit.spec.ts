// Propósito: área segura por plantilla; bloquear PNG si dest/msg invaden el arte.
import { test, expect } from '@playwright/test'
import fs from 'node:fs'
import { PNG } from 'pngjs'

const DEST = 'Ñandú Pérez'
const EIGHT = ['Línea1', 'Línea2', 'Línea3', 'Línea4', 'Línea5', 'Línea6', 'Línea7', 'Línea8'].join('\n')
const WORD200 = 'X'.repeat(200)
const UNI_DEST = 'Mamá Ñoño'
const UNI_MSG = 'piñón 🎄 café'
const VALID = 'Que nunca nos falten\nlas ganas de encontrarnos.\nCon todo mi cariño.'
const TEMPLATES = ['Villa', 'Bosque', 'Regalos'] as const
const ART = '/opt/cursor/artifacts'

async function gotoEditor(page: import('@playwright/test').Page) {
  await page.goto('/navidad-sitios-web/tarjetas')
  await expect(page.getByRole('heading', { name: /poquito de vos/i })).toBeVisible()
}

async function fillCard(page: import('@playwright/test').Page, dest: string, msg: string) {
  await page.getByRole('textbox', { name: 'Para' }).fill(dest)
  await page.getByRole('textbox', { name: 'Tu mensaje' }).fill(msg)
}

async function expectFits(page: import('@playwright/test').Page, fits: boolean) {
  await expect(page.locator('[data-preview="live"]')).toHaveAttribute('data-fits', fits ? 'true' : 'false', {
    timeout: 8000,
  })
}

async function downloadPng(page: import('@playwright/test').Page) {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: /Descargar PNG/ }).click(),
  ])
  const path = await download.path()
  expect(path).toBeTruthy()
  const buf = fs.readFileSync(path!)
  const png = PNG.sync.read(buf)
  expect(png.width).toBe(1080)
  expect(png.height).toBe(1080)
  return buf
}

test.describe('área segura tarjetas', () => {
  test('8 saltos reales: aviso, sin PNG, texto íntegro al cambiar plantilla y al editar', async ({ page }) => {
    test.setTimeout(60_000)
    fs.mkdirSync(ART, { recursive: true })
    await gotoEditor(page)
    await fillCard(page, DEST, EIGHT)
    await expect(page.getByRole('textbox', { name: 'Tu mensaje' })).toHaveValue(EIGHT)
    await expectFits(page, false)
    await expect(page.getByRole('button', { name: /Descargar PNG/ })).toBeDisabled()
    await expect(page.getByRole('status')).toContainText(/área segura/)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.screenshot({ path: `${ART}/v2-tarjetas-overflow-villa.png`, fullPage: true })

    for (const name of ['Regalos', 'Bosque'] as const) {
      await page.getByRole('button', { name: new RegExp(name) }).click()
      await expect(page.getByRole('textbox', { name: 'Para' })).toHaveValue(DEST)
      await expect(page.getByRole('textbox', { name: 'Tu mensaje' })).toHaveValue(EIGHT)
      await expectFits(page, false)
      await expect(page.getByRole('button', { name: /Descargar PNG/ })).toBeDisabled()
      await page.screenshot({ path: `${ART}/v2-tarjetas-overflow-${name.toLowerCase()}.png`, fullPage: true })
    }

    const downloadRace = page.waitForEvent('download', { timeout: 1500 }).then(() => 'got').catch(() => 'none')
    await page.getByRole('textbox', { name: 'Para' }).press('Enter')
    expect(await downloadRace).toBe('none')

    await fillCard(page, DEST, VALID)
    await expectFits(page, true)
    await expect(page.getByRole('textbox', { name: 'Tu mensaje' })).toHaveValue(VALID)
    await expect(page.getByRole('button', { name: /Descargar PNG/ })).toBeEnabled()
  })

  test('palabra 200 sin espacios bloquea export en las 3 plantillas y conserva entrada', async ({ page }) => {
    await gotoEditor(page)
    for (const name of TEMPLATES) {
      await page.getByRole('button', { name: new RegExp(name) }).click()
      await fillCard(page, DEST, WORD200)
      await expect(page.getByRole('textbox', { name: 'Tu mensaje' })).toHaveValue(WORD200)
      await expectFits(page, false)
      await expect(page.getByRole('button', { name: /Descargar PNG/ })).toBeDisabled()
      await expect(page.getByRole('status')).toContainText(/área segura/)
    }
  })

  test('casos válidos exportan PNG 1080 en las 3 plantillas', async ({ page }) => {
    test.setTimeout(90_000)
    fs.mkdirSync(ART, { recursive: true })
    await gotoEditor(page)
    for (const name of TEMPLATES) {
      await page.getByRole('button', { name: new RegExp(name) }).click()
      await fillCard(page, UNI_DEST, UNI_MSG)
      await expectFits(page, true)
      const uni = await downloadPng(page)
      fs.writeFileSync(`${ART}/v2-png-${name.toLowerCase()}-unicode.png`, uni)

      await fillCard(page, DEST, VALID)
      await expect(page.getByRole('textbox', { name: 'Para' })).toHaveValue(DEST)
      await expectFits(page, true)
      const valid = await downloadPng(page)
      fs.writeFileSync(`${ART}/v2-png-${name.toLowerCase()}-valid.png`, valid)
    }
  })
})
