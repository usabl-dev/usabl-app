import { describe, expect, it } from 'vitest'
import { CURRENT_SOURCE_MODE, resolvePreviewMode } from './scenarios'

describe('demo source state', () => {
  it('keeps current tied to source and teaching previews independent', () => {
    expect(['broken', 'repaired']).toContain(CURRENT_SOURCE_MODE)
    expect(resolvePreviewMode('current')).toBe(CURRENT_SOURCE_MODE)
    expect(resolvePreviewMode('broken')).toBe('broken')
    expect(resolvePreviewMode('repaired')).toBe('repaired')
  })
})
