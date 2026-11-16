# Paridad React → vanilla

Referencia React (primer padre del merge vanilla `71eab17`):

**`2ad0b3493751b91c9fd6e464da2d98a429085814`**

## Tabla React ↔ vanilla

| Pantalla / estado | React | Vanilla |
| --- | --- | --- |
| Landing | ![react-landing](./react-landing.png) | ![vanilla-landing](./vanilla-landing.png) |
| Selector de juegos | ![react-juegos-selector](./react-juegos-selector.png) | ![vanilla-juegos-selector](./vanilla-juegos-selector.png) |
| Memoria mid-play | ![react-memoria-midplay](./react-memoria-midplay.png) | ![vanilla-memoria-midplay](./vanilla-memoria-midplay.png) |
| Memoria fin | ![react-memoria-end](./react-memoria-end.png) | ![vanilla-memoria-end](./vanilla-memoria-end.png) |
| Regalos mid-play | ![react-regalos-midplay](./react-regalos-midplay.png) | ![vanilla-regalos-midplay](./vanilla-regalos-midplay.png) |
| Regalos fin | ![react-regalos-end](./react-regalos-end.png) | ![vanilla-regalos-end](./vanilla-regalos-end.png) |
| Tarjetas + preview | ![react-tarjetas-preview](./react-tarjetas-preview.png) | ![vanilla-tarjetas-preview](./vanilla-tarjetas-preview.png) |
| PNG descargado | ![react-tarjeta-descargada](./react-tarjeta-descargada.png) | ![vanilla-tarjeta-descargada](./vanilla-tarjeta-descargada.png) |

## Mapa función React → equivalente vanilla

| React | Vanilla |
| --- | --- |
| `pages/Landing.tsx` | `index.html` + `js/main.js` (countdown) |
| `pages/Tarjetas.tsx` + `CardEditor.tsx` + `CardPreview.tsx` | `tarjetas.html` + `js/form.js` + `js/card-preview.js` + `js/vendor/html-to-image.js` |
| `pages/Juegos.tsx` (selector) | `juegos.html` `#view-catalog` |
| `pages/MemoriaPage.tsx` + `MemoryGame.tsx` | `juegos.html#memoria` + `js/juegos.js` / `js/game-logic.js` |
| `pages/RegalosPage.tsx` + `HiddenGiftsGame.tsx` | `juegos.html#regalos` + `js/juegos.js` / `js/game-logic.js` |
| `utils/cardFit.ts` | `js/card-preview.js` (`cardTextOverflows`) |
| `utils/shuffle.ts` + siluetas | `js/game-logic.js` + iconos en `js/juegos.js` |

## Colocación rúbrica (regla PO — solo secciones React existentes)

| Ítem | Dónde | Archivo:línea |
| --- | --- | --- |
| Video corto | Hero de landing (sección React existente) | `index.html:60` (`.hero-video`), source `index.html:67` |
| Audio play/mute | Header del catálogo de juegos | `juegos.html:54` (`#audio-toggle`), `juegos.html:57–58` (`#game-audio`), JS `js/juegos.js:15` |
| Imágenes como vínculos | Miniaturas de plantilla | `tarjetas.html:57–86` (`<a class="template-pick" href="#vista-previa">` + `<img class="img-thumb">`), ancla `tarjetas.html:121` |
| Enlace externo | Footer existente | `index.html:213`, `tarjetas.html:155`, `juegos.html:191` |
| Placeholder | Campos del editor React | `tarjetas.html:98` (`#dest`), `tarjetas.html:111` (`#msg`) |

Sin galería, sin página nueva, sin sección nueva, sin función nueva de producto.

## Nota de arquitectura
React tenía `/juegos/memoria` y `/juegos/regalos`; en vanilla se emulan con hash en `juegos.html` (siguen siendo exactamente 3 páginas HTML).
