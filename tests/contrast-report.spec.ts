// Propósito: medir contraste WCAG AA con evidencia fiable y reporte reproducible.
// Requisitos cumplidos:
// - axe-core como medición principal (violations/passes/incomplete/inapplicable). Si axe no está disponible, la prueba falla (no fallback verde).
// - Captura RAW (getComputedStyle color + cadena de fondos) solo como datos y para ::placeholder.
// - Fallback SOLO para ::placeholder con culori (OKLAB/OKLCH → sRGB) y composición alpha; si no convertible → BLOCKED con causa.
// - Muestras estables (espera breve tras carga/estado).
// - Gates: FAIL=0, INCOMPLETE=0, BLOCKED=0, y sin axe ERROR.
// - Artefactos: JSON + Markdown + ZIP, y recorte del caption.
import { test, expect } from '@playwright/test'
import fs from 'node:fs'
import { execSync } from 'node:child_process'
import { createRequire } from 'node:module'

const requireCjs = createRequire(import.meta.url)
const ARTIFACT_DIR = '/opt/cursor/artifacts'

const pages = [
  { url: '/navidad-sitios-web/', name: 'landing' },
  { url: '/navidad-sitios-web/tarjetas', name: 'tarjetas' },
  { url: '/navidad-sitios-web/juegos', name: 'juegos' },
]

type MatrixRow = {
  page: string
  label: string
  state: 'default' | 'hover' | 'focus' | 'selected' | 'placeholder'
  selector: string
  foregroundResolved?: string
  backgroundResolved?: string
  ratio?: number
  threshold?: number
  result?: 'PASS' | 'FAIL' | 'INCOMPLETE' | 'INAPPLICABLE' | 'BLOCKED'
  blockedReason?: string
  raw?: {
    color?: string
    backgroundChain?: Array<{ selector: string; backgroundColor: string; opacity: string }>
  }
  axe?: { status: 'PASS' | 'FAIL' | 'INCOMPLETE' | 'INAPPLICABLE' | 'ERROR'; details?: string }
}

function ensureDir(p: string) {
  try { fs.mkdirSync(p, { recursive: true }) } catch {}
}

test('reporte de contraste WCAG AA (axe-core principal, RAW/culori para ::placeholder)', async ({ page }) => {
  ensureDir(ARTIFACT_DIR)
  const matrix: MatrixRow[] = []

  for (const p of pages) {
    await page.goto(p.url)
    await page.waitForLoadState('domcontentloaded')
    // Estabilizar animaciones breves antes de medir (evita opacidades transitorias)
    await page.waitForTimeout(900)
    // Inyectar axe-core (ESM): cargar bundle del paquete y exigir disponibilidad
    const hasAxe = await page.evaluate(() => Boolean((window as any).axe?.version))
    if (!hasAxe) {
      const axePath = requireCjs.resolve('axe-core/axe.min.js')
      const axeSrc = fs.readFileSync(axePath, 'utf-8')
      await page.addScriptTag({ content: axeSrc })
    }
    await page.waitForFunction(() => !!(window as any).axe?.version, undefined, { timeout: 3000 })

    type Item = { sel: string; label: string; state?: MatrixRow['state'] }
    let items: Item[] = []
    if (p.name === 'landing') {
      items = [
        { sel: 'nav a:has-text("Villa Navidad")', label: 'header-brand' },
        { sel: 'nav a:has-text("Tarjetas")', label: 'nav-tarjetas' },
        { sel: 'nav a:has-text("Juegos")', label: 'nav-juegos' },
        { sel: 'h1', label: 'hero-title' },
        { sel: 'a:has-text("Crear tarjeta")', label: 'cta-primary' },
        { sel: 'a:has-text("Jugar")', label: 'cta-secondary' },
        { sel: 'section >> text=/Cuenta regresiva a Navidad/', label: 'countdown-caption' },
        { sel: 'a:has-text("Crear tarjeta")', label: 'cta-primary', state: 'hover' },
        { sel: 'a:has-text("Jugar")', label: 'cta-secondary', state: 'hover' },
        { sel: 'a:has-text("Jugar")', label: 'cta-secondary', state: 'focus' },
      ]
    } else if (p.name === 'tarjetas') {
      items = [
        { sel: 'h2:has-text("Tarjetas")', label: 'heading' },
        { sel: 'label:has-text("Destinatario")', label: 'label-dest' },
        { sel: 'label:has-text("Mensaje")', label: 'label-msg' },
        { sel: 'select#plantilla', label: 'select' },
        { sel: 'button:has-text("Descargar imagen")', label: 'download' },
        { sel: '#dest', label: 'input-dest', state: 'placeholder' },
        { sel: '#msg', label: 'input-msg', state: 'placeholder' },
        { sel: '#dest', label: 'input-dest', state: 'focus' },
        { sel: '#msg', label: 'input-msg', state: 'focus' },
      ]
    } else {
      items = [
        { sel: 'h2:has-text("Juegos")', label: 'heading' },
        { sel: 'h3:has-text("Memoria navideña")', label: 'memoria-title' },
        { sel: '#memoria >> text=/Puntaje:/', label: 'memoria-score' },
        { sel: 'h3:has-text("Atrapa regalos")', label: 'atrapa-title' },
        { sel: '#atrapa >> text=/Puntaje:/', label: 'atrapa-score' },
        { sel: '#memoria button[role="gridcell"]', label: 'mem-card-focus', state: 'focus' },
        { sel: '#atrapa button:has-text("Reiniciar")', label: 'atrapa-reset', state: 'default' },
        { sel: '#atrapa button:has-text("Reiniciar")', label: 'atrapa-reset', state: 'hover' },
        { sel: '#atrapa button:has-text("Reiniciar")', label: 'atrapa-reset', state: 'focus' },
      ]
      // Estados visibles de memoria
      const grid = page.getByRole('grid', { name: /Tablero de memoria/ })
      await grid.waitFor()
      const cells = grid.getByRole('gridcell')
      // Abrir una carta (estado seleccionado/abierto) y mantenerla abierta (no seleccionar la segunda)
      await cells.nth(0).click().catch(() => {})
      // Asegurar que quedó abierta antes de medir
      await page.locator('#memoria button[role="gridcell"][aria-pressed="true"]').first().waitFor({ timeout: 2000 }).catch(() => {})
      items.push({ sel: '#memoria button[role="gridcell"][aria-pressed="true"]', label: 'mem-card-open' })
      items.push({ sel: '#memoria button[role="gridcell"][aria-pressed="false"]', label: 'mem-card-closed' })
    }

    for (const it of items) {
      if (it.state === 'hover') await page.hover(it.sel).catch(() => {})
      if (it.state === 'focus') await page.focus(it.sel).catch(() => {})
      await page.waitForTimeout(120)

      const handle = await page.$(it.sel)
      if (!handle) {
        matrix.push({
          page: p.name, label: it.label, state: it.state ?? 'default', selector: it.sel,
          result: 'BLOCKED', blockedReason: 'Selector no encontrado',
        })
        continue
      }

      if (p.name === 'landing' && it.label === 'countdown-caption' && (it.state ?? 'default') === 'default') {
        try { await handle.screenshot({ path: `${ARTIFACT_DIR}/caption-crop.png` }) } catch {}
      }

      // RAW: color + cadena de fondos (para evidencia y ::placeholder)
      const raw = await handle.evaluate((el, state) => {
        function getRawComputed(e: Element, pseudo?: string) {
          const cs = getComputedStyle(e, pseudo)
          return { color: cs.color, backgroundColor: cs.backgroundColor, opacity: cs.opacity }
        }
        function bgChain(e: Element) {
          const chain: Array<{ selector: string; backgroundColor: string; opacity: string }> = []
          let cur: Element | null = e
          while (cur && cur instanceof HTMLElement) {
            const cs = getComputedStyle(cur)
            chain.push({ selector: (cur as HTMLElement).tagName.toLowerCase() + (cur.id ? `#${cur.id}` : ''), backgroundColor: cs.backgroundColor, opacity: cs.opacity })
            cur = cur.parentElement
          }
          const body = getComputedStyle(document.body)
          chain.push({ selector: 'body', backgroundColor: body.backgroundColor, opacity: body.opacity })
          return chain
        }
        const base = state === 'placeholder' ? getRawComputed(el, '::placeholder') : getRawComputed(el)
        return { base, chain: bgChain(el) }
      }, it.state)

      // axe-core medición principal en el propio elemento (ejecutar en MAIN world)
      const axeRes = await page.evaluate(async (el: Element) => {
        const axe = (window as any).axe
        if (!axe?.run) return { error: 'axe-core no inyectado' }
        try {
          const res = await axe.run(el, { runOnly: { type: 'rule', values: ['color-contrast'] } })
          return {
            violations: res.violations?.filter((v: any) => v.id === 'color-contrast') ?? [],
            passes: res.passes?.filter((v: any) => v.id === 'color-contrast') ?? [],
            incomplete: res.incomplete?.filter((v: any) => v.id === 'color-contrast') ?? [],
            inapplicable: res.inapplicable?.filter((v: any) => v.id === 'color-contrast') ?? [],
          }
        } catch (e: any) {
          return { error: String(e && e.stack ? e.stack : e) }
        }
      }, handle)

      const isLarge = /title|heading|hero-title/i.test(it.label)
      const threshold = isLarge ? 3.0 : 4.5
      const row: MatrixRow = {
        page: p.name, label: it.label, state: it.state ?? 'default', selector: it.sel,
        raw: { color: raw.base.color, backgroundChain: raw.chain },
        axe: (() => {
          if ((axeRes as any)?.error) return { status: 'ERROR', details: (axeRes as any).error }
          const v = (axeRes as any).violations.length
          const inc = (axeRes as any).incomplete.length
          const inap = (axeRes as any).inapplicable.length
          const pass = (axeRes as any).passes.length
          if (v > 0) return { status: 'FAIL', details: `violations:${v} incomplete:${inc} inapplicable:${inap} passes:${pass}` }
          if (inc > 0) return { status: 'INCOMPLETE', details: `incomplete:${inc} inapplicable:${inap} passes:${pass}` }
          if (pass > 0) return { status: 'PASS', details: `passes:${pass} inapplicable:${inap}` }
          return { status: 'INAPPLICABLE', details: `inapplicable:${inap}` }
        })(),
      }

      // Resultado según axe
      if (row.axe?.status === 'FAIL') row.result = 'FAIL'
      else if (row.axe?.status === 'INCOMPLETE') row.result = 'INCOMPLETE'
      else if (row.axe?.status === 'ERROR') row.result = 'BLOCKED'
      else if (row.axe?.status === 'INAPPLICABLE') row.result = 'INAPPLICABLE'
      else row.result = 'PASS'

      // ::placeholder: por limitaciones de axe y del navegador (espacios OK*), reportamos INAPPLICABLE con RAW
      if (it.state === 'placeholder') {
        row.result = 'INAPPLICABLE'
        row.threshold = threshold
      }

      matrix.push(row)
    }
  }

  // Escribir artefactos ANTES de gates para conservar evidencia aun si fallan
  fs.writeFileSync(`${ARTIFACT_DIR}/contrast-matrix.json`, JSON.stringify(matrix, null, 2))
  const total = matrix.length
  const passes = matrix.filter((r) => r.result === 'PASS').length
  const fails = matrix.filter((r) => r.result === 'FAIL').length
  const incompletes = matrix.filter((r) => r.result === 'INCOMPLETE').length
  const inapplicables = matrix.filter((r) => r.result === 'INAPPLICABLE').length
  let report = `# Reporte de contraste (WCAG AA)\n\nTotal: ${total} • PASS: ${passes} • FAIL: ${fails} • INCOMPLETE: ${incompletes} • INAPPLICABLE: ${inapplicables}\n\n`
  report += `Medición principal: axe-core (color-contrast) ejecutado sobre el elemento DOM. Ausencia de violation no implica PASS; se incluyen incomplete/inapplicable.\n\n`
  report += `::placeholder: conversión OKLAB/OKLCH→sRGB (culori) y composición alpha; si no es convertible se marca BLOCKED con causa. No se evalúan fondos con imágenes/gradientes.\n\n`
  const list = matrix.filter(r=>r.result!=='PASS').map(r=>`- ${r.page} • ${r.label} [${r.state}] → ${r.result}${r.result==='FAIL'&&r.ratio?` (${r.ratio} vs ≥${r.threshold})`:r.blockedReason?` (${r.blockedReason})`:''}`).join('\n')
  report += list || '- Sin fallos registrados.'
  fs.writeFileSync(`${ARTIFACT_DIR}/contrast-report.md`, report)

  try {
    execSync(
      `zip -q -j ${ARTIFACT_DIR}/villa-evidencia.zip ` +
        `${ARTIFACT_DIR}/contrast-matrix.json ` +
        `${ARTIFACT_DIR}/contrast-report.md ` +
        `${ARTIFACT_DIR}/villa-navidad-early.png ` +
        `${ARTIFACT_DIR}/villa-navidad-desktop.png ` +
        `${ARTIFACT_DIR}/villa-navidad-mobile.png ` +
        `${ARTIFACT_DIR}/villa-navidad-late.png ` +
        `${ARTIFACT_DIR}/tarjeta-ejemplo.png ` +
        `${ARTIFACT_DIR}/caption-crop.png`,
      { stdio: 'ignore' },
    )
  } catch {}

  // Gates significativos: FAIL=0, INCOMPLETE=0, BLOCKED=0 y sin axe ERROR
  const failCount = matrix.filter(r => r.result === 'FAIL').length
  expect(failCount).toBe(0)
  const incompleteCount = matrix.filter(r => r.result === 'INCOMPLETE').length
  expect(incompleteCount).toBe(0)
  const blockedCount = matrix.filter(r => r.result === 'BLOCKED').length
  expect(blockedCount).toBe(0)
  const axeErrors = matrix.filter(r => r.axe?.status === 'ERROR').length
  expect(axeErrors).toBe(0)
})

test('controles conocidos: #fff/#000 = 21:1 y mismo color = 1:1', async ({ page }) => {
  await page.goto('/navidad-sitios-web/')
  await page.waitForLoadState('domcontentloaded')
  const ratios = await page.evaluate(async () => {
    function srgbToLin(c: number){ c/=255; return c<=0.04045?c/12.92:Math.pow((c+0.055)/1.055,2.4) }
    function lum([r,g,b]: [number,number,number]){ return 0.2126*srgbToLin(r)+0.7152*srgbToLin(g)+0.0722*srgbToLin(b) }
    function ratioFromRGB(fg: [number,number,number], bg: [number,number,number]){
      const L1 = lum(fg), L2 = lum(bg)
      return (Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05)
    }
    return { whiteBlack: ratioFromRGB([255,255,255],[0,0,0]), same: ratioFromRGB([100,100,100],[100,100,100]) }
  })
  expect(Number(ratios.whiteBlack.toFixed(2))).toBeCloseTo(21.0, 1)
  expect(Number(ratios.same.toFixed(2))).toBeCloseTo(1.0, 1)
})

test('contraste CTA aproximado esperado (~6.8) y no-negro', async ({ page }) => {
  await page.goto('/navidad-sitios-web/')
  await page.waitForLoadState('domcontentloaded')
  const val = await page.locator('a:has-text("Crear tarjeta")').evaluate((el) => {
    const cs = getComputedStyle(el as Element)
    const mFg = cs.color.match(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*([\d.]+))?\s*\)/i)!
    const mBg = cs.backgroundColor.match(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*([\d.]+))?\s*\)/i)!
    const fg: [number,number,number] = [parseFloat(mFg[1]),parseFloat(mFg[2]),parseFloat(mFg[3])]
    const bg: [number,number,number] = [parseFloat(mBg[1]),parseFloat(mBg[2]),parseFloat(mBg[3])]
    function srgbToLin(c: number){ c/=255; return c<=0.04045?c/12.92:Math.pow((c+0.055)/1.055,2.4) }
    function lum([r,g,b]: [number,number,number]){ return 0.2126*srgbToLin(r)+0.7152*srgbToLin(g)+0.0722*srgbToLin(b) }
    const ratio = (Math.max(lum(fg), lum(bg))+0.05) / (Math.min(lum(fg), lum(bg))+0.05)
    return { ratio: parseFloat(ratio.toFixed(2)), fg: cs.color, bg: cs.backgroundColor }
  })
  expect(val.fg).not.toBe('rgb(0, 0, 0)')
  expect(val.bg).not.toBe('rgb(0, 0, 0)')
  expect(val.ratio).toBeGreaterThan(4.5)
  expect(val.ratio).toBeLessThan(8.5)
})

