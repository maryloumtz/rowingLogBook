import { render, screen, waitFor } from '@testing-library/react'
import DashboardPage from './page'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

jest.mock('../../../lib/auth', () => ({
  getCurrentUserId: jest.fn(() => 'user-001'),
  getToken: jest.fn(() => 'fake.token.signature'),
}))

jest.mock('../../../store/authStore', () => ({
  __esModule: true,
  default: (selector) => selector({ logout: jest.fn() }),
}))

const mockSessions = [
  {
    id: 'session-001',
    boatName: "L'Albatros",
    createdById: 'user-001',
    createdByName: 'Marc Dupont',
    startTime: new Date(Date.now() - 70 * 60 * 1000).toISOString(),
    status: 'OPEN',
  },
]

describe('DashboardPage', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockSessions,
    })
  })

  it('affiche le titre', async () => {
    render(<DashboardPage />)
    const headings = await screen.findAllByText('Sorties en cours')
    expect(headings[0]).toBeInTheDocument()
  })

  it('affiche les sessions apres chargement', async () => {
    render(<DashboardPage />)
    await waitFor(() => {
      expect(screen.getByText("L'Albatros")).toBeInTheDocument()
    })
  })

  it('affiche le bouton Nouvelle sortie', async () => {
    render(<DashboardPage />)
    await screen.findByText("L'Albatros")
    const link = screen.getByRole('link', { name: /nouvelle sortie/i })
    expect(link).toHaveAttribute('href', '/sessions/new')
  })

  it('affiche un message si aucune sortie', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    })

    render(<DashboardPage />)
    await waitFor(() => {
      expect(screen.getByText('Aucune sortie en cours.')).toBeInTheDocument()
    })
  })
})
