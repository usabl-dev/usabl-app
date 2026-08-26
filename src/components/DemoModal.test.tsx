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
        triggerRef={triggerEl}
        variant={variant}
      />
    </>
  )
}

describe('DemoModal focus return variants', () => {
  it('broken variant leaves focus on trigger when trap is disabled', async () => {
    const user = userEvent.setup()
    render(<Harness variant="broken" />)

    const trigger = screen.getByRole('button', { name: 'View cluster details' })
    await user.click(trigger)
    await screen.findByRole('dialog')
    expect(document.activeElement).toBe(trigger)
    await user.keyboard('{Escape}')

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    expect(document.activeElement).toBe(trigger)
  })

  it('fixed variant traps focus then returns it after Escape close', async () => {
    const user = userEvent.setup()
    render(<Harness variant="fixed" />)

    const trigger = screen.getByRole('button', { name: 'View cluster details' })
    await user.click(trigger)
    await screen.findByRole('dialog')
    expect(document.activeElement).not.toBe(trigger)
    await user.keyboard('{Escape}')

    await waitFor(() => {
      expect(document.activeElement).toBe(trigger)
    })
  })
})
