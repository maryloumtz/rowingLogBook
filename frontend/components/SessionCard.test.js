import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SessionCard from './SessionCard'
import { WARN_THRESHOLD_MS } from '../lib/constants'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

jest.mock('../lib/auth', () => ({
  getCurrentUserId: jest.fn(),
}))

import { getCurrentUserId } from '../lib/auth'

function makeSession({ minsAgo = 10, responsibleId = 'user-001' } = {}) {
  return {
    id: 'session-001',
    boatName: "L'Albatros",
    createdById: responsibleId,
    createdByName: 'Marc Dupont',
    startTime: new Date(Date.now() - minsAgo * 60 * 1000).toISOString(),
    status: 'OPEN',
  }
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('SessionCard - rendu de base', () => {
  it('affiche le nom du bateau et le responsable', () => {
    getCurrentUserId.mockReturnValue('user-001')
    render(<SessionCard session={makeSession()} />)

    expect(screen.getByText("L'Albatros")).toBeInTheDocument()
    expect(screen.getByText('Marc Dupont')).toBeInTheDocument()
  })

  it('affiche la duree ecoulee', () => {
    getCurrentUserId.mockReturnValue('user-001')
    render(<SessionCard session={makeSession({ minsAgo: 70 })} />)

    expect(screen.getByText('1h10')).toBeInTheDocument()
  })
})

describe('SessionCard - avertissement duree', () => {
  it("n'affiche pas l alerte si la duree est inferieure au seuil", () => {
    getCurrentUserId.mockReturnValue('other')
    render(<SessionCard session={makeSession({ minsAgo: 60 })} />)

    expect(screen.queryByLabelText('Avertissement durée dépassée')).not.toBeInTheDocument()
  })

  it("affiche l icone d alerte si la duree depasse le seuil", () => {
    getCurrentUserId.mockReturnValue('other')
    const minsAgo = Math.ceil(WARN_THRESHOLD_MS / 60000) + 5
    render(<SessionCard session={makeSession({ minsAgo })} />)

    expect(screen.getByLabelText('Avertissement durée dépassée')).toBeInTheDocument()
  })
})

describe('SessionCard - navigation', () => {
  it('redirige vers /sessions/:id/close si l utilisateur est le responsable', async () => {
    getCurrentUserId.mockReturnValue('user-001')
    render(<SessionCard session={makeSession()} />)

    await userEvent.click(screen.getByRole('article'))
    expect(mockPush).toHaveBeenCalledWith('/sessions/session-001/close')
  })

  it("ne redirige pas si l utilisateur n est pas le responsable", async () => {
    getCurrentUserId.mockReturnValue('user-002')
    render(<SessionCard session={makeSession({ responsibleId: 'user-001' })} />)

    await userEvent.click(screen.getByRole('article'))
    expect(mockPush).not.toHaveBeenCalled()
  })
})
