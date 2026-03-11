const TOKEN_KEY = 'rowing_token'

export function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

/**
 * Décode le payload du JWT et retourne le champ `sub` (id de l'utilisateur).
 * Ne vérifie pas la signature — à usage frontend uniquement.
 */
export function getCurrentUserId() {
  const token = getToken()
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.sub ?? null
  } catch {
    return null
  }
}
