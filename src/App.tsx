/**
 * Shared application shell for the usabl fixture routes.
 * This file only composes screens and navigation, and keeps route ownership explicit.
 */
import { Navigate, NavLink, Route, Routes } from 'react-router-dom'
import { DemoControls } from './components/DemoControls'
import { Clusters } from './pages/Clusters'
import { Deployments } from './pages/Deployments'
import { Overview } from './pages/Overview'
import { Settings } from './pages/Settings'

const navItems = [
  { href: '/', label: 'Overview' },
  { href: '/deployments', label: 'Deployments' },
  { href: '/clusters', label: 'Clusters' },
  { href: '/settings', label: 'Settings' },
] as const

function App() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header className="masthead">
        <div><span className="masthead__brand">Fleet Operations</span><span className="masthead__context">usabl team fixture</span></div>
        <div className="masthead__environment"><span aria-hidden="true" />Production East</div>
      </header>
      <div className="app-shell__body">
        <nav className="primary-nav" aria-label="Primary">
          <p className="primary-nav__label">Workspace</p>
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
        <DemoControls />
        <main id="main-content" className="app-shell__main">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/deployments" element={<Deployments />} />
            <Route path="/clusters" element={<Clusters />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
