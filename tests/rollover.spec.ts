// Propósito: probar rollover de Navidad en util de fecha.
import { test, expect } from '@playwright/test'
import { getNextChristmas } from '../src/villa/utils/date'

test('rollover antes del 25/dic apunta a ese año', () => {
  const now = new Date('2026-12-24T12:00:00')
  const { target } = getNextChristmas(now)
  expect(target.getFullYear()).toBe(2026)
  expect(target.getMonth()).toBe(11)
  expect(target.getDate()).toBe(25)
})

test('rollover en o después del 25/dic apunta al siguiente año', () => {
  const now = new Date('2026-12-25T10:00:00')
  const { target } = getNextChristmas(now)
  expect(target.getFullYear()).toBe(2027)
  expect(target.getMonth()).toBe(11)
  expect(target.getDate()).toBe(25)
})
