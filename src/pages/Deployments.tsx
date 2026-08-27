import { Link, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/StatusBadge'
import { readDemoState, resolvePreviewMode, scenarioById } from '../demo/scenarios'
import './scenario-surfaces.css'

const deployments = [
  { name: 'inventory-api', version: '2026.08.26-4', cluster: 'prod-east-1', status: 'Ready', statusKey: 'ready', tone: 'healthy' },
  { name: 'policy-worker', version: '2026.08.26-2', cluster: 'prod-east-2', status: 'Review', statusKey: 'review', tone: 'warning' },
  { name: 'console-web', version: '2026.08.25-9', cluster: 'stage-east-1', status: 'Blocked', statusKey: 'blocked', tone: 'attention' },
] as const

export function Deployments() {
  const state = readDemoState(useLocation().search)
  const scenario = scenarioById(state.scenarioId)
  const isRepaired = resolvePreviewMode(state.preview) === 'repaired'
  const [draftQuery, setDraftQuery] = useState('')
  const [draftStatus, setDraftStatus] = useState('all')
  const [filters, setFilters] = useState({ query: '', status: 'all' })
  const [menuOpen, setMenuOpen] = useState(false)
  const [deploymentStarted, setDeploymentStarted] = useState(false)
  const menuToggleRef = useRef<HTMLButtonElement>(null)
  const firstMenuItemRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (menuOpen && isRepaired) {
      firstMenuItemRef.current?.focus()
    }
  }, [isRepaired, menuOpen])

  const filteredDeployments = deployments.filter((deployment) => {
    const matchesQuery = deployment.name.includes(filters.query.toLowerCase()) || deployment.version.includes(filters.query)
    return matchesQuery && (filters.status === 'all' || deployment.statusKey === filters.status)
  })

  const clearFilters = () => {
    setDraftQuery('')
    setDraftStatus('all')
    setFilters({ query: '', status: 'all' })
  }

  const closeMenu = () => {
    setMenuOpen(false)
    if (isRepaired) {
      menuToggleRef.current?.focus()
    }
  }

  const notification = deploymentStarted ? (
    <div className="pf-v6-c-alert deployment-alert" role="alert">
      <strong>Deployment started</strong>
      <span>inventory-api is being deployed to prod-east-1.</span>
    </div>
  ) : null

  return (
    <div className="page-stack">
      <PageHeader title="Deployments" description="Review release readiness across production and staging clusters." actions={<Link className="primary-action" to="/deployments?scenario=notification&preview=current">Review next deployment</Link>} />
      <dl className="status-band" aria-label="Deployment summary">
        <div><dt>Environment</dt><dd>Production East</dd></div>
        <div><dt>Ready</dt><dd>18 deployments</dd></div>
        <div><dt>Needs review</dt><dd>2 deployments</dd></div>
        <div><dt>Last synchronized</dt><dd>2 minutes ago</dd></div>
      </dl>
      <section className="scenario-focus" aria-labelledby="scenario-focus-title">
        <div><p className="section-context">Scenario focus</p><h2 id="scenario-focus-title">{scenario.label}</h2></div>
        <p>{scenario.description}</p>
      </section>
      <section className="workflow-section" aria-labelledby="deployment-list-title">
        <div className="section-heading"><div><h2 id="deployment-list-title">Deployment list</h2><p>Three representative releases are shown for the team workflow.</p></div></div>
        <form className="filter-toolbar pf-v6-c-toolbar" aria-label={isRepaired ? 'Deployment filters' : undefined} onSubmit={(event) => { event.preventDefault(); setFilters({ query: draftQuery.trim(), status: draftStatus }) }}>
          <div className="filter-toolbar__field filter-toolbar__field--search"><label htmlFor="deployment-search">Search deployments</label><input id="deployment-search" type="search" placeholder="Name or version" value={draftQuery} onChange={(event) => setDraftQuery(event.target.value)} /></div>
          <div className="filter-toolbar__field"><label htmlFor="deployment-status">Status</label><select id="deployment-status" value={draftStatus} onChange={(event) => setDraftStatus(event.target.value)}><option value="all">All statuses</option><option value="ready">Ready</option><option value="review">Needs review</option><option value="blocked">Blocked</option></select></div>
          <button type="submit" className="secondary-action">Apply filters</button>
        </form>
        <div className="deployment-actions pf-v6-c-toolbar" role="toolbar" aria-label={isRepaired ? 'Deployment actions' : undefined}>
          <button type="button" className="primary-action" onClick={() => setDeploymentStarted(true)}>Start deployment</button>
          <button type="button" className="icon-action" data-testid="clear-filters" aria-label={isRepaired ? 'Clear filters' : undefined} onClick={clearFilters}><span aria-hidden="true">×</span></button>
        </div>
        {isRepaired ? <div className="notification-region" role="status" aria-live="polite">{notification}</div> : notification}
        <p className="result-count" aria-live="polite">{filteredDeployments.length} deployments shown</p>
        <div className="table-region" role="region" aria-label="Deployments table" tabIndex={0}>
          <table className="data-table">
            <thead><tr><th scope="col">Deployment</th><th scope="col">Version</th><th scope="col">Cluster</th><th scope="col">Status</th><th scope="col">Actions</th></tr></thead>
            <tbody>{filteredDeployments.map((deployment) => (
              <tr key={deployment.name}>
                <th scope="row">{deployment.name}</th><td className="mono-value">{deployment.version}</td><td>{deployment.cluster}</td><td><StatusBadge text={deployment.status} tone={deployment.tone} /></td>
                <td><div className="row-actions">
                  <button type="button" className="table-action" aria-label={isRepaired ? `View ${deployment.name} details` : undefined}>View details</button>
                  {deployment.name === 'policy-worker' ? <div className="action-menu">
                    <button ref={menuToggleRef} type="button" className="table-action" aria-label="Actions for policy-worker" aria-haspopup="menu" {...(isRepaired ? { 'aria-expanded': menuOpen } : {})} onClick={() => setMenuOpen((open) => !open)}>Actions</button>
                    {menuOpen ? <ul className="action-menu__list" role="menu" onKeyDown={(event) => { if (event.key === 'Escape') { event.preventDefault(); closeMenu() } }}>
                      <li role="none"><button ref={firstMenuItemRef} type="button" role="menuitem" onClick={closeMenu}>Restart deployment</button></li>
                      <li role="none"><button type="button" role="menuitem" onClick={closeMenu}>View logs</button></li>
                    </ul> : null}
                  </div> : null}
                </div></td>
              </tr>
            ))}{filteredDeployments.length === 0 ? <tr><td colSpan={5}>No deployments match these filters.</td></tr> : null}</tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
