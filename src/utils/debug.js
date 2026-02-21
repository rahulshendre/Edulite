/**
 * Debug logging: on in dev (Vite), or when ?debug=1 in the URL (e.g. on Vercel).
 * Use log() for verbose flow; logError() always runs so errors are visible in prod if needed.
 */
const DEBUG =
  typeof import.meta !== 'undefined' && import.meta.env?.DEV === true ||
  (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1')

if (DEBUG && typeof console !== 'undefined') {
  console.log('[LP] Debug logging enabled (dev or ?debug=1). Open DevTools → Console to see flow.')
}

export function log(...args) {
  if (DEBUG) console.log('[LP]', ...args)
}

export function logError(...args) {
  console.error('[LP]', ...args)
}

export { DEBUG }
