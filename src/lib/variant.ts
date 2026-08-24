/**
 * Variant selection for the modal hero defect.
 * Query-only switching keeps demo state changes instant with no rebuild or code edits.
 */
export type Variant = 'broken' | 'fixed'

export function readVariant(): Variant {
  return new URLSearchParams(window.location.search).get('variant') === 'fixed' ? 'fixed' : 'broken'
}
