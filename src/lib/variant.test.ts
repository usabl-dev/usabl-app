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

  it('keeps current and broken previews on the planted behavior', () => {
    window.history.replaceState({}, '', '/clusters?preview=current')
    expect(readVariant()).toBe('broken')
    window.history.replaceState({}, '', '/clusters?preview=broken')
    expect(readVariant()).toBe('broken')
  })
})
