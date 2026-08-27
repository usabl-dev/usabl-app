import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Deployments } from './Deployments'

function renderDeployments(search = '?scenario=deployment-workflow&preview=current') {
  return render(
    <MemoryRouter initialEntries={[`/deployments${search}`]}>
      <Deployments />
    </MemoryRouter>,
  )
}

describe('Deployments accessibility scenarios', () => {
  it('shows the intentional barriers in the broken preview', async () => {
    const user = userEvent.setup()
    const { container } = renderDeployments('?scenario=deployment-workflow&preview=broken')

    expect(screen.getAllByRole('button', { name: 'View details' })).toHaveLength(3)

    const menuToggle = screen.getByRole('button', { name: 'Actions for policy-worker' })
    expect(menuToggle).not.toHaveAttribute('aria-expanded')
    await user.click(menuToggle)
    expect(document.activeElement).toBe(menuToggle)

    await user.click(screen.getByRole('button', { name: 'Start deployment' }))
    const alert = screen.getByRole('alert')
    expect(alert.closest('[aria-live], [role="status"]')).toBeNull()

    const toolbars = Array.from(container.querySelectorAll('.pf-v6-c-toolbar'))
    expect(toolbars).toHaveLength(2)
    expect(toolbars.every((toolbar) => !toolbar.hasAttribute('aria-label'))).toBe(true)

    expect(screen.getByTestId('clear-filters')).not.toHaveAccessibleName()
  })

  it('repairs names, state, focus, announcements, and toolbar labels in the repaired preview', async () => {
    const user = userEvent.setup()
    const { container } = renderDeployments('?scenario=deployment-workflow&preview=repaired')

    expect(screen.getByRole('button', { name: 'View inventory-api details' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'View policy-worker details' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'View console-web details' })).toBeVisible()

    const menuToggle = screen.getByRole('button', { name: 'Actions for policy-worker' })
    expect(menuToggle).toHaveAttribute('aria-expanded', 'false')
    await user.click(menuToggle)
    expect(menuToggle).toHaveAttribute('aria-expanded', 'true')
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Restart deployment' }))

    await user.click(screen.getByRole('button', { name: 'Start deployment' }))
    const status = screen.getByRole('status')
    expect(within(status).getByRole('alert')).toHaveTextContent('Deployment started')

    const toolbars = Array.from(container.querySelectorAll('.pf-v6-c-toolbar'))
    expect(toolbars.map((toolbar) => toolbar.getAttribute('aria-label'))).toEqual([
      'Deployment filters',
      'Deployment actions',
    ])

    expect(screen.getByRole('button', { name: 'Clear filters' })).toBeVisible()
  })
})
