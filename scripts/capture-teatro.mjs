/* Propósito: grabar ~8s del teatro del regalo tras la suite, sin cambiar Playwright global. */
import { chromium } from '@playwright/test'
import { mkdirSync, renameSync, readdirSync } from 'node:fs'

const ART = '/opt/cursor/artifacts'
const BASE = process.env.TEATRO_BASE || 'http://localhost:5174/navidad-sitios-web/'
mkdirSync(ART, { recursive: true })

const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  reducedMotion: 'no-preference',
  recordVideo: { dir: ART, size: { width: 1280, height: 720 } },
})
const page = await context.newPage()
await page.goto(BASE, { waitUntil: 'domcontentloaded' })
await page.getByRole('heading', { name: /La magia/ }).waitFor()
await page.waitForTimeout(8500)
await context.close()
await browser.close()

const video = readdirSync(ART).find((f) => f.endsWith('.webm'))
if (video && video !== 'v2-teatro-8s.webm') {
  renameSync(`${ART}/${video}`, `${ART}/v2-teatro-8s.webm`)
}
console.log('teatro video → /opt/cursor/artifacts/v2-teatro-8s.webm')
