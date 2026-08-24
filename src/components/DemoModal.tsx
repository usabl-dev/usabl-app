/**
 * Modal used to demonstrate focus-return behavior differences.
 * Only the fixed variant restores focus to the trigger, so the broken variant remains an intentional probe target.
 */
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from '@patternfly/react-core'
import type { Variant } from '../lib/variant'

interface DemoModalProps {
  isOpen: boolean
  onRequestClose: () => void
  triggerEl: HTMLButtonElement | null
  variant: Variant
}

export function DemoModal({ isOpen, onRequestClose, triggerEl, variant }: DemoModalProps) {
  const closeModal = () => {
    onRequestClose()
    if (variant === 'fixed') {
      triggerEl?.focus()
      return
    }

    // The broken variant intentionally fails to restore trigger focus.
    // We explicitly blur after close so tests capture the planted defect reliably.
    window.setTimeout(() => {
      triggerEl?.blur()
    }, 0)
  }

  return (
    <Modal isOpen={isOpen} onClose={closeModal} aria-labelledby="cluster-details-title" variant="medium">
      <ModalHeader
        title="Cluster details"
        labelId="cluster-details-title"
        description="Runtime metrics for the selected cluster."
      />
      <ModalBody>
        <p>CPU usage is within expected baseline.</p>
        <p>Storage warning threshold has not been crossed.</p>
      </ModalBody>
      <ModalFooter>
        <Button variant="primary" onClick={closeModal}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  )
}
