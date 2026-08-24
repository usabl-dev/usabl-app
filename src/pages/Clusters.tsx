/**
 * Clusters route for the fixture app.
 * This route hosts the hero defect where focus return changes by URL variant.
 */
import { useRef, useState } from 'react'
import { Card, CardBody, CardTitle } from '@patternfly/react-core'
import { DemoModal } from '../components/DemoModal'
import { readVariant } from '../lib/variant'

export function Clusters() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const triggerEl = useRef<HTMLButtonElement>(null)
  const variant = readVariant()

  return (
    <Card isCompact>
      <CardTitle>Clusters</CardTitle>
      <CardBody>
        <p>Current environment: Production East.</p>
        <p>Upgrade risk: Attention required.</p>
        <p>
          <button
            ref={triggerEl}
            type="button"
            className="hero-action"
            aria-haspopup="dialog"
            onClick={() => setIsModalOpen(true)}
          >
            View cluster details
          </button>
        </p>
        <DemoModal
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          triggerEl={triggerEl.current}
          variant={variant}
        />
      </CardBody>
    </Card>
  )
}
