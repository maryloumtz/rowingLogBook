import { clearToken, getToken } from './auth'

const BASE_URL = '/api'

async function request(path, options = {}) {
  const token = getToken()

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    clearToken()
    window.location.href = '/login'
    return
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erreur réseau' }))
    throw new Error(error.message ?? `Erreur ${response.status}`)
  }

  // 204 No Content
  if (response.status === 204) return null

  return response.json()
}

export function apiGet(path) {
  return request(path, { method: 'GET' })
}

export function apiPost(path, body) {
  return request(path, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function apiPatch(path, body) {
  return request(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}
