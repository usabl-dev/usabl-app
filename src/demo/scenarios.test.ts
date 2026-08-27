import { describe, expect, it } from 'vitest'
import { buildDemoSearch, readDemoState, scenarioById } from './scenarios'

describe('demo scenario registry', () => {
  it('defaults unknown query values to the deployment workflow and current preview', () => {
    expect(readDemoState('?scenario=unknown&preview=unknown')).toEqual({
      scenarioId: 'deployment-workflow',
      preview: 'current',
    })
  })

  it('keeps a supported scenario and repaired teaching preview', () => {
    expect(readDemoState('?scenario=cluster-dialog&preview=repaired')).toEqual({
      scenarioId: 'cluster-dialog',
      preview: 'repaired',
    })
  })

  it('builds stable query text and resolves the scenario route', () => {
    expect(buildDemoSearch({ scenarioId: 'notification', preview: 'broken' })).toBe(
      '?scenario=notification&preview=broken',
    )
    expect(scenarioById('notification').route).toBe('/deployments')
  })
})
