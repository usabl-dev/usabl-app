/**
 * Clusters route for the fixture app.
 * The hero defect is introduced here in a later commit so tests can drive modal behavior.
 */
import { Card, CardBody, CardTitle } from '@patternfly/react-core'
import { StatusBadge } from '../components/StatusBadge'

export function Clusters() {
  return (
    <Card isCompact>
      <CardTitle>Clusters</CardTitle>
      <CardBody>
        <p>Current environment: Production East.</p>
        <p>
          Upgrade risk: <StatusBadge text="Attention required" tone="attention" />
        </p>
      </CardBody>
    </Card>
  )
}
