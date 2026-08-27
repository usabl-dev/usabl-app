/**
 * Variant selection for the modal hero defect.
 * Current follows the tracked source state. Explicit previews remain teaching aids.
 */
import { readDemoState, resolvePreviewMode } from '../demo/scenarios'

export type Variant = 'broken' | 'fixed'

export function readVariant(): Variant {
  const params = new URLSearchParams(window.location.search)
  const explicit = params.get('variant')
  if (explicit === 'fixed' || explicit === 'broken') {
    return explicit
  }
  return resolvePreviewMode(readDemoState(window.location.search).preview) === 'repaired' ? 'fixed' : 'broken'
}
