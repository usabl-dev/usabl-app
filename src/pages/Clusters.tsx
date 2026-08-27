/**
 * Clusters route for the fixture app.
 * This route hosts the hero defect where focus return changes by URL variant.
 */
import { useRef, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/StatusBadge'
import { DemoModal } from '../components/DemoModal'
import { readVariant } from '../lib/variant'

export function Clusters() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const triggerEl = useRef<HTMLButtonElement>(null)
  const variant = readVariant()

  return (
    <div className="page-stack">
      <PageHeader title="Clusters" description="Inspect capacity, health, and upgrade readiness for Production East." />
      <dl className="status-band" aria-label="Cluster summary">
        <div><dt>Connected</dt><dd>16 clusters</dd></div><div><dt>Healthy</dt><dd>15 clusters</dd></div><div><dt>Attention</dt><dd>1 cluster</dd></div><div><dt>Upgrade channel</dt><dd>Stable 4.20</dd></div>
      </dl>
      <section className="workflow-section" aria-labelledby="cluster-list-title">
        <div className="section-heading"><div><h2 id="cluster-list-title">Cluster inventory</h2><p>Open the selected cluster to review runtime details.</p></div></div>
        <div className="table-region" role="region" aria-label="Cluster inventory table" tabIndex={0}>
          <table className="data-table"><thead><tr><th scope="col">Cluster</th><th scope="col">Version</th><th scope="col">Nodes</th><th scope="col">Status</th><th scope="col">Action</th></tr></thead><tbody><tr><th scope="row">prod-east-1</th><td>4.20.3</td><td>18</td><td><StatusBadge text="Attention" tone="attention" /></td><td>
          <button
            ref={triggerEl}
            type="button"
            className="hero-action"
            aria-haspopup="dialog"
            onClick={() => setIsModalOpen(true)}
          >
            View cluster details
          </button>
          </td></tr></tbody></table>
        </div>
        <DemoModal
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          triggerRef={triggerEl}
          variant={variant}
        />
      </section>
    </div>
  )
}
