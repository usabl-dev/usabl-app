/**
 * Overview route for the fixture app.
 * This screen stays simple so baseline checks can exercise a stable, non-modal surface.
 */
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/StatusBadge'

export function Overview() {
  return (
    <div className="page-stack">
      <PageHeader title="Fleet overview" description="Monitor cluster health and deployment readiness across Production East." actions={<Link className="primary-action" to="/deployments">Review deployments</Link>} />
      <dl className="status-band" aria-label="Fleet summary">
        <div><dt>Region status</dt><dd><StatusBadge text="Healthy" tone="healthy" /></dd></div>
        <div><dt>Connected clusters</dt><dd>24 of 24</dd></div>
        <div><dt>Open alerts</dt><dd>2 need review</dd></div>
        <div><dt>Snapshot</dt><dd>Refreshed 2 minutes ago</dd></div>
      </dl>
      <section className="workflow-section" aria-labelledby="environment-title">
        <div className="section-heading"><div><h2 id="environment-title">Environment health</h2><p>Current state across the active fleet.</p></div></div>
        <div className="table-region" role="region" aria-label="Environment health table" tabIndex={0}>
          <table className="data-table">
            <thead><tr><th scope="col">Environment</th><th scope="col">Clusters</th><th scope="col">Deployments</th><th scope="col">Status</th></tr></thead>
            <tbody>
              <tr><th scope="row">Production East</th><td>16</td><td>20</td><td><StatusBadge text="Healthy" tone="healthy" /></td></tr>
              <tr><th scope="row">Production West</th><td>8</td><td>11</td><td><StatusBadge text="Review" tone="warning" /></td></tr>
              <tr><th scope="row">Stage East</th><td>5</td><td>9</td><td><StatusBadge text="Healthy" tone="healthy" /></td></tr>
            </tbody>
          </table>
        </div>
      </section>
      <section className="activity-section" aria-labelledby="activity-title">
        <div className="section-heading"><div><h2 id="activity-title">Recent activity</h2><p>Changes that may need an operator response.</p></div></div>
        <ol className="activity-list">
          <li><span>22:41</span><div><strong>policy-worker requires review</strong><p>One readiness check did not complete in prod-east-2.</p></div></li>
          <li><span>22:36</span><div><strong>inventory-api deployed</strong><p>Version 2026.08.26-4 reached all production replicas.</p></div></li>
          <li><span>22:20</span><div><strong>Fleet snapshot refreshed</strong><p>All 24 connected clusters reported current status.</p></div></li>
        </ol>
      </section>
    </div>
  )
}
