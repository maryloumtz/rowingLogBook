import { act, renderHook } from '@testing-library/react'
import useAuthStore from './authStore'

const localStorageMock = (() => {
  let store = {}
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = String(value) },
    removeItem: (key) => { delete store[key] },
    clear: () => { store = {} },
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

const mockUser = { id: 'user-001', firstName: 'Marc', lastName: 'Dupont' }

beforeEach(() => {
  localStorageMock.clear()
  // Remet le store à son état initial entre chaque test
  useAuthStore.setState({ token: null, currentUser: null })
})

describe('setAuth', () => {
  it('met à jour token et currentUser dans le store', () => {
    const { result } = renderHook(() => useAuthStore())

    act(() => {
      result.current.setAuth('mon-token', mockUser)
    })

    expect(result.current.token).toBe('mon-token')
    expect(result.current.currentUser).toEqual(mockUser)
  })

  it('écrit le token en localStorage', () => {
    const { result } = renderHook(() => useAuthStore())

    act(() => {
      result.current.setAuth('mon-token', mockUser)
    })

    expect(localStorage.getItem('rowing_token')).toBe('mon-token')
  })
})

describe('logout', () => {
  it('vide token et currentUser dans le store', () => {
    const { result } = renderHook(() => useAuthStore())

    act(() => {
      result.current.setAuth('mon-token', mockUser)
    })

    act(() => {
      result.current.logout()
    })

    expect(result.current.token).toBeNull()
    expect(result.current.currentUser).toBeNull()
  })

  it('supprime le token du localStorage', () => {
    const { result } = renderHook(() => useAuthStore())

    act(() => {
      result.current.setAuth('mon-token', mockUser)
    })

    act(() => {
      result.current.logout()
    })

    expect(localStorage.getItem('rowing_token')).toBeNull()
  })
})
