/* Propósito: editor de tarjetas con controles, validación y exportación a imagen. */
import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import type { CardData, CardTemplate } from './CardPreview'
import { CardPreview } from './CardPreview'

const MAX_DEST = 40
const MAX_MSG = 200

export function CardEditor() {
  const [data, setData] = useState<CardData>({
    destinatario: '',
    mensaje: '',
    plantilla: 'clasica',
  })
  const previewRef = useRef<HTMLDivElement | null>(null)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function update<K extends keyof CardData>(key: K, value: CardData[K]) {
    setData((d) => ({ ...d, [key]: value }))
  }

  async function handleExport() {
    setError(null)
    const node = previewRef.current
    if (!node) return
    try {
      setExporting(true)
      // Garantizar fuentes cargadas antes de exportar
      await document.fonts?.ready
      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: Math.min(2, window.devicePixelRatio || 1),
        skipFonts: false,
      })
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `tarjeta-navidad-${data.plantilla}.png`
      a.click()
    } catch (e) {
      console.error(e)
      setError('No se pudo exportar la imagen. Intenta nuevamente.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            handleExport()
          }}
        >
          <div>
            <label htmlFor="dest" className="block text-sm font-medium">Destinatario</label>
            <input
              id="dest"
              type="text"
              maxLength={MAX_DEST}
              value={data.destinatario}
              onChange={(e) => update('destinatario', e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 focus:outline-none focus-visible:ring-2 ring-red-400"
              placeholder="Ej. Daniela"
            />
            <p className="text-xs text-neutral-500 mt-1">{data.destinatario.length}/{MAX_DEST}</p>
          </div>
          <div>
            <label htmlFor="msg" className="block text-sm font-medium">Mensaje</label>
            <textarea
              id="msg"
              maxLength={MAX_MSG}
              value={data.mensaje}
              onChange={(e) => update('mensaje', e.target.value)}
              className="mt-1 min-h-28 w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 focus:outline-none focus-visible:ring-2 ring-red-400"
              placeholder="Tu saludo navideño…"
            />
            <p className="text-xs text-neutral-500 mt-1">{data.mensaje.length}/{MAX_MSG}</p>
          </div>
          <div>
            <label htmlFor="plantilla" className="block text-sm font-medium">Plantilla</label>
            <select
              id="plantilla"
              className="mt-1 w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 focus:outline-none focus-visible:ring-2 ring-red-400"
              value={data.plantilla}
              onChange={(e) => update('plantilla', e.target.value as CardTemplate)}
            >
              <option value="clasica">Clásica</option>
              <option value="moderna">Moderna</option>
              <option value="noel">Noel</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={exporting}
              className="inline-flex items-center justify-center rounded-md bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white px-4 py-2 focus:outline-none focus-visible:ring-2 ring-red-300"
            >
              {exporting ? 'Exportando…' : 'Descargar imagen'}
            </button>
            <button
              type="button"
              className="rounded-md border px-3 py-2 focus:outline-none focus-visible:ring-2 ring-neutral-400"
              onClick={() => setData({ destinatario: '', mensaje: '', plantilla: 'clasica' })}
            >
              Limpiar
            </button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <p className="text-xs text-neutral-500">
            Unicode soportado. El texto largo se trunca visualmente con líneas máximas para evitar cortes.
          </p>
        </form>
      </div>
      <div className="overflow-auto">
        <div className="inline-block">
          <CardPreview
            ref={previewRef}
            destinatario={data.destinatario}
            mensaje={data.mensaje}
            plantilla={data.plantilla}
          />
        </div>
      </div>
    </div>
  )
}
