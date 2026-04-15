import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NewSessionForm from './NewSessionForm'

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

jest.mock('../../lib/auth', () => ({
  getCurrentUserId: jest.fn(() => 'user-001'),
}))

jest.mock('../../lib/mocks', () => ({
  mockAvailableBoats: [
    { id: 'boat-001', name: "L'Albatros", type: 'double' },
    { id: 'boat-002', name: 'Le Triton', type: 'skiff' },
  ],
  mockMembers: [
    { id: 'user-001', firstName: 'Marc', lastName: 'Dupont' },
    { id: 'user-002', firstName: 'Sophie', lastName: 'Martin' },
  ],
}))

// ─── Tests ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks()
})

describe('NewSessionForm — rendu', () => {
  it('affiche tous les champs', () => {
    render(<NewSessionForm />)
    expect(screen.getByLabelText('Bateau')).toBeInTheDocument()
    expect(screen.getByLabelText('Heure de départ')).toBeInTheDocument()
    expect(screen.getByLabelText('Distance prévue (km)')).toBeInTheDocument()
    expect(screen.getByLabelText(/parcours/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/équipage/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/remarques/i)).toBeInTheDocument()
  })

  it('affiche les bateaux disponibles', () => {
    render(<NewSessionForm />)
    expect(screen.getByText("L'Albatros (double)")).toBeInTheDocument()
    expect(screen.getByText('Le Triton (skiff)')).toBeInTheDocument()
  })
})

describe('NewSessionForm — validation', () => {
  it('affiche une erreur si aucun bateau sélectionné', async () => {
    render(<NewSessionForm />)
    await userEvent.click(screen.getByRole('button', { name: /démarrer/i }))
    await waitFor(() => {
      expect(screen.getByText('Choisissez un bateau')).toBeInTheDocument()
    })
  })

  it('affiche une erreur si la distance est manquante', async () => {
    render(<NewSessionForm />)
    const user = userEvent.setup()
    await user.selectOptions(screen.getByLabelText('Bateau'), 'boat-001')
    await user.click(screen.getByRole('button', { name: /démarrer/i }))
    await waitFor(() => {
      expect(screen.getByText('Entrez une distance valide')).toBeInTheDocument()
    })
  })

  it('affiche une erreur si la distance est négative', async () => {
    render(<NewSessionForm />)
    const user = userEvent.setup()
    await user.selectOptions(screen.getByLabelText('Bateau'), 'boat-001')
    await user.clear(screen.getByLabelText('Distance prévue (km)'))
    await user.type(screen.getByLabelText('Distance prévue (km)'), '-5')
    await user.click(screen.getByRole('button', { name: /démarrer/i }))
    await waitFor(() => {
      expect(screen.getByText('La distance doit être supérieure à 0')).toBeInTheDocument()
    })
  })
})

describe('NewSessionForm — soumission réussie', () => {
  it('redirige vers /dashboard après soumission valide', async () => {
    render(<NewSessionForm />)
    const user = userEvent.setup()

    await user.selectOptions(screen.getByLabelText('Bateau'), 'boat-001')
    await user.clear(screen.getByLabelText('Distance prévue (km)'))
    await user.type(screen.getByLabelText('Distance prévue (km)'), '10')

    await user.click(screen.getByRole('button', { name: /démarrer/i }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })
})
