/**
 * Modal used to demonstrate focus-return behavior differences.
 * The broken variant disables the focus trap to plant a real WCAG 2.4.3 focus-order defect.
 * Blurring after a correct restore would fabricate behavior that the browser and PatternFly did not produce.
 */
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from '@patternfly/react-core'
import { useLayoutEffect, useRef, type RefObject } from 'react'
import type { Variant } from '../lib/variant'

interface DemoModalProps {
  isOpen: boolean
  onRequestClose: () => void
  triggerRef: RefObject<HTMLButtonElement | null>
  variant: Variant
}

export function DemoModal({ isOpen, onRequestClose, triggerRef, variant }: DemoModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useLayoutEffect(() => {
    if (isOpen && variant === 'fixed') {
      closeButtonRef.current?.focus()
    }
  }, [isOpen, variant])

  const closeModal = () => {
    onRequestClose()
    if (variant === 'fixed') {
      triggerRef.current?.focus()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      aria-labelledby="cluster-details-title"
      variant="medium"
      disableFocusTrap={variant === 'broken'}
      elementToFocus={variant === 'fixed' ? '#cluster-details-close' : undefined}
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
        <Button id="cluster-details-close" ref={closeButtonRef} variant="primary" onClick={closeModal}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  )
}
