import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from './page'

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

const mockSetAuth = jest.fn()
jest.mock('../../../store/authStore', () => ({
  __esModule: true,
  default: (selector) => selector({ setAuth: mockSetAuth }),
}))

jest.mock('../../../lib/mocks', () => ({
  mockCurrentUser: {
    id: 'user-001',
    firstName: 'Marc',
    lastName: 'Dupont',
    email: 'marc.dupont@rowing.fr',
  },
  mockToken: 'fake.token.signature',
}))

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function fillAndSubmit(email, password) {
  const user = userEvent.setup()
  if (email) await user.type(screen.getByLabelText('Email'), email)
  if (password) await user.type(screen.getByLabelText('Mot de passe'), password)
  await user.click(screen.getByRole('button', { name: /se connecter/i }))
}

// ─── Tests ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks()
})

describe('LoginPage — rendu', () => {
  it('affiche le formulaire de connexion', () => {
    render(<LoginPage />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument()
  })
})

describe('LoginPage — validation Zod', () => {
  it('affiche une erreur si l\'email est invalide', async () => {
    render(<LoginPage />)
    await fillAndSubmit('pas-un-email', 'password')
    await waitFor(() => {
      expect(screen.getByText('Adresse email invalide')).toBeInTheDocument()
    })
  })

  it('affiche une erreur si le mot de passe est vide', async () => {
    render(<LoginPage />)
    await fillAndSubmit('test@test.fr', '')
    await waitFor(() => {
      expect(screen.getByText('Le mot de passe est requis')).toBeInTheDocument()
    })
  })
})

describe('LoginPage — soumission réussie', () => {
  it('appelle setAuth et redirige vers /dashboard avec les bonnes credentials mock', async () => {
    render(<LoginPage />)
    await fillAndSubmit('marc.dupont@rowing.fr', 'password')

    await waitFor(() => {
      expect(mockSetAuth).toHaveBeenCalledWith('fake.token.signature', {
        id: 'user-001',
        firstName: 'Marc',
        lastName: 'Dupont',
        email: 'marc.dupont@rowing.fr',
      })
    })

    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })
})

describe('LoginPage — soumission échouée', () => {
  it('affiche un message d\'erreur si les credentials sont incorrects', async () => {
    render(<LoginPage />)
    await fillAndSubmit('marc.dupont@rowing.fr', 'mauvais-mdp')

    await waitFor(() => {
      expect(screen.getByText('Email ou mot de passe incorrect')).toBeInTheDocument()
    })

    expect(mockSetAuth).not.toHaveBeenCalled()
    expect(mockPush).not.toHaveBeenCalled()
  })
})
