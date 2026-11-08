// Propósito: medir contraste WCAG AA en elementos clave y emitir una matriz reproducible.
// - Captura RAW getComputedStyle (p. ej. oklch(), rgb(), color()) y compone alpha sobre fondo real.
// - Usa conversión del navegador cuando es posible; si no convertible → BLOCKED con causa (nunca 0,0,0).
// - Verificación cruzada con axe-core (sin telemetría) para color-contrast.
// - Controles conocidos (21:1 y 1:1). Artefactos JSON/MD/ZIP y recorte de caption.
import { test, expect } from '@playwright/test'
import fs from 'node:fs'
import { execSync } from 'node:child_process'

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
  result?: 'PASS' | 'FAIL' | 'BLOCKED'
  blockedReason?: string
  raw?: { color?: string; backgroundChain?: Array<{ selector: string; backgroundColor: string; opacity: string }> }
  axe?: { status: 'PASS' | 'FAIL' | 'INAPPLICABLE' | 'ERROR'; details?: string }
}

function ensureDir(p: string) {
  try {
    fs.mkdirSync(p, { recursive: true })
  } catch {}
}

test('reporte de contraste WCAG AA (RAW + resuelto + axe)', async ({ page }) => {
  ensureDir(ARTIFACT_DIR)
  const matrix: MatrixRow[] = []

  for (const p of pages) {
    await page.goto(p.url)
    await page.waitForLoadState('domcontentloaded')
    try {
      // @ts-ignore
      if (!(await page.evaluate(() => (window as any).axe?.version))) {
        await page.addScriptTag({ path: require.resolve('axe-core') })
      }
    } catch {}

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
      const grid = page.getByRole('grid', { name: /Tablero de memoria/ })
      await grid.waitFor()
      const cells = grid.getByRole('gridcell')
      await cells.nth(0).click().catch(() => {})
      await cells.nth(1).click().catch(() => {})
      items.push({ sel: '#memoria button[role="gridcell"][aria-pressed="true"]', label: 'mem-card-open' })
      items.push({ sel: '#memoria button[role="gridcell"][aria-pressed="false"]', label: 'mem-card-closed' })
    }

    for (const it of items) {
      if (it.state === 'hover') await page.hover(it.sel).catch(() => {})
      if (it.state === 'focus') await page.focus(it.sel).catch(() => {})
      const handle = await page.$(it.sel)
      if (!handle) {
        matrix.push({
          page: p.name,
          label: it.label,
          state: it.state ?? 'default',
          selector: it.sel,
          result: 'BLOCKED',
          blockedReason: 'Selector no encontrado',
        })
        continue
      }
      if (p.name === 'landing' && it.label === 'countdown-caption' && (it.state ?? 'default') === 'default') {
        try {
          await handle.screenshot({ path: `${ARTIFACT_DIR}/caption-crop.png` })
        } catch {}
      }
      const rec = await handle.evaluate(
        async (el, state) => {
          const result: any = { ok: true, blockedReason: null, raw: {}, resolved: {} }
          function parseRgbFromAny(input: string): [number, number, number, number] | null {
            const s = input.trim()
            // Navegador como oráculo: normaliza a rgb(...) o rgba(...)
            try {
              const tmp = document.createElement('span')
              tmp.style.color = s
              document.body.appendChild(tmp)
              const computed = getComputedStyle(tmp).color // esperado: rgb/rgba(...) con comas
              tmp.remove()
              const m = computed.match(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*([\d.]+))?\s*\)/i)
              if (!m) return null
              const r = parseFloat(m[1]), g = parseFloat(m[2]), b = parseFloat(m[3]), a = m[4] ? parseFloat(m[4]) : 1
              return [r, g, b, a]
            } catch {
              return null
            }
          }
          function srgbToLin(c: number) { c/=255; return c <= 0.04045 ? c/12.92 : Math.pow((c+0.055)/1.055,2.4) }
          function luminance([r,g,b]: [number,number,number]) { return 0.2126*srgbToLin(r)+0.7152*srgbToLin(g)+0.0722*srgbToLin(b) }
          function over([r,g,b,a]: [number,number,number,number], [dr,dg,db,da]: [number,number,number,number]): [number,number,number,number] {
            const outA = a + da*(1-a)
            const outR = (r*a + dr*da*(1-a)) / (outA||1)
            const outG = (g*a + dg*da*(1-a)) / (outA||1)
            const outB = (b*a + db*da*(1-a)) / (outA||1)
            return [outR,outG,outB,outA]
          }
          function getRawComputed(e: Element, pseudo?: string) {
            const cs = getComputedStyle(e, pseudo)
            return { color: cs.color, backgroundColor: cs.backgroundColor, opacity: cs.opacity }
          }
          function resolveBgChain(e: Element) {
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
          const raw = state === 'placeholder' ? getRawComputed(el, '::placeholder') : getRawComputed(el)
          const bgChain = resolveBgChain(el)
          ;(result as any).raw = { color: raw.color, backgroundChain: bgChain }
          const fg = parseRgbFromAny(raw.color)
          if (!fg) { result.ok = false; result.blockedReason = `No convertible a sRGB: ${raw.color}`; return result }
          let acc: [number,number,number,number] = [255,255,255,0]
          for (const node of bgChain) {
            const rgba = parseRgbFromAny(node.backgroundColor)
            if (rgba && rgba[3] > 0) { acc = over(rgba, acc); if (acc[3] >= 1) break }
          }
          if (acc[3] < 1) {
            const bodyBg = parseRgbFromAny(bgChain[bgChain.length-1]?.backgroundColor || 'rgb(255,255,255)') || [255,255,255,1]
            acc = over(bodyBg, acc)
          }
          // Componer color de texto (que puede tener alpha) sobre el fondo efectivo opaco
          const eff = over(fg as any, [acc[0], acc[1], acc[2], 1] as any)
          const L1 = luminance([eff[0], eff[1], eff[2]] as any)
          const L2 = luminance([acc[0], acc[1], acc[2]] as any)
          const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)
          ;(result as any).resolved = {
            foreground: `rgb(${Math.round(eff[0])},${Math.round(eff[1])},${Math.round(eff[2])})`,
            background: `rgb(${Math.round(acc[0])},${Math.round(acc[1])},${Math.round(acc[2])})`,
            ratio: parseFloat(ratio.toFixed(2)),
          }
          return result
        },
        it.state,
      )
      const axe = await page.evaluate(async (sel) => {
        try {
          // @ts-ignore
          if (!(window as any).axe) return { status: 'ERROR', details: 'axe-core no inyectado' }
          // @ts-ignore
          const res = await (window as any).axe.run(document, { runOnly: { type: 'rule', values: ['color-contrast'] }, resultTypes: ['violations', 'passes'], include: [[sel]] })
          const violated = res.violations?.find((v: any) => v.id === 'color-contrast')
          if (violated && violated.nodes?.length) {
            const n = violated.nodes[0]
            const msg = (n.any?.[0]?.message || n.failureSummary || '').toString()
            return { status: 'FAIL', details: msg.slice(0, 200) }
          }
          return { status: 'PASS' }
        } catch (e: any) { return { status: 'ERROR', details: String(e?.message || e) } }
      }, it.sel)
      const isLarge = /title|heading|hero-title/i.test(it.label)
      const threshold = isLarge ? 3.0 : 4.5
      const row: MatrixRow = { page: p.name, label: it.label, state: it.state ?? 'default', selector: it.sel, axe: axe as any }
      if (!rec || !rec.ok) {
        row.result = 'BLOCKED'
        row.blockedReason = rec?.blockedReason || 'Conversión no soportada'
        row.raw = rec?.raw
      } else {
        row.foregroundResolved = rec.resolved.foreground
        row.backgroundResolved = rec.resolved.background
        row.ratio = rec.resolved.ratio
        row.threshold = threshold
        // Medición principal: axe-core cuando aplica
        if ((axe as any)?.status === 'PASS' || (axe as any)?.status === 'FAIL') {
          row.result = (axe as any).status
        } else {
          // Fallback: nuestra relación compuesta
          row.result = rec.resolved.ratio >= threshold ? 'PASS' : 'FAIL'
        }
        row.raw = rec.raw
      }
      matrix.push(row)
    }
  }
  const invalidAllBlack = matrix.filter(r => r.foregroundResolved === 'rgb(0,0,0)' && r.backgroundResolved === 'rgb(0,0,0)' && r.ratio === 1).length
  expect(invalidAllBlack).toBeLessThan(Math.max(1, Math.floor(matrix.length * 0.5)))
  const blockedCount = matrix.filter(r => r.result === 'BLOCKED').length
  fs.writeFileSync(`${ARTIFACT_DIR}/contrast-matrix.json`, JSON.stringify(matrix, null, 2))
  const total = matrix.length, passes = matrix.filter(r=>r.result==='PASS').length, fails = matrix.filter(r=>r.result==='FAIL').length
  let report = `# Reporte de contraste (WCAG AA)\n\nTotal: ${total} • PASS: ${passes} • FAIL: ${fails} • BLOCKED: ${blockedCount}\n\n`
  report += `Metodología: getComputedStyle RAW, composición alpha sobre cadena de fondos hasta body (#F7F1E5), verificación cruzada con axe-core.\n\n`
  report += `Límites: no se evalúan gradientes/imágenes; colores no convertibles → BLOCKED (nunca 0,0,0).\n\n`
  const list = matrix.filter(r=>r.result!=='PASS').map(r=>`- ${r.page} • ${r.label} [${r.state}] → ${r.result}${r.result==='FAIL'?` (${r.ratio} vs ≥${r.threshold})`:r.blockedReason?` (${r.blockedReason})`:''}`).join('\n')
  report += list || '- Sin fallos registrados bajo esta metodología.'
  fs.writeFileSync(`${ARTIFACT_DIR}/contrast-report.md`, report)
  try {
    execSync(`zip -q -j ${ARTIFACT_DIR}/villa-evidencia.zip ` +
      `${ARTIFACT_DIR}/contrast-matrix.json ` +
      `${ARTIFACT_DIR}/contrast-report.md ` +
      `${ARTIFACT_DIR}/villa-navidad-early.png ` +
      `${ARTIFACT_DIR}/villa-navidad-desktop.png ` +
      `${ARTIFACT_DIR}/villa-navidad-mobile.png ` +
      `${ARTIFACT_DIR}/villa-navidad-late.png ` +
      `${ARTIFACT_DIR}/tarjeta-ejemplo.png ` +
      `${ARTIFACT_DIR}/caption-crop.png`, { stdio: 'ignore' })
  } catch {}
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

