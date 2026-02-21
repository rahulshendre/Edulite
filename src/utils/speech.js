/**
 * Text-to-speech via Web Speech API (SpeechSynthesis).
 * Uses system voices; works offline where supported.
 */

export function isSupported() {
  return typeof window !== 'undefined' && !!window.speechSynthesis
}

export function stop() {
  if (isSupported()) {
    window.speechSynthesis.cancel()
  }
}

export function pause() {
  if (isSupported()) {
    window.speechSynthesis.pause()
  }
}

export function resume() {
  if (isSupported()) {
    window.speechSynthesis.resume()
  }
}

/**
 * Speak text. Call stop() to cancel (e.g. on step change or unmount).
 * Use pause() / resume() to pause and resume.
 * @param {string} text - Plain text to speak (no HTML).
 * @param {object} options - Optional: { rate?: number, pitch?: number, onEnd?: () => void }
 */
export function speak(text, options = {}) {
  if (!isSupported() || !text || !String(text).trim()) return
  stop()
  const u = new window.SpeechSynthesisUtterance(String(text).trim())
  u.rate = options.rate ?? 1
  u.pitch = options.pitch ?? 1
  if (options.lang) u.lang = options.lang
  if (typeof options.onEnd === 'function') u.onend = options.onEnd
  window.speechSynthesis.speak(u)
}
