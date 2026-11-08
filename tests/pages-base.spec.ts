// Propósito: verificar que la app funciona bajo subruta /navidad-sitios-web/ en build/preview.
import { test, expect } from '@playwright/test'
import { spawn } from 'node:child_process'
import http from 'node:http'

let proc: ReturnType<typeof spawn> | null = null
const origin = 'http://localhost:5174'

async function waitForServer(url: string, timeoutMs = 15000) {
  const start = Date.now()
  return new Promise<void>((resolve, reject) => {
    const tick = () => {
      const req = http.get(url, (res) => {
        res.resume()
        resolve()
      })
      req.on('error', () => {
        if (Date.now() - start > timeoutMs) reject(new Error('server timeout'))
        else setTimeout(tick, 300)
      })
    }
    tick()
  })
}

test.beforeAll(async () => {
  proc = spawn('npm', ['run', 'preview:pages'], { stdio: 'inherit' })
  await waitForServer(`${origin}/navidad-sitios-web/`)
})

test.afterAll(async () => {
  if (proc) {
    proc.kill()
    proc = null
  }
})

test('landing bajo base path', async ({ page }) => {
  await page.goto(`${origin}/navidad-sitios-web/`)
  await expect(page.getByRole('heading', { name: 'Villa Navidad' })).toBeVisible()
  await expect(page.getByRole('heading', { name: /Cuenta regresiva/i })).toBeVisible()
})

test('navegación bajo base path', async ({ page }) => {
  await page.goto(`${origin}/navidad-sitios-web/`)
  await page.getByRole('navigation').getByRole('link', { name: 'Tarjetas' }).click()
  await expect(page.getByRole('heading', { name: 'Tarjetas' })).toBeVisible()
  await page.getByRole('navigation').getByRole('link', { name: 'Juegos' }).click()
  await expect(page.getByRole('heading', { name: 'Juegos' })).toBeVisible()
})
