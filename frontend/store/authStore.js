import { create } from 'zustand'
import { clearToken, setToken } from '../lib/auth'

const useAuthStore = create((set) => ({
  token: null,
  currentUser: null,

  setAuth: (token, user) => {
    setToken(token)
    set({ token, currentUser: user })
  },

  logout: () => {
    clearToken()
    set({ token: null, currentUser: null })
    window.location.href = '/login'
  },
}))

export default useAuthStore
