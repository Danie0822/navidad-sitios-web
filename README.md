# Villa Navidad — SPA React + Vite (ES)

Villa Navidad es una SPA sencilla (sin backend) con:
- Landing navideña protagonista (arco aprobado, teatro del regalo, nieve confinada)
- Cuenta regresiva a la próxima Navidad
- Taller de tarjetas con tres composiciones (Villa, Bosque, Regalos) y PNG 1080×1080
- Catálogo de exactamente dos juegos: Memoria y Regalos escondidos

Todo el contenido y la UI están en español. No usa APIs pagadas, login, ni BD.

## Requisitos
- Node.js 18+ (probado con Node 22)
- npm

## Instalación
```bash
npm install
```

## Ejecutar en desarrollo
```bash
npm run dev
```
Abre `http://localhost:5173` en el navegador.

## Compilar producción
```bash
npm run build
npm run preview
```
Para GitHub Pages (ruta base /navidad-sitios-web/):
- El build de producción usa base `/navidad-sitios-web/` automáticamente.
- SPA fallback incluido en `public/404.html` para recargas profundas.
- Router usa `basename = import.meta.env.BASE_URL`.

## Estructura principal
```
src/villa/
  App.tsx
  main.tsx
  styles.css
  components/
    Countdown.tsx
    Snowfall.tsx
    FocusHeading.tsx
    cards/
    catalog/
    scene/ChristmasSceneScout.tsx
  games/
    MemoryGame.tsx
    HiddenGiftsGame.tsx
  icons/
  motion/
  pages/
    Landing.tsx
    Tarjetas.tsx
    Juegos.tsx
    MemoriaPage.tsx
    RegalosPage.tsx
    NotFound.tsx
```

## Convenciones
- Código simple y reutilizable, con un breve comentario al inicio de cada archivo.
- Accesibilidad: foco visible, teclado/táctil, contraste AA, `prefers-reduced-motion`.
- Pausa de animación de sesión; reduced-motion entrega pose estática.

## Tarjetas
- Plantillas distintas: Villa (granate + paisaje), Bosque (marfil + ramas), Regalos (verde + lazo).
- PNG canónico 1080×1080, estático, solo la tarjeta. Guía de longitud 40/200; el campo admite más y avisa si no entra visualmente. No se trunca en silencio.
- Placeholders con contraste compuesto ≥4.5 (mismo criterio que PR #2, `rgba(24,60,50,0.82)`).

## Juegos
- `/juegos` catálogo de dos tarjetas ilustradas.
- `/juegos/memoria` — 8 siluetas × 2, 16 cartas, parejas/8.
- `/juegos/regalos` — 9 ventanas, ronda 30s, aparición 1.8s, intervalo 350ms.

## Relación con PR2
Este trabajo (Scout V2) va en un PR nuevo, separado del PR #2 de contraste de placeholder. Incorpora el mismo arreglo de `::placeholder` para no dejar pendiente el FAIL 2.85:1. No fusiona ni cierra el PR2.

## Interpretación temporal del contador
- Navidad: 25 de diciembre a las 00:00:00 hora local.
- Si ya es 25/dic, el objetivo pasa al año siguiente.

## Pruebas
```bash
npm run build
npm run test:e2e
node scripts/pack-evidence.mjs
```

## Publicación en GitHub Pages (no en este PR)
- Workflow: `.github/workflows/deploy-pages.yml` (solo `main`).
- No se cambia Settings ni se relanza deploy desde esta rama.

## Scripts
- `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`
- `npm run preview:pages`: sirve `dist` en `/navidad-sitios-web/` para Playwright
- `npm run test:e2e`

## Licencias de guías (consulta local)
Emil (MIT) e Impeccable (Apache-2.0) como referencia conceptual. Taste solo referencia privada, sin redistribuir. Sin motores, hooks ni APIs pagas.

## Estado
Propuesta V2 implementada para revisión independiente. No producción. Sin merge ni publicación desde este PR.
