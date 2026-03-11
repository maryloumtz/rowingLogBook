import { render, screen, waitFor } from '@testing-library/react'
import DashboardPage from './page'

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }) => <a href={href} {...props}>{children}</a>,
}))

jest.mock('../../../lib/auth', () => ({
  getCurrentUserId: jest.fn(() => 'user-001'),
}))

jest.mock('../../../lib/mocks', () => {
  const now = Date.now()
  return {
    mockSessions: [
      {
        id: 'session-001',
        boatId: 'boat-001',
        responsibleId: 'user-001',
        departureTime: new Date(now - 70 * 60 * 1000).toISOString(),
        status: 'IN_PROGRESS',
      },
    ],
    mockBoats: [{ id: 'boat-001', name: "L'Albatros" }],
    mockMembers: [{ id: 'user-001', firstName: 'Marc', lastName: 'Dupont' }],
  }
})

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('DashboardPage', () => {
  it('affiche le titre', async () => {
    render(<DashboardPage />)
    expect(screen.getByText('Sorties en cours')).toBeInTheDocument()
  })

  it('affiche les sessions après chargement', async () => {
    render(<DashboardPage />)
    await waitFor(() => {
      expect(screen.getByText("L'Albatros")).toBeInTheDocument()
    })
  })

  it('affiche le bouton Nouvelle sortie', async () => {
    render(<DashboardPage />)
    const link = screen.getByRole('link', { name: /nouvelle sortie/i })
    expect(link).toHaveAttribute('href', '/sessions/new')
  })

  it('affiche un message si aucune sortie', async () => {
    // Override mock pour ce test seulement
    const { mockSessions } = require('../../../lib/mocks')
    mockSessions.length = 0

    render(<DashboardPage />)
    await waitFor(() => {
      expect(screen.getByText('Aucune sortie en cours.')).toBeInTheDocument()
    })

    // Restaure
    mockSessions.push({
      id: 'session-001',
      boatId: 'boat-001',
      responsibleId: 'user-001',
      departureTime: new Date(Date.now() - 70 * 60 * 1000).toISOString(),
      status: 'IN_PROGRESS',
    })
  })
})
