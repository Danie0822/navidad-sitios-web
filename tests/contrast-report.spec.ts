// Propósito: medir contraste WCAG AA en elementos clave y emitir una matriz reproducible.
// Requisitos:
// - Capturar estilos RAW (incluye valores CSS tal cual de getComputedStyle, p. ej. oklch(), rgb(), color()).
// - Resolver alpha y fondos reales ascendiendo en el DOM; si no convertible → state=BLOCKED con causa, nunca asumir negro.
// - Verificación cruzada con axe-core (dev-only) para color-contrast.
// - Controles conocidos (#fff sobre #000 = 21:1; mismo color = 1:1).
// - Cobertura ampliada: default/hover/focus y elementos clave en landing, tarjetas, memoria, atrapa.
// - Artefactos: JSON raw+resuelto, recorte de caption y reporte legible; ZIP para revisión independiente.
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
  // RAW
  raw?: {
    color?: string
    backgroundChain?: Array<{ selector: string; backgroundColor: string; opacity: string }>
  }
  // Cross-check
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

    // Inyectar axe-core (dev-only, sin telemetría)
    try {
      // @ts-ignore
      const hasAxe = await page.evaluate(() => Boolean((window as any).axe?.version))
      if (!hasAxe) {
        await page.addScriptTag({ path: require.resolve('axe-core') })
      }
    } catch {
      // ignorar inyección fallida; marcaremos axe: ERROR en filas individuales
    }

    // Define estados por página
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
        // estados
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
      // juegos
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
      // Preparar estados de memoria: abrir 2 cartas para mostrar "open"
      const grid = page.getByRole('grid', { name: /Tablero de memoria/ })
      await grid.waitFor()
      const cells = grid.getByRole('gridcell')
      const c0 = cells.nth(0)
      const c1 = cells.nth(1)
      await c0.click().catch(() => {})
      await c1.click().catch(() => {})
      items.push({ sel: '#memoria button[role="gridcell"][aria-pressed="true"]', label: 'mem-card-open' })
      items.push({ sel: '#memoria button[role="gridcell"][aria-pressed="false"]', label: 'mem-card-closed' })
    }

    for (const it of items) {
      // Aplicar estado
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

      // Capturar recorte del caption específico para evidencia
      if (p.name === 'landing' && it.label === 'countdown-caption' && (it.state ?? 'default') === 'default') {
        try {
          await handle.screenshot({ path: `${ARTIFACT_DIR}/caption-crop.png` })
        } catch {}
      }

      // Medición en el navegador (maneja rgb con comas o espacios, alpha con barra, y compone alpha sobre fondo real)
      const rec = await handle.evaluate(
        async (el, state) => {
          const result: any = { ok: true, blockedReason: null, raw: {}, resolved: {} }
          function parseRgbLike(input: string): [number, number, number, number] | null {
            // Admite: rgb(255, 255, 255), rgba(255 255 255 / 0.8), rgb(10 20 30), rgba(10,20,30,0.5)
            const s = input.trim()
            const re =
              /rgba?\\(\\s*(\\d{1,3}%?)\\s*(?:,|\\s)\\s*(\\d{1,3}%?)\\s*(?:,|\\s)\\s*(\\d{1,3}%?)(?:\\s*(?:\\/|,)\\s*([\\d.]+%?))?\\s*\\)/i
            const m = s.match(re)
            if (!m) return null
            const to255 = (v: string) => (v.endsWith('%') ? Math.round((parseFloat(v) / 100) * 255) : parseFloat(v))
            const r = to255(m[1])
            const g = to255(m[2])
            const b = to255(m[3])
            let a = 1
            if (m[4]) a = m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4])
            return [r, g, b, a]
          }
          function srgbToLin(c: number) {
            c /= 255
            return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
          }
          function luminance(rgb: [number, number, number]) {
            const [r, g, b] = rgb.map(srgbToLin) as [number, number, number]
            return 0.2126 * r + 0.7152 * g + 0.0722 * b
          }
          function over(
            src: [number, number, number, number],
            dst: [number, number, number, number],
          ): [number, number, number, number] {
            const [r, g, b, a] = src,
              [dr, dg, db, da] = dst
            const outA = a + da * (1 - a)
            const outR = (r * a + dr * da * (1 - a)) / (outA || 1)
            const outG = (g * a + dg * da * (1 - a)) / (outA || 1)
            const outB = (b * a + db * da * (1 - a)) / (outA || 1)
            return [outR, outG, outB, outA]
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
              chain.push({
                selector: (cur as HTMLElement).tagName.toLowerCase() + (cur.id ? `#${cur.id}` : ''),
                backgroundColor: cs.backgroundColor,
                opacity: cs.opacity,
              })
              cur = cur.parentElement
            }
            // Agregar body al final
            const body = getComputedStyle(document.body)
            chain.push({ selector: 'body', backgroundColor: body.backgroundColor, opacity: body.opacity })
            return chain
          }
          function toRgba(input: string): [number, number, number, number] | null {
            // Primer intento: rgb/rgba
            const p = parseRgbLike(input)
            if (p) return p
            // Segundo intento: dejar que el navegador convierta (si soporta oklch/color())
            try {
              const tmp = document.createElement('span')
              tmp.style.color = input
              document.body.appendChild(tmp)
              const computed = getComputedStyle(tmp).color
              tmp.remove()
              const fromComputed = parseRgbLike(computed)
              if (fromComputed) return fromComputed
            } catch {}
            // No convertible de forma fiable
            return null
          }
          const raw = state === 'placeholder' ? getRawComputed(el, '::placeholder') : getRawComputed(el)
          const bgChain = resolveBgChain(el)
          ;(result as any).raw = { color: raw.color, backgroundChain: bgChain }
          // Resolver foreground
          const fg = toRgba(raw.color)
          if (!fg) {
            result.ok = false
            result.blockedReason = `No convertible a sRGB: ${raw.color}`
            return result
          }
          // Resolver fondo efectivo por composición alpha
          let acc: [number, number, number, number] = [255, 255, 255, 0]
          for (const node of bgChain) {
            const rgba = toRgba(node.backgroundColor)
            if (rgba && rgba[3] > 0) {
              acc = over(rgba, acc)
              if (acc[3] >= 1) break
            }
          }
          if (acc[3] < 1) {
            // Componer con el body al final si sigue transparente
            const bodyBg = toRgba(bgChain[bgChain.length - 1]?.backgroundColor || 'rgb(255 255 255 / 1)') || [
              255, 255, 255, 1,
            ]
            acc = over(bodyBg, acc)
          }
          const L1 = luminance([fg[0], fg[1], fg[2]])
          const L2 = luminance([acc[0], acc[1], acc[2]])
          const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)
          ;(result as any).resolved = {
            foreground: `rgb(${Math.round(fg[0])},${Math.round(fg[1])},${Math.round(fg[2])})`,
            background: `rgb(${Math.round(acc[0])},${Math.round(acc[1])},${Math.round(acc[2])})`,
            ratio: parseFloat(ratio.toFixed(2)),
          }
          return result
        },
        it.state,
      )

      // Cross-check con axe (si disponible)
      const axe = await page.evaluate(
        async (sel) => {
          try {
            // @ts-ignore
            if (!(window as any).axe) return { status: 'ERROR', details: 'axe-core no inyectado' }
            // @ts-ignore
            const conf = { runOnly: { type: 'rule', values: ['color-contrast'] }, resultTypes: ['violations', 'passes'] }
            // @ts-ignore
            const res = await (window as any).axe.run(document, { ...conf, include: [[sel]] })
            const violated = res.violations?.find((v: any) => v.id === 'color-contrast')
            if (violated && violated.nodes?.length) {
              const n = violated.nodes[0]
              const msg = (n.any?.[0]?.message || n.failureSummary || '').toString()
              return { status: 'FAIL', details: msg.slice(0, 200) }
            }
            return { status: 'PASS' }
          } catch (e: any) {
            return { status: 'ERROR', details: String(e?.message || e) }
          }
        },
        it.sel,
      )

      const isLarge = /title|heading|hero-title/i.test(it.label)
      const threshold = isLarge ? 3.0 : 4.5
      const row: MatrixRow = {
        page: p.name,
        label: it.label,
        state: it.state ?? 'default',
        selector: it.sel,
        axe: axe as any,
      }
      if (!rec || !rec.ok) {
        row.result = 'BLOCKED'
        row.blockedReason = rec?.blockedReason || 'Conversión no soportada'
        row.raw = rec?.raw
      } else {
        row.foregroundResolved = rec.resolved.foreground
        row.backgroundResolved = rec.resolved.background
        row.ratio = rec.resolved.ratio
        row.threshold = threshold
        row.result = rec.resolved.ratio >= threshold ? 'PASS' : 'FAIL'
        row.raw = rec.raw
      }
      matrix.push(row)
    }
  }

  // Validaciones de sanidad:
  // 1) Rechazar reporte si >50% entradas con todo negro y 1:1 (señal de fallback a negro)
  const invalidAllBlack = matrix.filter(
    (r) => r.foregroundResolved === 'rgb(0,0,0)' && r.backgroundResolved === 'rgb(0,0,0)' && r.ratio === 1,
  ).length
  expect(invalidAllBlack).toBeLessThan(Math.max(1, Math.floor(matrix.length * 0.5)))
  // 2) Rechazar si demasiadas BLOCKED (herramienta no resolvió colores)
  const blockedCount = matrix.filter((r) => r.result === 'BLOCKED').length
  expect(blockedCount).toBeLessThan(Math.ceil(matrix.length * 0.25))

  // Escribir matrices y reporte
  fs.writeFileSync(`${ARTIFACT_DIR}/contrast-matrix.json`, JSON.stringify(matrix, null, 2))
  const total = matrix.length
  const passes = matrix.filter((r) => r.result === 'PASS').length
  const fails = matrix.filter((r) => r.result === 'FAIL').length
  const blocked = blockedCount
  let report = `# Reporte de contraste (WCAG AA)\n\nTotal: ${total} • PASS: ${passes} • FAIL: ${fails} • BLOCKED: ${blocked}\n\n`
  report += `Metodología: getComputedStyle RAW (admite rgb con comas/espacios y alpha con "/"), composición alpha sobre cadena real de backgrounds hasta body (#F7F1E5), verificación cruzada con axe-core.\n\n`
  report += `Límites: no se evalúan gradientes/imágenes de fondo complejas como fondo de texto; si un color no es convertible por el navegador se marca BLOCKED (nunca 0,0,0).\n\n`
  const list = matrix
    .filter((r) => r.result !== 'PASS')
    .map(
      (r) =>
        `- ${r.page} • ${r.label} [${r.state}] → ${r.result}${
          r.result === 'FAIL' ? ` (${r.ratio} vs ≥${r.threshold})` : r.blockedReason ? ` (${r.blockedReason})` : ''
        }`,
    )
    .join('\n')
  report += list || '- Sin fallos registrados bajo esta metodología.'
  fs.writeFileSync(`${ARTIFACT_DIR}/contrast-report.md`, report)

  // Construir ZIP de evidencia (best-effort)
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
})

test('controles conocidos: #fff/#000 = 21:1 y mismo color = 1:1', async ({ page }) => {
  await page.goto('/navidad-sitios-web/')
  await page.waitForLoadState('domcontentloaded')
  const ratios = await page.evaluate(async () => {
    function parseRgbLike(input: string): [number, number, number, number] | null {
      const s = input.trim()
      const re =
        /rgba?\\(\\s*(\\d{1,3}%?)\\s*(?:,|\\s)\\s*(\\d{1,3}%?)\\s*(?:,|\\s)\\s*(\\d{1,3}%?)(?:\\s*(?:\\/|,)\\s*([\\d.]+%?))?\\s*\\)/i
      const m = s.match(re)
      if (!m) return null
      const to255 = (v: string) => (v.endsWith('%') ? Math.round((parseFloat(v) / 100) * 255) : parseFloat(v))
      const r = to255(m[1])
      const g = to255(m[2])
      const b = to255(m[3])
      let a = 1
      if (m[4]) a = m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4])
      return [r, g, b, a]
    }
    function srgbToLin(c: number) {
      c /= 255
      return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    }
    function lum([r, g, b]: [number, number, number]) {
      return 0.2126 * srgbToLin(r) + 0.7152 * srgbToLin(g) + 0.0722 * srgbToLin(b)
    }
    function ratio(fg: string, bg: string) {
      const f = parseRgbLike(fg)!
      const b = parseRgbLike(bg)!
      const L1 = lum([f[0], f[1], f[2]])
      const L2 = lum([b[0], b[1], b[2]])
      return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)
    }
    return {
      whiteBlack: ratio('rgb(255 255 255 / 1)', 'rgb(0 0 0 / 1)'),
      same: ratio('rgb(100 100 100 / 1)', 'rgb(100 100 100 / 1)'),
    }
  })
  expect(Number(ratios.whiteBlack.toFixed(2))).toBeCloseTo(21.0, 1)
  expect(Number(ratios.same.toFixed(2))).toBeCloseTo(1.0, 1)
})

test('contraste CTA aproximado esperado (~6.8) y no-negro', async ({ page }) => {
  await page.goto('/navidad-sitios-web/')
  await page.waitForLoadState('domcontentloaded')
  const val = await page.locator('a:has-text("Crear tarjeta")').evaluate((el) => {
    function parseRgbLike(input: string): [number, number, number, number] | null {
      const s = input.trim()
      const re =
        /rgba?\\(\\s*(\\d{1,3}%?)\\s*(?:,|\\s)\\s*(\\d{1,3}%?)\\s*(?:,|\\s)\\s*(\\d{1,3}%?)(?:\\s*(?:\\/|,)\\s*([\\d.]+%?))?\\s*\\)/i
      const m = s.match(re)
      if (!m) return null
      const to255 = (v: string) => (v.endsWith('%') ? Math.round((parseFloat(v) / 100) * 255) : parseFloat(v))
      const r = to255(m[1])
      const g = to255(m[2])
      const b = to255(m[3])
      let a = 1
      if (m[4]) a = m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4])
      return [r, g, b, a]
    }
    function srgbToLin(c: number) {
      c /= 255
      return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    }
    function lum([r, g, b]: [number, number, number]) {
      return 0.2126 * srgbToLin(r) + 0.7152 * srgbToLin(g) + 0.0722 * srgbToLin(b)
    }
    const cs = getComputedStyle(el as Element)
    const fg = parseRgbLike(cs.color)!
    const bg = parseRgbLike(cs.backgroundColor)!
    const ratio = (Math.max(lum([fg[0], fg[1], fg[2]]), lum([bg[0], bg[1], bg[2]])) + 0.05) /
      (Math.min(lum([fg[0], fg[1], fg[2]]), lum([bg[0], bg[1], bg[2]])) + 0.05)
    return { ratio: parseFloat(ratio.toFixed(2)), fg: cs.color, bg: cs.backgroundColor }
  })
  expect(val.fg).not.toBe('rgb(0, 0, 0)')
  expect(val.bg).not.toBe('rgb(0, 0, 0)')
  expect(val.ratio).toBeGreaterThan(4.5)
  expect(val.ratio).toBeLessThan(8.5) // alrededor de 6.8~7.0
})
// Propósito: medir contraste WCAG AA en elementos clave y emitir una matriz reproducible.
import { test, expect } from '@playwright/test'
import fs from 'node:fs'

const pages = [
  { url: '/navidad-sitios-web/', name: 'landing' },
  { url: '/navidad-sitios-web/tarjetas', name: 'tarjetas' },
  { url: '/navidad-sitios-web/juegos', name: 'juegos' },
]

test('reporte de contraste WCAG AA', async ({ page }) => {
  const matrix: any[] = []
  for (const p of pages) {
    await page.goto(p.url)
    await page.waitForLoadState('domcontentloaded')
    // Define estados por página
    type Item = { sel: string; label: string; state?: 'default'|'hover'|'focus'|'selected'|'placeholder' }
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
        // estados
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
      ]
    }

    for (const it of items) {
      // Aplicar estado
      if (it.state === 'hover') await page.hover(it.sel).catch(() => {})
      if (it.state === 'focus') await page.focus(it.sel).catch(() => {})
      // Medición
      const handle = await page.$(it.sel)
      if (!handle) continue
      const rec = await handle.evaluate((el, state) => {
        function parse(c: string): [number,number,number,number] {
          const m = c.match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s\/]+([\d.]+))?\)/i)
          if (!m) return [0,0,0,1]
          const r = parseFloat(m[1]), g = parseFloat(m[2]), b = parseFloat(m[3]), a = m[4] ? parseFloat(m[4]) : 1
          return [r,g,b,a]
        }
        function srgbToLin(c: number) { c/=255; return c <= 0.04045 ? c/12.92 : Math.pow((c+0.055)/1.055,2.4) }
        function luminance(rgb: [number,number,number]) {
          const [r,g,b] = rgb.map(srgbToLin) as [number,number,number]
          return 0.2126*r + 0.7152*g + 0.0722*b
        }
        function over(src: [number,number,number,number], dst: [number,number,number,number]): [number,number,number,number] {
          const [r,g,b,a] = src, [dr,dg,db,da] = dst
          const outA = a + da*(1-a)
          const outR = (r*a + dr*da*(1-a)) / (outA||1)
          const outG = (g*a + dg*da*(1-a)) / (outA||1)
          const outB = (b*a + db*da*(1-a)) / (outA||1)
          return [outR,outG,outB,outA]
        }
        function effectiveBg(e: Element): [number,number,number] {
          let cur: Element|null = e as Element
          let acc: [number,number,number,number] = [255,255,255,0]
          while (cur && cur instanceof HTMLElement) {
            const cs = getComputedStyle(cur)
            const bgc = parse(cs.backgroundColor)
            if (bgc[3] > 0) {
              acc = over(bgc as any, acc)
              if (acc[3] >= 1) break
            }
            cur = cur.parentElement
          }
          if (acc[3] < 1) {
            const body = getComputedStyle(document.body)
            acc = over(parse(body.backgroundColor) as any, acc)
          }
          return [acc[0],acc[1],acc[2]]
        }
        let clr: [number,number,number,number]
        if (state === 'placeholder') {
          const cs = getComputedStyle(el as Element, '::placeholder')
          clr = parse(cs.color)
        } else {
          const cs = getComputedStyle(el as Element)
          clr = parse(cs.color)
        }
        const bg = effectiveBg(el)
        const L1 = luminance([clr[0],clr[1],clr[2]])
        const L2 = luminance([bg[0],bg[1],bg[2]])
        const ratio = (Math.max(L1,L2)+0.05) / (Math.min(L1,L2)+0.05)
        return {
          text: (el as HTMLElement).innerText?.trim().slice(0,60),
          color: `rgb(${clr[0]},${clr[1]},${clr[2]})`,
          background: `rgb(${bg[0]},${bg[1]},${bg[2]})`,
          ratio: parseFloat(ratio.toFixed(2))
        }
      }, it.state)
      const isLarge = /title|heading/i.test(it.label)
      const threshold = isLarge ? 3.0 : 4.5
      matrix.push({ page: p.name, label: it.label, state: it.state ?? 'default', selector: it.sel, foreground: rec.color, background: rec.background, ratio: rec.ratio, threshold, result: rec.ratio >= threshold ? 'PASS' : 'FAIL' })
    }
  }
  // Validación de sanidad: no aceptar matriz claramente inválida (todo negro/1:1)
  const invalid = matrix.filter(r => r.foreground === 'rgb(0,0,0)' && r.background === 'rgb(0,0,0)' && r.ratio === 1).length
  expect(invalid).toBeLessThan(matrix.length * 0.5)
  fs.writeFileSync('/opt/cursor/artifacts/contrast-matrix.json', JSON.stringify(matrix, null, 2))
})

test('contraste CTA aproximado esperado (~6.8)', async ({ page }) => {
  await page.goto('/navidad-sitios-web/')
  await page.waitForLoadState('domcontentloaded')
  const val = await page.locator('a:has-text("Crear tarjeta")').evaluate(el => {
    function parse(c: string){ const m = c.match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s\/]+([\d.]+))?\)/i); if(!m)return [0,0,0,1]; return [parseFloat(m[1]),parseFloat(m[2]),parseFloat(m[3]), m[4]?parseFloat(m[4]):1] }
    function srgbToLin(c: number){ c/=255; return c<=0.04045?c/12.92:Math.pow((c+0.055)/1.055,2.4) }
    function lum([r,g,b]: [number,number,number]){ return 0.2126*srgbToLin(r)+0.7152*srgbToLin(g)+0.0722*srgbToLin(b) }
    const cs = getComputedStyle(el as Element)
    const fg = parse(cs.color) as [number,number,number,number]
    const bg = parse(cs.backgroundColor) as [number,number,number,number]
    const ratio = (Math.max(lum([fg[0],fg[1],fg[2]]), lum([bg[0],bg[1],bg[2]]))+0.05) / (Math.min(lum([fg[0],fg[1],fg[2]]), lum([bg[0],bg[1],bg[2]]))+0.05)
    return parseFloat(ratio.toFixed(2))
  })
  expect(val).toBeGreaterThan(4.5)
  expect(val).toBeLessThan(8.0) // alrededor de 6.8
})
