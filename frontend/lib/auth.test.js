import { clearToken, getCurrentUserId, getToken, setToken } from './auth'

// Simule localStorage dans l'environnement de test
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

beforeEach(() => {
  localStorageMock.clear()
})

describe('getToken', () => {
  it('retourne null si rien en localStorage', () => {
    expect(getToken()).toBeNull()
  })

  it('retourne le token stocké', () => {
    localStorage.setItem('rowing_token', 'abc')
    expect(getToken()).toBe('abc')
  })
})

describe('setToken', () => {
  it('écrit le token en localStorage', () => {
    setToken('mon-token')
    expect(localStorage.getItem('rowing_token')).toBe('mon-token')
  })
})

describe('clearToken', () => {
  it('supprime le token du localStorage', () => {
    setToken('mon-token')
    clearToken()
    expect(getToken()).toBeNull()
  })
})

describe('getCurrentUserId', () => {
  it('retourne null si aucun token', () => {
    expect(getCurrentUserId()).toBeNull()
  })

  it('décode correctement le sub du payload JWT', () => {
    // Construit un JWT factice : header.payload.signature
    const payload = btoa(JSON.stringify({ sub: 'user-001', exp: 9999999999 }))
    const fakeToken = `header.${payload}.signature`
    setToken(fakeToken)
    expect(getCurrentUserId()).toBe('user-001')
  })

  it('retourne null si le token est malformé', () => {
    setToken('token-invalide')
    expect(getCurrentUserId()).toBeNull()
  })
})
