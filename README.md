# Villa Navidad — SPA React + Vite (ES)

Villa Navidad es una SPA sencilla (sin backend) con:
- Landing navideña protagonista con animaciones livianas (nieve y luces)
- Cuenta regresiva a la próxima Navidad
- Editor de tarjetas con varias plantillas y descarga a imagen
- EXACTAMENTE dos minijuegos: Memoria y Atrapa Regalos

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
Abre `http://localhost:5173` en tu navegador.

## Compilar producción
```bash
npm run build
npm run preview
```
Para GitHub Pages (ruta base /navidad-sitios-web/):
- El build de producción usa base '/navidad-sitios-web/' automáticamente.
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
    LightGarland.tsx
    cards/
      CardEditor.tsx
      CardPreview.tsx
  games/
    MemoryGame.tsx
    CatchGiftsGame.tsx
  icons/
    Navidad.tsx
  pages/
    Landing.tsx
    Tarjetas.tsx
    Juegos.tsx
```

## Convenciones
- Basado en proyectos previos del autor con React + Vite + Tailwind.
- Código simple y reutilizable, con un breve comentario al inicio de cada archivo explicando su propósito.
- Accesibilidad: foco visible, soporte teclado/táctil, contraste adecuado, y `prefers-reduced-motion` respeta usuarios sensibles a movimiento.

## Interpretación temporal del contador
- Navidad se considera el 25 de diciembre a las 00:00:00 en la zona horaria local del navegador.
- Si el día actual es 25/dic (cualquier hora), el objetivo pasa a ser el 25/dic del año siguiente (el contador nunca es negativo).
- El objetivo se muestra claramente debajo del contador.

## Pruebas manuales recomendadas
1. Navegación: ir a Landing → Tarjetas → Juegos y volver, sin errores.
2. Contador: verificar que no se vuelve negativo y que el objetivo sea correcto.
3. Tarjetas:
   - Escribir destinatario y mensaje; observar la previsualización.
   - Descargar la imagen; abrir el archivo y confirmar que es legible y sin cortes.
4. Memoria:
   - No permite seleccionar la misma carta dos veces para un mismo intento.
   - Solo acepta parejas válidas; al completar, muestra fin y puede reiniciar.
5. Atrapa regalos:
   - Suma un punto por regalo atrapado (sin dobles cobros).
   - Funciona con flechas del teclado y táctil/arrastre; reinicio limpia estado.
6. Responsive:
   - Sin desbordes en móvil/escritorio; foco visible; buen contraste.
7. `prefers-reduced-motion`:
   - Con motion reducido, las animaciones decorativas se minimizan/suspende nieve.

## Capturas para transferencia
Tras ejecutar las pruebas en navegador, capturas de ejemplo han sido almacenadas en:
- `/opt/cursor/artifacts/villa-navidad-desktop.png`
- `/opt/cursor/artifacts/villa-navidad-mobile.png`

## Publicación en GitHub Pages (pendiente de aprobación)
- Workflow: `.github/workflows/deploy-pages.yml` (seguro, permisos mínimos).
- Despliegue solo en `main`. No despliega PRs.
- Pasos a activar por un admin, después del visto bueno:
  1. En el repo: Settings → Pages → Build and deployment → Source: GitHub Actions.
  2. Hacer merge a `main` cuando QA lo apruebe.
- URL esperada tras activación: `https://<usuario>.github.io/navidad-sitios-web/`.

## Scripts
- `npm run dev`: servidor de desarrollo
- `npm run build`: genera la build de producción
- `npm run preview`: sirve la build para verificación
- `npm run lint`: linting (Oxlint)

## Licencias de guías de diseño (solo consulta local)
Se han consultado guías de Emil (MIT) e Impeccable (Apache-2.0) solo como referencia conceptual. No se instalaron lanzadores, motores, hooks ni telemetría, ni se ejecutó ningún setup upstream.

## Estado
Ready for QA (no producción). Sin despliegue automático.
