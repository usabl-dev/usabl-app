/**
 * Variant selection for the modal hero defect.
 * Query-only switching keeps demo state changes instant with no rebuild or code edits.
 */
export type Variant = 'broken' | 'fixed'

export function readVariant(): Variant {
  const params = new URLSearchParams(window.location.search)
  return params.get('variant') === 'fixed' || params.get('preview') === 'repaired' ? 'fixed' : 'broken'
}
