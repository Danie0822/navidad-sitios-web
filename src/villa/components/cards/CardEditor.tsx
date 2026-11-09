/* Propósito: selector de 3 composiciones, campos persistentes y PNG 1080 estático. */
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { toPng } from 'html-to-image'
import { CardPreview, TEMPLATES, type CardData, type CardTemplate } from './CardPreview'
import { PauseButton, useMotion } from '../../motion/MotionContext'

const GUIDE_DEST = 40
const GUIDE_MSG = 200
const HARD_DEST = 120
const HARD_MSG = 600

export function CardEditor() {
  const [data, setData] = useState<CardData>({
    destinatario: '',
    mensaje: '',
    plantilla: 'villa',
  })
  const [editing, setEditing] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [overflow, setOverflow] = useState(false)
  const previewRef = useRef<HTMLDivElement | null>(null)
  const exportRef = useRef<HTMLDivElement | null>(null)
  const { freeze } = useMotion()
  const previewFrozen = freeze || editing

  function update<K extends keyof CardData>(key: K, value: CardData[K]) {
    setData((d) => ({ ...d, [key]: value }))
    setReady(false)
    setError(null)
  }

  useEffect(() => {
    const node = exportRef.current
    if (!node) return
    const dest = node.querySelector('[data-fit="dest"]') as HTMLElement | null
    const msg = node.querySelector('[data-fit="msg"]') as HTMLElement | null
    const over = [dest, msg].some((el) => {
      if (!el) return false
      const lh = parseFloat(getComputedStyle(el).lineHeight) || 62
      const maxLines = el.dataset.fit === 'dest' ? 2 : 8
      return el.scrollHeight > lh * maxLines + 2
    })
    setOverflow(over)
  }, [data])

  const missing = !data.destinatario.trim() || !data.mensaje.trim()
  const canDownload = !missing && !overflow && !exporting
  const overGuide = data.destinatario.length > GUIDE_DEST || data.mensaje.length > GUIDE_MSG

  async function handleExport() {
    setError(null)
    const node = exportRef.current
    if (!node || !canDownload) return
    try {
      setExporting(true)
      await document.fonts?.ready
      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 1,
        width: 1080,
        height: 1080,
        canvasWidth: 1080,
        canvasHeight: 1080,
        skipFonts: false,
        style: {
          transform: 'none',
          width: '1080px',
          height: '1080px',
          left: '0',
          top: '0',
          position: 'static',
          opacity: '1',
        },
      })
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `tarjeta-navidad-${data.plantilla}.png`
      a.click()
      setReady(true)
    } catch (e) {
      console.error(e)
      setError('No se pudo exportar. Probá de nuevo; tus textos se conservan.')
    } finally {
      setExporting(false)
    }
  }

  let reason = ''
  if (missing) reason = 'Escribí destinatario y mensaje para descargar.'
  else if (overflow) reason = 'El texto no entra en el área segura. Acortá una línea o un salto; no borramos nada.'
  else if (exporting) reason = 'Preparando PNG…'

  return (
    <div>
      <div className="grid gap-10 min-w-0 lg:grid-cols-[minmax(0,450px)_minmax(0,1fr)] lg:gap-[78px] items-start">
        <form
          className="min-w-0 space-y-5"
          onSubmit={(e) => {
            e.preventDefault()
            void handleExport()
          }}
        >
          <fieldset>
            <legend className="text-[20px] font-semibold">Elegí tu diseño</legend>
            <div className="mt-3 flex flex-wrap gap-3">
              {TEMPLATES.map((t) => {
                const selected = data.plantilla === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => update('plantilla', t.id as CardTemplate)}
                    className={`text-left rounded-[10px] p-1 border-2 ${
                      selected ? 'border-[var(--cta)]' : 'border-[var(--line)]'
                    }`}
                  >
                    <div className="thumb-art" aria-hidden="true">
                      <CardPreview destinatario="" mensaje="" plantilla={t.id} mode="thumb" />
                    </div>
                    <span className="mt-2 flex items-baseline gap-2 px-1 pb-1">
                      <span>{t.label}</span>
                      {selected && <span className="text-[10px] font-semibold text-[var(--cta)]">Elegido</span>}
                    </span>
                  </button>
                )
              })}
            </div>
          </fieldset>

          <div>
            <label htmlFor="dest" className="block text-base font-semibold">
              Para
            </label>
            <input
              id="dest"
              type="text"
              maxLength={HARD_DEST}
              value={data.destinatario}
              onChange={(e) => update('destinatario', e.target.value)}
              onFocus={() => setEditing(true)}
              onBlur={() => setEditing(false)}
              className="field mt-1"
              placeholder="Ej. Daniela"
              autoComplete="off"
            />
            <p className="text-xs text-[var(--muted)] mt-1">
              {data.destinatario.length}/{HARD_DEST}
              {data.destinatario.length > GUIDE_DEST ? ' · guía sugerida 40' : ''}
            </p>
          </div>

          <div>
            <label htmlFor="msg" className="block text-base font-semibold">
              Tu mensaje
            </label>
            <textarea
              id="msg"
              maxLength={HARD_MSG}
              value={data.mensaje}
              onChange={(e) => update('mensaje', e.target.value)}
              onFocus={() => setEditing(true)}
              onBlur={() => setEditing(false)}
              className="field mt-1 min-h-[142px]"
              placeholder="Tu saludo navideño…"
            />
            <p className="text-xs text-[var(--muted)] mt-1">
              {data.mensaje.length}/{HARD_MSG}
              {data.mensaje.length > GUIDE_MSG ? ' · guía sugerida 200' : ''}
            </p>
          </div>
          <p className="text-xs text-[var(--muted)]">Los saltos de línea también son parte del regalo.</p>
          <p className="text-sm text-[var(--muted)]">Sin cuentas. Sin apuro. Con cariño.</p>
          {overGuide && !overflow && (
            <p className="text-sm text-[var(--forest)]">
              Superaste la guía 40/200. Conservamos el texto; si el preview avisa que no entra, acortá antes de exportar.
            </p>
          )}
        </form>

        <aside className="studio min-w-0">
          <div className="flex items-center justify-between gap-3 mb-4">
            <p className="font-medium">Vista previa</p>
            <PauseButton labelPlay="Pausar animación" labelPause="Continuar animación" />
          </div>
          <ScaledPreview paused={previewFrozen}>
            <CardPreview
              key={data.plantilla}
              ref={previewRef}
              destinatario={data.destinatario}
              mensaje={data.mensaje}
              plantilla={data.plantilla}
              mode="preview"
            />
          </ScaledPreview>
          <p className="mt-3 text-center text-[13px] text-[var(--muted)]">PNG cuadrado · 1080 × 1080 · sin animación</p>
          {ready && (
            <p className="mt-2 text-center font-medium" data-png-ready="true">
              PNG listo
            </p>
          )}
        </aside>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <p className="text-[13px] text-[var(--muted)]">El archivo conserva tu texto y diseño.</p>
        <div className="flex flex-col items-stretch gap-2">
          <button
            type="button"
            onClick={() => void handleExport()}
            disabled={!canDownload}
            aria-describedby="download-help"
            className="btn-cta min-w-[220px]"
          >
            {exporting ? 'Preparando PNG…' : 'Descargar PNG'}
          </button>
          <p id="download-help" className="text-sm text-[var(--muted)] max-w-[320px]">
            {reason || 'Descarga solo la tarjeta, sin chrome ni animación.'}
          </p>
          {error && (
            <p className="text-sm text-[var(--cta)]" role="alert">
              {error}{' '}
              <button type="button" className="underline" onClick={() => void handleExport()}>
                Reintentar
              </button>
            </p>
          )}
        </div>
      </div>

      <div className="export-host" aria-hidden="true">
        <CardPreview
          ref={exportRef}
          destinatario={data.destinatario}
          mensaje={data.mensaje}
          plantilla={data.plantilla}
          mode="export"
        />
      </div>
    </div>
  )
}

function ScaledPreview({ children, paused }: { children: ReactNode; paused: boolean }) {
  const box = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(0.47)
  useEffect(() => {
    const el = box.current
    if (!el) return
    const apply = () => setZoom(el.clientWidth / 1080)
    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return (
    <div
      ref={box}
      className="card-preview-frame mx-auto"
      data-motion={paused ? 'paused' : 'play'}
      data-preview="live"
    >
      <div style={{ width: 1080, height: 1080, zoom }}>{children}</div>
    </div>
  )
}
