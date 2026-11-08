/* Propósito: punto de entrada de Villa Navidad. Monta la SPA y configura el enrutador. */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles.css'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('No se encontró el elemento #root')
}

// Soporte para SPA fallback de 404.html (query ?p=...)
const params = new URLSearchParams(window.location.search)
const pendingPath = params.get('p')
if (pendingPath && pendingPath.startsWith('/')) {
  const newUrl = new URL(window.location.href)
  newUrl.searchParams.delete('p')
  newUrl.pathname = import.meta.env.BASE_URL.replace(/\/$/, '') + pendingPath
  window.history.replaceState({}, '', newUrl)
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
