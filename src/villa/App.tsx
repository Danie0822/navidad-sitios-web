/* Propósito: layout principal y enrutamiento de la aplicación Villa Navidad. */
import { NavLink, Route, Routes } from 'react-router-dom'
import { Landing } from './pages/Landing'
import { Tarjetas } from './pages/Tarjetas'
import { Juegos } from './pages/Juegos'

function NavBar() {
  return (
    <header className="z-20 border-b border-[rgba(24,60,50,0.18)] bg-[var(--bg-ivory)]">
      <nav className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center justify-between text-[var(--forest)]">
        <NavLink to="/" className="flex items-center gap-2 font-semibold text-lg">
          <span aria-hidden className="inline-block w-3.5 h-3.5 rotate-45 bg-[var(--cta)] rounded-sm" />
          Villa Navidad
        </NavLink>
        <div className="flex gap-4">
          <NavLink
            to="/tarjetas"
            className={({ isActive }) =>
              `px-3 py-1 rounded-md text-sm font-medium focus:outline-none focus-visible:ring-2 ring-[var(--cta)] ${
                isActive ? 'bg-[var(--cta)] text-white' : 'text-[var(--forest)] hover:bg-neutral-100'
              }`
            }
          >
            Tarjetas
          </NavLink>
          <NavLink
            to="/juegos"
            className={({ isActive }) =>
              `px-3 py-1 rounded-md text-sm font-medium focus:outline-none focus-visible:ring-2 ring-[var(--cta)] ${
                isActive ? 'bg-[var(--cta)] text-white' : 'text-[var(--forest)] hover:bg-neutral-100'
              }`
            }
          >
            Juegos
          </NavLink>
        </div>
      </nav>
    </header>
  )
}

export default function App() {
  return (
    <div className="min-h-dvh bg-[var(--bg-ivory)] text-[var(--forest)]">
      <NavBar />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/tarjetas" element={<Tarjetas />} />
          <Route path="/juegos" element={<Juegos />} />
        </Routes>
      </main>
      <footer className="mx-auto max-w-6xl px-4 sm:px-6 py-8 text-sm text-neutral-600">
        <p>Villa Navidad — ¡Felices Fiestas!</p>
      </footer>
    </div>
  )
}
