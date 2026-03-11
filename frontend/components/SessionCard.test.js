import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SessionCard from './SessionCard'
import { WARN_THRESHOLD_MS } from '../lib/constants'

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

jest.mock('../lib/auth', () => ({
  getCurrentUserId: jest.fn(),
}))

import { getCurrentUserId } from '../lib/auth'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const boat = { id: 'boat-001', name: "L'Albatros" }
const responsible = { id: 'user-001', firstName: 'Marc', lastName: 'Dupont' }

function makeSession({ minsAgo = 10, responsibleId = 'user-001' } = {}) {
  return {
    id: 'session-001',
    boatId: 'boat-001',
    responsibleId,
    departureTime: new Date(Date.now() - minsAgo * 60 * 1000).toISOString(),
    status: 'IN_PROGRESS',
  }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks()
})

describe('SessionCard — rendu de base', () => {
  it('affiche le nom du bateau et le responsable', () => {
    getCurrentUserId.mockReturnValue('user-001')
    render(<SessionCard session={makeSession()} boat={boat} responsible={responsible} />)

    expect(screen.getByText("L'Albatros")).toBeInTheDocument()
    expect(screen.getByText('Marc Dupont')).toBeInTheDocument()
  })

  it('affiche la durée écoulée', () => {
    getCurrentUserId.mockReturnValue('user-001')
    render(<SessionCard session={makeSession({ minsAgo: 70 })} boat={boat} responsible={responsible} />)

    expect(screen.getByText('1h10')).toBeInTheDocument()
  })
})

describe('SessionCard — avertissement durée', () => {
  it('n\'affiche pas l\'alerte si durée < 2h30', () => {
    getCurrentUserId.mockReturnValue('other')
    render(<SessionCard session={makeSession({ minsAgo: 60 })} boat={boat} responsible={responsible} />)

    expect(screen.queryByLabelText('Avertissement durée dépassée')).not.toBeInTheDocument()
  })

  it('affiche l\'icône d\'alerte si durée > 2h30', () => {
    getCurrentUserId.mockReturnValue('other')
    const minsAgo = Math.ceil(WARN_THRESHOLD_MS / 60000) + 5
    render(<SessionCard session={makeSession({ minsAgo })} boat={boat} responsible={responsible} />)

    expect(screen.getByLabelText('Avertissement durée dépassée')).toBeInTheDocument()
  })
})

describe('SessionCard — navigation', () => {
  it('redirige vers /sessions/:id/close si l\'utilisateur est le responsable', async () => {
    getCurrentUserId.mockReturnValue('user-001')
    render(<SessionCard session={makeSession()} boat={boat} responsible={responsible} />)

    await userEvent.click(screen.getByRole('article'))
    expect(mockPush).toHaveBeenCalledWith('/sessions/session-001/close')
  })

  it('ne redirige pas si l\'utilisateur n\'est pas le responsable', async () => {
    getCurrentUserId.mockReturnValue('user-002')
    render(<SessionCard session={makeSession({ responsibleId: 'user-001' })} boat={boat} responsible={responsible} />)

    await userEvent.click(screen.getByRole('article'))
    expect(mockPush).not.toHaveBeenCalled()
  })
})
