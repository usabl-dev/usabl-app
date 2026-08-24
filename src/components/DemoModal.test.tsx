/**
 * Focus-return tests for the hero modal defect and fix variants.
 * These assertions protect the exact behavior usabl will scan in the demo.
 */
import { useRef, useState } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Variant } from '../lib/variant'
import { DemoModal } from './DemoModal'

interface HarnessProps {
  variant: Variant
}

function Harness({ variant }: HarnessProps) {
  const [isOpen, setIsOpen] = useState(false)
  const triggerEl = useRef<HTMLButtonElement>(null)

  return (
    <>
      <button type="button" ref={triggerEl} aria-haspopup="dialog" onClick={() => setIsOpen(true)}>
        View cluster details
      </button>
      <DemoModal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        triggerEl={triggerEl.current}
        variant={variant}
      />
    </>
  )
}

describe('DemoModal focus return variants', () => {
  it('broken variant does not return focus to trigger after close', async () => {
    const user = userEvent.setup()
    render(<Harness variant="broken" />)

    const trigger = screen.getByRole('button', { name: 'View cluster details' })
    await user.click(trigger)
    const closeButtons = await screen.findAllByRole('button', { name: 'Close' })
    await user.click(closeButtons[closeButtons.length - 1])

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    await waitFor(() => {
      expect(document.activeElement).not.toBe(trigger)
    })
  })

  it('fixed variant returns focus to trigger after close', async () => {
    const user = userEvent.setup()
    render(<Harness variant="fixed" />)

    const trigger = screen.getByRole('button', { name: 'View cluster details' })
    await user.click(trigger)
    const closeButtons = await screen.findAllByRole('button', { name: 'Close' })
    await user.click(closeButtons[closeButtons.length - 1])

    await waitFor(() => {
      expect(document.activeElement).toBe(trigger)
    })
  })
})
