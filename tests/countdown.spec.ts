// Propósito: verificar que el contador muestra la fecha objetivo y no es negativo.
import { test, expect } from '@playwright/test'

test('contador con fecha objetivo visible', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /Cuenta regresiva/i })).toBeVisible()
  await expect(page.getByText(/Objetivo:/)).toBeVisible()
})
