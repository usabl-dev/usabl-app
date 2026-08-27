import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { CURRENT_SOURCE_LABEL, CURRENT_SOURCE_MODE } from '../demo/scenarios'
import { DemoControls } from './DemoControls'

function LocationProbe() {
  const location = useLocation()
  return <output aria-label="Current location">{`${location.pathname}${location.search}`}</output>
}

describe('DemoControls', () => {
  it('moves between real scenario routes while preserving the teaching preview', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/deployments?scenario=deployment-workflow&preview=broken']}>
        <DemoControls />
        <Routes>
          <Route path="*" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    )

    await user.selectOptions(screen.getByLabelText('Scenario'), 'cluster-dialog')

    expect(screen.getByLabelText('Current location')).toHaveTextContent(
      '/clusters?scenario=cluster-dialog&preview=broken',
    )
  })

  it('shows tracked source state and separates previews from proof', () => {
    render(
      <MemoryRouter>
        <DemoControls />
      </MemoryRouter>,
    )

    expect(screen.getByText(/Tracked source:/i).parentElement).toHaveTextContent(
      CURRENT_SOURCE_MODE + ' (' + CURRENT_SOURCE_LABEL + ')',
    )
    expect(screen.getByText(/usabl verifies source changes, not this preview/i)).toBeVisible()
  })
})
