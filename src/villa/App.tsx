/* Propósito: navbar coherente, rutas V2 y proveedor de pausa para toda la SPA. */
import type { ReactNode } from 'react'
import { NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { Landing } from './pages/Landing'
import { Tarjetas } from './pages/Tarjetas'
import { Juegos } from './pages/Juegos'
import { MemoriaPage } from './pages/MemoriaPage'
import { RegalosPage } from './pages/RegalosPage'
import { NotFound } from './pages/NotFound'
import { MotionProvider } from './motion/MotionContext'

function NavBar() {
  return (
    <header className="z-20 border-b border-[var(--line)] bg-[var(--bg-ivory)]">
      <nav className="page-shell flex flex-wrap items-center justify-between gap-2 py-3 text-[var(--forest)]">
        <NavLink to="/" end className="brand-mark flex items-center gap-2 text-lg min-h-11">
          <span aria-hidden className="inline-block w-3.5 h-3.5 rotate-45 bg-[var(--cta)] rounded-sm" />
          Villa Navidad
        </NavLink>
        <div className="flex flex-wrap gap-1">
          <NavLink to="/tarjetas" className="nav-link">
            Tarjetas
          </NavLink>
          <NavLink to="/juegos" className="nav-link">
            Juegos
          </NavLink>
        </div>
      </nav>
    </header>
  )
}

function PageFrame({ children }: { children: ReactNode }) {
  const loc = useLocation()
  return (
    <div key={loc.pathname} className="page-enter">
      {children}
    </div>
  )
}

export default function App() {
  return (
    <MotionProvider>
      <div className="min-h-dvh bg-[var(--bg-ivory)] text-[var(--forest)]">
        <NavBar />
        <main className="page-shell py-8 sm:py-10">
          <PageFrame>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/tarjetas" element={<Tarjetas />} />
              <Route path="/juegos" element={<Juegos />} />
              <Route path="/juegos/memoria" element={<MemoriaPage />} />
              <Route path="/juegos/regalos" element={<RegalosPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </PageFrame>
        </main>
        <footer className="site-footer page-shell">
          <p>Villa Navidad — con cariño. Sin cuentas.</p>
        </footer>
      </div>
    </MotionProvider>
  )
}
