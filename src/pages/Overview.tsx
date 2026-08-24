/**
 * Overview route for the fixture app.
 * This screen stays simple so baseline checks can exercise a stable, non-modal surface.
 */
import { Card, CardBody, CardTitle } from '@patternfly/react-core'
import { StatusBadge } from '../components/StatusBadge'

export function Overview() {
  return (
    <Card isCompact>
      <CardTitle>Overview</CardTitle>
      <CardBody>
        <p>Cluster health snapshots are refreshed every five minutes.</p>
        <p>
          Primary region status: <StatusBadge text="Healthy" tone="healthy" />
        </p>
      </CardBody>
    </Card>
  )
}
