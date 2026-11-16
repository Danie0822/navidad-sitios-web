# Paridad React → vanilla + página Participantes

Referencia React (primer padre del merge vanilla `71eab17`):

**`2ad0b3493751b91c9fd6e464da2d98a429085814`**

## Regla vigente (owner / PO)

1. Las 3 pantallas React (inicio, tarjetas, juegos) quedan en **paridad** de funciones y diseño.
2. Multimedia y rúbrica que romperían esa paridad viven en **`participantes.html`**.
3. Nav: solo se suma el enlace a Participantes. Footer: enlace externo.

## Excepciones PO aprobadas

| Diferencia vs React | Vanilla (aprobado) | React |
| --- | --- | --- |
| Nieve + «Pausar animaciones» en landing | **No** (ítem QA 2 omitido) | `SnowfallBox` + `PauseButton` |
| Formato de fecha del objetivo | `25/12/AAAA` (`es-AR`) | `12/25/AAAA` |
| Día 25/12 (00:00 en adelante) | «¡Feliz Navidad!» / 00:00:00:00 | Salta al 25/12 del año siguiente |

## Tabla React ↔ vanilla

| Pantalla / estado | React | Vanilla |
| --- | --- | --- |
| Landing | ![react-landing](./react-landing.png) | ![vanilla-landing](./vanilla-landing.png) |
| Selector de juegos | ![react-juegos-selector](./react-juegos-selector.png) | ![vanilla-juegos-selector](./vanilla-juegos-selector.png) |
| Memoria mid-play | ![react-memoria-midplay](./react-memoria-midplay.png) | ![vanilla-memoria-midplay](./vanilla-memoria-midplay.png) |
| Memoria fin | ![react-memoria-end](./react-memoria-end.png) | ![vanilla-memoria-end](./vanilla-memoria-end.png) |
| Regalos mid-play | ![react-regalos-midplay](./react-regalos-midplay.png) | ![vanilla-regalos-midplay](./vanilla-regalos-midplay.png) |
| Regalos pausado | ![react-regalos-paused](./react-regalos-paused.png) | ![vanilla-regalos-paused](./vanilla-regalos-paused.png) |
| Regalos fin | ![react-regalos-end](./react-regalos-end.png) | ![vanilla-regalos-end](./vanilla-regalos-end.png) |
| Tarjetas + preview | ![react-tarjetas-preview](./react-tarjetas-preview.png) | ![vanilla-tarjetas-preview](./vanilla-tarjetas-preview.png) |
| PNG descargado | ![react-tarjeta-descargada](./react-tarjeta-descargada.png) | ![vanilla-tarjeta-descargada](./vanilla-tarjeta-descargada.png) |

## Mapa función React → equivalente vanilla

| React | Vanilla |
| --- | --- |
| `Landing.tsx` (sin nieve/pausa — excepción PO) | `index.html` + countdown |
| `Tarjetas` / `CardEditor` / `CardPreview` | `tarjetas.html` + form/preview + html-to-image |
| `Juegos.tsx` + `PauseButton` + `CatalogRegalosArt` | `juegos.html` `#view-catalog` (grilla 3×3) + `js/motion.js` |
| `MemoriaPage` / `MemoryGame` | `juegos.html#memoria` |
| `RegalosPage` / `HiddenGiftsGame` | `juegos.html#regalos` |
| *(rúbrica multimedia / créditos)* | `participantes.html` |
