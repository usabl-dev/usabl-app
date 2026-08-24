/**
 * Shared application shell for the usabl fixture routes.
 * This file only composes screens and navigation, and keeps route ownership explicit.
 */
import { Navigate, NavLink, Route, Routes } from 'react-router-dom'
import { Clusters } from './pages/Clusters'
import { Overview } from './pages/Overview'
import { Settings } from './pages/Settings'

const navItems = [
  { href: '/', label: 'Overview' },
  { href: '/clusters', label: 'Clusters' },
  { href: '/settings', label: 'Settings' },
] as const

function App() {
  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <h1 className="app-shell__title">usabl-app fixture</h1>
        <nav aria-label="Primary">
          <ul className="app-shell__nav-list">
            {navItems.map((item) => (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    isActive ? 'app-shell__nav-link is-active' : 'app-shell__nav-link'
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="app-shell__main">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/clusters" element={<Clusters />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
