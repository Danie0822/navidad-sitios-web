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

## Conflictos rúbrica vs paridad exacta (STOP)

Integrar estos ítems de rúbrica **cambiaría** pantallas/flujos que en React no existían; por instrucción del PO se detuvo y no se inventó:

1. **checkbox** — `CardEditor` React no tenía casillas; agregarlas altera el taller.
2. **video / audio** — Landing y Juegos React no tenían multimedia; agregarlos altera esas pantallas.
3. **Escalera h3–h6 / secciones didácticas / galería** — no estaban en React Scout V2.
4. **Imágenes como vínculos Unsplash** — React usaba miniaturas SVG de plantilla en botones, no galería.
5. **3 archivos HTML vs rutas SPA** — React tenía `/juegos/memoria` y `/juegos/regalos`; en vanilla se emulan con hash en `juegos.html` (sigue habiendo exactamente 3 páginas).

**Sí en paridad React:** placeholders en `#dest` / `#msg`.
