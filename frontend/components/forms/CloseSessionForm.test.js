import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CloseSessionForm from './CloseSessionForm'

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

jest.mock('../../lib/api', () => ({
  apiPatch: jest.fn(),
}))

// ─── Fixtures ────────────────────────────────────────────────────────────────

const pastDeparture = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // -2h

const mockSession = {
  id: 'session-001',
  responsibleId: 'user-001',
  departureTime: pastDeparture,
  plannedDistanceKm: 12.5,
  status: 'IN_PROGRESS',
}

// ─── Tests ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks()
})

describe('CloseSessionForm — rendu', () => {
  it('affiche les champs du formulaire', () => {
    render(<CloseSessionForm session={mockSession} />)
    expect(screen.getByLabelText('Heure de retour')).toBeInTheDocument()
    expect(screen.getByLabelText('Distance réelle (km)')).toBeInTheDocument()
    expect(screen.getByLabelText(/remarques/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /clôturer/i })).toBeInTheDocument()
  })

  it('pré-remplit la distance avec plannedDistanceKm', () => {
    render(<CloseSessionForm session={mockSession} />)
    expect(screen.getByLabelText('Distance réelle (km)')).toHaveValue(12.5)
  })
})

describe('CloseSessionForm — validation', () => {
  it('affiche une erreur si returnTime est antérieure au départ', async () => {
    render(<CloseSessionForm session={mockSession} />)
    const user = userEvent.setup()

    // Heure antérieure au départ (-3h)
    const before = new Date(Date.now() - 3 * 60 * 60 * 1000)
    const pad = (n) => String(n).padStart(2, '0')
    const beforeStr =
      `${before.getFullYear()}-${pad(before.getMonth() + 1)}-${pad(before.getDate())}` +
      `T${pad(before.getHours())}:${pad(before.getMinutes())}`

    await user.clear(screen.getByLabelText('Heure de retour'))
    await user.type(screen.getByLabelText('Heure de retour'), beforeStr)
    await user.click(screen.getByRole('button', { name: /clôturer/i }))

    await waitFor(() => {
      expect(
        screen.getByText("L'heure de retour doit être postérieure au départ")
      ).toBeInTheDocument()
    })
  })

  it('affiche une erreur si la distance est manquante', async () => {
    render(<CloseSessionForm session={{ ...mockSession, plannedDistanceKm: null }} />)
    const user = userEvent.setup()

    await user.clear(screen.getByLabelText('Distance réelle (km)'))
    await user.click(screen.getByRole('button', { name: /clôturer/i }))

    await waitFor(() => {
      expect(screen.getByText('Entrez une distance valide')).toBeInTheDocument()
    })
  })
})

describe('CloseSessionForm — soumission réussie', () => {
  it('redirige vers /dashboard après soumission valide', async () => {
    render(<CloseSessionForm session={mockSession} />)
    await userEvent.click(screen.getByRole('button', { name: /clôturer/i }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })
})
