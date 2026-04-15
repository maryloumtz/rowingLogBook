import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from './page'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

const mockSetAuth = jest.fn()
jest.mock('../../../store/authStore', () => ({
  __esModule: true,
  default: (selector) => selector({ setAuth: mockSetAuth }),
}))

const successPayload = {
  token: 'fake.token.signature',
  user: {
    id: 'user-001',
    firstName: 'Marc',
    lastName: 'Dupont',
    email: 'marc.dupont@rowing.fr',
  },
}

async function fillAndSubmit(email, password) {
  const user = userEvent.setup()
  if (email) await user.type(screen.getByLabelText('Email'), email)
  if (password) await user.type(screen.getByLabelText('Mot de passe'), password)
  await user.click(screen.getByRole('button', { name: /se connecter/i }))
}

beforeEach(() => {
  jest.clearAllMocks()
  global.fetch = jest.fn()
})

describe('LoginPage - rendu', () => {
  it('affiche le formulaire de connexion', () => {
    render(<LoginPage />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument()
  })
})

describe('LoginPage - validation Zod', () => {
  it('affiche une erreur si l email est invalide', async () => {
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

describe('LoginPage - soumission reussie', () => {
  it('appelle setAuth et redirige vers /dashboard', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => successPayload,
    })

    render(<LoginPage />)
    await fillAndSubmit('marc.dupont@rowing.fr', 'password')

    await waitFor(() => {
      expect(mockSetAuth).toHaveBeenCalledWith(successPayload.token, successPayload.user)
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'marc.dupont@rowing.fr',
        password: 'password',
      }),
    })
    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })
})

describe('LoginPage - soumission echouee', () => {
  it('affiche un message d erreur si les credentials sont incorrects', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Email ou mot de passe incorrect' }),
    })

    render(<LoginPage />)
    await fillAndSubmit('marc.dupont@rowing.fr', 'mauvais-mdp')

    await waitFor(() => {
      expect(screen.getByText('Email ou mot de passe incorrect')).toBeInTheDocument()
    })

    expect(mockSetAuth).not.toHaveBeenCalled()
    expect(mockPush).not.toHaveBeenCalled()
  })
})
