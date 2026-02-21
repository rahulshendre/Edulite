import { log } from './debug'

const STORAGE_KEY = 'edulite_user'

/**
 * Get stored user from localStorage. Returns null if not set or invalid.
 * Ensures a stable id exists for progress scoping (adds one if missing).
 */
export function getStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!data || !data.name || !data.loggedIn) return null
    if (!data.id) {
      data.id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `user-${Date.now()}-${Math.random().toString(36).slice(2)}`
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    }
    return data
  } catch {
    return null
  }
}

/**
 * Save user locally and mark as logged in.
 * @param {{ name: string, studentId?: string, id?: string }} user
 */
export function login(user) {
  const data = { ...user, loggedIn: true }
  if (!data.id) {
    data.id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `user-${Date.now()}-${Math.random().toString(36).slice(2)}`
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  log('auth: login', { name: user.name, hasStudentId: !!user.studentId, id: data.id })
}

/**
 * Clear stored user (logout).
 */
export function logout() {
  localStorage.removeItem(STORAGE_KEY)
  log('auth: logout')
}
