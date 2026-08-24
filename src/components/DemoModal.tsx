/**
 * Modal used to demonstrate focus-return behavior differences.
 * The broken variant disables the focus trap to plant a real WCAG 2.4.3 focus-order defect.
 * Blurring after a correct restore would fabricate behavior that the browser and PatternFly did not produce.
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
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      aria-labelledby="cluster-details-title"
      variant="medium"
      disableFocusTrap={variant === 'broken'}
    >
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
