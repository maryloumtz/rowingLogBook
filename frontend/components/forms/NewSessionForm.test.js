import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NewSessionForm from './NewSessionForm'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

jest.mock('../../lib/auth', () => ({
  getToken: jest.fn(() => 'fake.token.signature'),
  getCurrentUserId: jest.fn(() => '1'),
}))

const mockBoats = [
  { id: '1', name: "L'Albatros", type: 'double', capacity: 2 },
  { id: '2', name: 'Le Triton', type: 'skiff', capacity: 1 },
]

const mockMembers = [
  { id: '1', firstName: 'Marc', lastName: 'Dupont' },
  { id: '2', firstName: 'Sophie', lastName: 'Martin' },
]

function mockJsonResponse(data, ok = true) {
  return {
    ok,
    json: async () => data,
  }
}

beforeEach(() => {
  jest.clearAllMocks()
  global.fetch = jest.fn((url, options = {}) => {
    if (url === '/api/boats') return Promise.resolve(mockJsonResponse(mockBoats))
    if (url === '/api/members') return Promise.resolve(mockJsonResponse(mockMembers))
    if (url === '/api/sessions' && options.method === 'POST') {
      return Promise.resolve(mockJsonResponse({ id: 'session-001' }))
    }
    return Promise.reject(new Error(`Unexpected fetch call: ${url}`))
  })
})

describe('NewSessionForm - rendu', () => {
  it('affiche tous les champs', async () => {
    render(<NewSessionForm />)

    expect(screen.getByLabelText('Bateau')).toBeInTheDocument()
    expect(screen.getByLabelText('Heure de départ')).toBeInTheDocument()
    expect(screen.getByLabelText('Distance prévue (km)')).toBeInTheDocument()
    expect(screen.getByLabelText(/parcours/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/équipage/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/remarques/i)).toBeInTheDocument()

    await screen.findByText("L'Albatros — double (cap. 2)")
  })

  it('affiche les bateaux disponibles', async () => {
    render(<NewSessionForm />)

    expect(await screen.findByText("L'Albatros — double (cap. 2)")).toBeInTheDocument()
    expect(screen.getByText('Le Triton — skiff (cap. 1)')).toBeInTheDocument()
  })
})

describe('NewSessionForm - validation', () => {
  it('affiche une erreur si aucun bateau selectionne', async () => {
    render(<NewSessionForm />)
    await screen.findByText("L'Albatros — double (cap. 2)")

    await userEvent.click(screen.getByRole('button', { name: /démarrer/i }))

    await waitFor(() => {
      expect(screen.getByText('Choisissez un bateau')).toBeInTheDocument()
    })
  })

  it('affiche une erreur si la distance est manquante', async () => {
    render(<NewSessionForm />)
    await screen.findByText("L'Albatros — double (cap. 2)")

    const user = userEvent.setup()
    await user.selectOptions(screen.getByLabelText('Bateau'), '1')
    await user.click(screen.getByRole('button', { name: /démarrer/i }))

    await waitFor(() => {
      expect(screen.getByText('Entrez une distance valide')).toBeInTheDocument()
    })
  })

  it('affiche une erreur si la distance est negative', async () => {
    render(<NewSessionForm />)
    await screen.findByText("L'Albatros — double (cap. 2)")

    const user = userEvent.setup()
    await user.selectOptions(screen.getByLabelText('Bateau'), '1')
    await user.clear(screen.getByLabelText('Distance prévue (km)'))
    await user.type(screen.getByLabelText('Distance prévue (km)'), '-5')
    await user.click(screen.getByRole('button', { name: /démarrer/i }))

    await waitFor(() => {
      expect(screen.getByText('La distance doit être supérieure à 0')).toBeInTheDocument()
    })
  })
})

describe('NewSessionForm - soumission reussie', () => {
  it('redirige vers /dashboard apres soumission valide', async () => {
    render(<NewSessionForm />)
    await screen.findByText("L'Albatros — double (cap. 2)")

    const user = userEvent.setup()
    await user.selectOptions(screen.getByLabelText('Bateau'), '1')
    await user.clear(screen.getByLabelText('Distance prévue (km)'))
    await user.type(screen.getByLabelText('Distance prévue (km)'), '10')
    await user.click(screen.getByRole('button', { name: /démarrer/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/sessions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer fake.token.signature',
          }),
        })
      )
    })

    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })
})
