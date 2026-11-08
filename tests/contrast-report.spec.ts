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
