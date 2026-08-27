import { CURRENT_SOURCE_MODE } from '../demo/scenarios'
import { readVariant } from './variant'

describe('readVariant', () => {
  it('preserves the original fixed query oracle', () => {
    window.history.replaceState({}, '', '/clusters?variant=fixed')
    expect(readVariant()).toBe('fixed')
  })

  it('maps the repaired teaching preview to fixed behavior', () => {
    window.history.replaceState({}, '', '/clusters?preview=repaired')
    expect(readVariant()).toBe('fixed')
  })

  it('keeps current on the tracked source mode and preserves the broken preview', () => {
    window.history.replaceState({}, '', '/clusters?preview=current')
    expect(readVariant()).toBe(CURRENT_SOURCE_MODE === 'repaired' ? 'fixed' : 'broken')
    window.history.replaceState({}, '', '/clusters?preview=broken')
    expect(readVariant()).toBe('broken')
  })
})
