import { log } from './debug'

const STORAGE_KEY = 'learningPackets_user'

/**
 * Get stored user from localStorage. Returns null if not set or invalid.
 */
export function getStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (data && data.name && data.loggedIn) return data
    return null
  } catch {
    return null
  }
}

/**
 * Save user locally and mark as logged in.
 * @param {{ name: string, studentId?: string }} user
 */
export function login(user) {
  const data = { ...user, loggedIn: true }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  log('auth: login', { name: user.name, hasStudentId: !!user.studentId })
}

/**
 * Clear stored user (logout).
 */
export function logout() {
  localStorage.removeItem(STORAGE_KEY)
  log('auth: logout')
}
