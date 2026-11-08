/* Propósito: layout principal y enrutamiento de la aplicación Villa Navidad. */
import { NavLink, Route, Routes } from 'react-router-dom'
import { Landing } from './pages/Landing'
import { Tarjetas } from './pages/Tarjetas'
import { Juegos } from './pages/Juegos'

function NavBar() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-900/80 backdrop-blur border-b border-neutral-200 dark:border-neutral-800">
      <nav className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center justify-between">
        <NavLink to="/" className="font-semibold text-lg text-red-700 dark:text-red-300">
          Villa Navidad
        </NavLink>
        <div className="flex gap-4">
          <NavLink
            to="/tarjetas"
            className={({ isActive }) =>
              `px-3 py-1 rounded-md text-sm font-medium focus:outline-none focus-visible:ring-2 ring-red-400 ${
                isActive ? 'bg-red-600 text-white' : 'text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-neutral-800'
              }`
            }
          >
            Tarjetas
          </NavLink>
          <NavLink
            to="/juegos"
            className={({ isActive }) =>
              `px-3 py-1 rounded-md text-sm font-medium focus:outline-none focus-visible:ring-2 ring-red-400 ${
                isActive ? 'bg-emerald-600 text-white' : 'text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-neutral-800'
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
    <div className="min-h-dvh bg-gradient-to-b from-red-50 to-white dark:from-neutral-900 dark:to-neutral-950 text-neutral-900 dark:text-neutral-100">
      <NavBar />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/tarjetas" element={<Tarjetas />} />
          <Route path="/juegos" element={<Juegos />} />
        </Routes>
      </main>
      <footer className="mx-auto max-w-6xl px-4 sm:px-6 py-8 text-sm text-neutral-500 dark:text-neutral-400">
        <p>Villa Navidad — ¡Felices Fiestas!</p>
      </footer>
    </div>
  )
}
