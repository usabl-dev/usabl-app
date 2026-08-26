import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

function renderRoute(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  )
}

describe('application shell', () => {
  it('presents the deployment workflow and separate demo controls', () => {
    renderRoute('/deployments?scenario=row-actions&preview=current')

    expect(screen.getByRole('heading', { level: 1, name: 'Deployments' })).toBeVisible()
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeVisible()
    expect(screen.getByRole('complementary', { name: 'Demo controls' })).toBeVisible()
    expect(screen.getByRole('region', { name: 'Deployments table' })).toBeVisible()
    expect(screen.getByRole('heading', { level: 2, name: 'Deployment row actions' })).toBeVisible()
  })

  it('keeps the clean control route explicit and reachable', () => {
    renderRoute('/settings')

    expect(screen.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible()
    expect(screen.getByRole('status')).toHaveTextContent('No intentional accessibility barrier')
  })

  it('applies deployment filters to the workflow table', async () => {
    const user = userEvent.setup()
    renderRoute('/deployments')

    await user.type(screen.getByLabelText('Search deployments'), 'console')
    await user.click(screen.getByRole('button', { name: 'Apply filters' }))

    expect(screen.getByRole('rowheader', { name: 'console-web' })).toBeVisible()
    expect(screen.queryByRole('rowheader', { name: 'inventory-api' })).not.toBeInTheDocument()
    expect(screen.getByText('1 deployments shown')).toBeVisible()
  })
})
