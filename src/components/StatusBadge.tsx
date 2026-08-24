/**
 * Reusable status badge used by multiple pages in this fixture.
 * Keeping this shared component lets later engine demos fan out one finding to many surfaces.
 */
import { Label } from '@patternfly/react-core'

type StatusTone = 'healthy' | 'warning' | 'attention'

const toneToColor: Record<StatusTone, 'green' | 'orange' | 'red'> = {
  healthy: 'green',
  warning: 'orange',
  attention: 'red',
}

interface StatusBadgeProps {
  text: string
  tone: StatusTone
}

export function StatusBadge({ text, tone }: StatusBadgeProps) {
  return <Label color={toneToColor[tone]}>{text}</Label>
}
