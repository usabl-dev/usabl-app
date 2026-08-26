import { useLocation, useNavigate } from 'react-router-dom'
import { buildDemoSearch, DEMO_SCENARIOS, readDemoState, scenarioById, type DemoScenarioId, type PreviewMode } from '../demo/scenarios'

const previewOptions: ReadonlyArray<{ value: PreviewMode; label: string }> = [
  { value: 'current', label: 'Current source' },
  { value: 'broken', label: 'Broken teaching preview' },
  { value: 'repaired', label: 'Repaired teaching preview' },
]

export function DemoControls() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = readDemoState(location.search)
  const scenario = scenarioById(state.scenarioId)

  const selectScenario = (scenarioId: DemoScenarioId) => {
    const next = scenarioById(scenarioId)
    navigate({ pathname: next.route, search: buildDemoSearch({ ...state, scenarioId }) })
  }

  const selectPreview = (preview: PreviewMode) => {
    navigate({ pathname: scenario.route, search: buildDemoSearch({ ...state, preview }) })
  }

  return (
    <aside className="demo-controls" aria-labelledby="demo-controls-title">
      <div className="demo-controls__heading">
        <p className="demo-controls__context">Team demo</p>
        <h2 id="demo-controls-title">Demo controls</h2>
      </div>
      <div className="demo-controls__field">
        <label htmlFor="demo-scenario">Scenario</label>
        <select id="demo-scenario" value={state.scenarioId} onChange={(event) => selectScenario(event.target.value as DemoScenarioId)}>
          {DEMO_SCENARIOS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
        </select>
      </div>
      <div className="demo-controls__field">
        <label htmlFor="demo-preview">Preview</label>
        <select id="demo-preview" value={state.preview} onChange={(event) => selectPreview(event.target.value as PreviewMode)}>
          {previewOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </div>
      <div className="demo-controls__selection" aria-live="polite">
        <strong>{scenario.label}</strong>
        <p>{scenario.description}</p>
      </div>
      <p className="demo-controls__boundary">Preview controls support rehearsal. Usabl verifies source changes, not this preview.</p>
      <button type="button" className="text-action" onClick={() => navigate('/settings?scenario=deployment-workflow&preview=current')}>
        Open clean control
      </button>
    </aside>
  )
}
