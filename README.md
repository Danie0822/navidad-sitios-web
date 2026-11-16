# Villa Navidad — HTML + CSS + JS (estático)

Sitio educativo en **HTML, CSS y JavaScript puros**, con **Tailwind CSS compilado por CLI** (sin CDN).  
Diseño editorial aprobado: paleta marfil / verde bosque / granate, arco, tipografía Fraunces + Inter, animaciones suaves.

Publicable en GitHub Pages bajo `/navidad-sitios-web/`.

## Requisitos

- Node.js 18+
- npm

## Instalación

```bash
npm install
```

## Recompilar Tailwind

El CSS compilado vive en `css/styles.css` y **está versionado** (Pages lo sirve sin build).  
Para regenerarlo tras cambiar clases en el HTML:

```bash
npm run css:build
```

Modo observación:

```bash
npm run css:watch
```

## Vista previa como GitHub Pages

```bash
npm run preview:pages
```

Abrí `http://localhost:4173/navidad-sitios-web/`.

## Estructura

```
/
  index.html          # Inicio
  tarjetas.html       # Taller + formulario
  juegos.html         # Juegos + galería / media
  css/
    input.css         # Entrada Tailwind CLI
    styles.css        # Tailwind compilado (commitear)
    custom.css        # CSS propio (tokens, layout, animaciones)
  js/
    main.js           # Menú, modo oscuro, countdown
    form.js           # Validación de formulario
    nav-current.js    # aria-current de navegación
  img/                # Imágenes libres
  media/              # Video y audio livianos
  fonts/              # WOFF2 autohospedados (OFL)
```

## Funcionalidades JS

1. Menú hamburguesa (`aria-expanded`)
2. Validación de formulario (tarjetas)
3. Modo oscuro persistente (`localStorage`)
4. Cuenta regresiva a Navidad (25/dic 00:00 hora local)

## Créditos y licencias de assets

| Archivo | Origen | Licencia |
| --- | --- | --- |
| `img/arbol-navidad.jpg` | [Unsplash — Christmas tree](https://unsplash.com/photos/christmas-tree-with-string-lights-1512389142860) (photo-1512389142860-9c449e58a543) | [Unsplash License](https://unsplash.com/license) (uso libre) |
| `img/regalos.jpg` | [Unsplash — gifts](https://unsplash.com/photos/wrapped-gift-boxes-1512909006721) (photo-1512909006721-3d6018887383) | Unsplash License |
| `img/luces.jpg` | [Unsplash — lights](https://unsplash.com/photos/selective-focus-photography-of-christmas-lights-1482517967863) (photo-1482517967863-00e15c9b44be) | Unsplash License |
| `img/ambiente.jpg` | [Unsplash — ornaments](https://unsplash.com/photos/red-and-gold-bauble-1607344645866) (photo-1607344645866-009c320b63e0) | Unsplash License |
| `img/favicon.svg` | Original del repo | CC0 / dominio público del proyecto |
| `media/villa-navidad.mp4` | Montaje propio a partir de las fotos Unsplash del repo | Derivado bajo Unsplash License |
| `media/campana.mp3` | Audio sintético original (ffmpeg / sine) | CC0 del proyecto |
| `fonts/*.woff2` | [Fontsource](https://fontsource.org/) — Inter y Fraunces | SIL Open Font License 1.1 |

Nada de servicios pagos. Video &lt; 3 MB, audio &lt; 1 MB.

## GitHub Pages

Workflow: `.github/workflows/deploy-pages.yml` (rama `main`).  
Copia HTML + `css` + `js` + `img` + `media` + `fonts` sin Vite.

## Scripts

- `npm run css:build` — compilar Tailwind a `css/styles.css`
- `npm run css:watch` — recompilar al guardar
- `npm run preview:pages` — servir bajo `/navidad-sitios-web/`
- `npm run verify` — comprobaciones Playwright + grep de la rúbrica
