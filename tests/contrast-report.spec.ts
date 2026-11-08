// Propósito: medir contraste WCAG AA en elementos clave y emitir una matriz reproducible.
import { test } from '@playwright/test'
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
    // Selecciones de interés por página
    const selectors =
      p.name === 'landing'
        ? [
            { sel: 'nav a:has-text("Villa Navidad")', label: 'header-brand' },
            { sel: 'nav a:has-text("Tarjetas")', label: 'nav-tarjetas' },
            { sel: 'nav a:has-text("Juegos")', label: 'nav-juegos' },
            { sel: 'h1', label: 'hero-title' },
            { sel: 'a:has-text("Crear tarjeta")', label: 'cta-primary' },
            { sel: 'a:has-text("Jugar")', label: 'cta-secondary' },
            { sel: 'section >> text=/Cuenta regresiva a Navidad/', label: 'countdown-caption' },
          ]
        : p.name === 'tarjetas'
        ? [
            { sel: 'h2:has-text("Tarjetas")', label: 'heading' },
            { sel: 'label:has-text("Destinatario")', label: 'label-dest' },
            { sel: 'label:has-text("Mensaje")', label: 'label-msg' },
            { sel: 'select#plantilla', label: 'select' },
            { sel: 'button:has-text("Descargar imagen")', label: 'download' },
          ]
        : [
            { sel: 'h2:has-text("Juegos")', label: 'heading' },
            { sel: 'h3:has-text("Memoria navideña")', label: 'memoria-title' },
            { sel: '#memoria >> text=/Puntaje:/', label: 'memoria-score' },
            { sel: 'h3:has-text("Atrapa regalos")', label: 'atrapa-title' },
            { sel: '#atrapa >> text=/Puntaje:/', label: 'atrapa-score' },
          ]
    for (const s of selectors) {
      const handle = await page.$(s.sel)
      if (!handle) continue
      const rec = await handle.evaluate(el => {
        function parse(c: string): [number,number,number,number] {
          // Soporta rgb(a) con comas o espacios y alfa opcional
          const m = c.match(/rgba?\\((\\d+)[,\\s]+(\\d+)[,\\s]+(\\d+)(?:[,\\s\\/]+([\\d.]+))?\\)/i)
          if (!m) return [0,0,0,1]
          const r = parseFloat(m[1]), g = parseFloat(m[2]), b = parseFloat(m[3]), a = m[4] ? parseFloat(m[4]) : 1
          return [r,g,b,a]
        }
        function srgbToLin(c: number) { c/=255; return c <= 0.04045 ? c/12.92 : Math.pow((c+0.055)/1.055,2.4) }
        function luminance(rgb: [number,number,number]) {
          const [r,g,b] = rgb.map(srgbToLin) as [number,number,number]
          return 0.2126*r + 0.7152*g + 0.0722*b
        }
        function blend(fg: [number,number,number,number], bg: [number,number,number,number]): [number,number,number,number] {
          const [r,g,b,a] = fg
          const [br,bg2,bb,ba] = bg
          const outA = a + ba*(1-a)
          const outR = (r*a + br*ba*(1-a)) / outA
          const outG = (g*a + bg2*ba*(1-a)) / outA
          const outB = (b*a + bb*ba*(1-a)) / outA
          return [outR,outG,outB,outA]
        }
        function effectiveBg(e: Element): [number,number,number] {
          let cur: Element|null = e as Element
          let acc: [number,number,number,number] = [255,255,255,0] // start transparent
          while (cur && cur instanceof HTMLElement) {
            const cs = getComputedStyle(cur)
            const bgc = parse(cs.backgroundColor)
            if (bgc[3] > 0) {
              // bgc sobre lo acumulado
              acc = blend(bgc as any, acc)
              if (acc[3] >= 1) break
            }
            cur = cur.parentElement
          }
          return [acc[0],acc[1],acc[2]]
        }
        const cs = getComputedStyle(el as Element)
        const clr = parse(cs.color)
        const bg = effectiveBg(el)
        const L1 = luminance([clr[0],clr[1],clr[2]])
        const L2 = luminance([bg[0],bg[1],bg[2]])
        const ratio = (Math.max(L1,L2)+0.05) / (Math.min(L1,L2)+0.05)
        return {
          selector: (el as Element).tagName.toLowerCase(),
          text: (el as HTMLElement).innerText?.trim().slice(0,60),
          color: `rgb(${clr[0]},${clr[1]},${clr[2]})`,
          background: `rgb(${bg[0]},${bg[1]},${bg[2]})`,
          ratio: parseFloat(ratio.toFixed(2))
        }
      })
      const threshold = (s.label?.includes('title') || s.label?.includes('heading')) ? 3.0 : 4.5
      matrix.push({ page: p.name, label: s.label, selector: s.sel, foreground: rec.color, background: rec.background, ratio: rec.ratio, threshold, result: rec.ratio >= threshold ? 'PASS' : 'FAIL' })
    }
  }
  fs.writeFileSync('/opt/cursor/artifacts/contrast-matrix.json', JSON.stringify(matrix, null, 2))
})
