import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/StatusBadge'
import { readDemoState, scenarioById } from '../demo/scenarios'

const deployments = [
  { name: 'inventory-api', version: '2026.08.26-4', cluster: 'prod-east-1', status: 'Ready', statusKey: 'ready', tone: 'healthy' },
  { name: 'policy-worker', version: '2026.08.26-2', cluster: 'prod-east-2', status: 'Review', statusKey: 'review', tone: 'warning' },
  { name: 'console-web', version: '2026.08.25-9', cluster: 'stage-east-1', status: 'Blocked', statusKey: 'blocked', tone: 'attention' },
] as const

export function Deployments() {
  const state = readDemoState(useLocation().search)
  const scenario = scenarioById(state.scenarioId)
  const [draftQuery, setDraftQuery] = useState('')
  const [draftStatus, setDraftStatus] = useState('all')
  const [filters, setFilters] = useState({ query: '', status: 'all' })
  const filteredDeployments = deployments.filter((deployment) => {
    const matchesQuery = deployment.name.includes(filters.query.toLowerCase()) || deployment.version.includes(filters.query)
    return matchesQuery && (filters.status === 'all' || deployment.statusKey === filters.status)
  })

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
        <form className="filter-toolbar" aria-label="Deployment filters" onSubmit={(event) => { event.preventDefault(); setFilters({ query: draftQuery.trim(), status: draftStatus }) }}>
          <div className="filter-toolbar__field filter-toolbar__field--search"><label htmlFor="deployment-search">Search deployments</label><input id="deployment-search" type="search" placeholder="Name or version" value={draftQuery} onChange={(event) => setDraftQuery(event.target.value)} /></div>
          <div className="filter-toolbar__field"><label htmlFor="deployment-status">Status</label><select id="deployment-status" value={draftStatus} onChange={(event) => setDraftStatus(event.target.value)}><option value="all">All statuses</option><option value="ready">Ready</option><option value="review">Needs review</option><option value="blocked">Blocked</option></select></div>
          <button type="submit" className="secondary-action">Apply filters</button>
        </form>
        <p className="result-count" aria-live="polite">{filteredDeployments.length} deployments shown</p>
        <div className="table-region" role="region" aria-label="Deployments table" tabIndex={0}>
          <table className="data-table">
            <thead><tr><th scope="col">Deployment</th><th scope="col">Version</th><th scope="col">Cluster</th><th scope="col">Status</th><th scope="col">Action</th></tr></thead>
            <tbody>{filteredDeployments.map((deployment) => (
              <tr key={deployment.name}><th scope="row">{deployment.name}</th><td className="mono-value">{deployment.version}</td><td>{deployment.cluster}</td><td><StatusBadge text={deployment.status} tone={deployment.tone} /></td><td><Link className="table-action" to="/clusters?scenario=cluster-dialog&preview=current" aria-label={`View ${deployment.name} details`}>View details</Link></td></tr>
            ))}{filteredDeployments.length === 0 ? <tr><td colSpan={5}>No deployments match these filters.</td></tr> : null}</tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
