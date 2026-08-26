/**
 * Reusable status badge used by multiple pages in this fixture.
 * Keeping this shared component lets later engine demos fan out one finding to many surfaces.
 */
type StatusTone = 'healthy' | 'warning' | 'attention'

interface StatusBadgeProps {
  text: string
  tone: StatusTone
}

export function StatusBadge({ text, tone }: StatusBadgeProps) {
  return <span className={`status-badge status-badge--${tone}`}>{text}</span>
}
