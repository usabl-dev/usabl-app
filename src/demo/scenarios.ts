export type SourceMode = 'broken' | 'repaired'

export const CURRENT_SOURCE_MODE: SourceMode = 'repaired'
export const CURRENT_SOURCE_LABEL = 'baseline-repaired'

export type DemoScenarioId =
  | 'deployment-workflow'
  | 'cluster-dialog'
  | 'row-actions'
  | 'action-menu'
  | 'notification'
  | 'filters-status'

export type PreviewMode = 'current' | 'broken' | 'repaired'

export interface DemoScenario {
  id: DemoScenarioId
  label: string
  description: string
  route: '/deployments' | '/clusters'
}

export interface DemoState {
  scenarioId: DemoScenarioId
  preview: PreviewMode
}

export const DEMO_SCENARIOS: readonly DemoScenario[] = [
  { id: 'deployment-workflow', label: 'Deployment workflow', description: 'Review the complete release workflow and its current accessibility state.', route: '/deployments' },
  { id: 'cluster-dialog', label: 'Cluster details dialog', description: 'Open cluster details, inspect the dialog, close it, and continue from the trigger.', route: '/clusters' },
  { id: 'row-actions', label: 'Deployment row actions', description: 'Identify the correct action for a deployment from its table context.', route: '/deployments' },
  { id: 'action-menu', label: 'Deployment action menu', description: 'Open a deployment menu and choose an operation with a keyboard.', route: '/deployments' },
  { id: 'notification', label: 'Deployment notification', description: 'Start a deployment and learn whether the action completed.', route: '/deployments' },
  { id: 'filters-status', label: 'Filters and status', description: 'Filter deployments and understand the resulting status.', route: '/deployments' },
] as const

const DEFAULT_STATE: DemoState = { scenarioId: 'deployment-workflow', preview: 'current' }
const previewModes: readonly PreviewMode[] = ['current', 'broken', 'repaired']

export function scenarioById(id: DemoScenarioId): DemoScenario {
  return DEMO_SCENARIOS.find((scenario) => scenario.id === id) ?? DEMO_SCENARIOS[0]
}

export function readDemoState(search: string): DemoState {
  const params = new URLSearchParams(search)
  const scenario = DEMO_SCENARIOS.find((candidate) => candidate.id === params.get('scenario'))
  const preview = previewModes.find((candidate) => candidate === params.get('preview'))
  return { scenarioId: scenario?.id ?? DEFAULT_STATE.scenarioId, preview: preview ?? DEFAULT_STATE.preview }
}

export function buildDemoSearch(state: DemoState): string {
  return `?${new URLSearchParams({ scenario: state.scenarioId, preview: state.preview }).toString()}`
}

export function resolvePreviewMode(preview: PreviewMode): SourceMode {
  return preview === 'current' ? CURRENT_SOURCE_MODE : preview
}
