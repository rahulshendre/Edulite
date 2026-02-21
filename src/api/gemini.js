import { GoogleGenAI } from '@google/genai'
import { log, logError } from '../utils/debug'

const KEY = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_GEMINI_API_KEY : ''

function isConfigured() {
  return !!KEY
}

/**
 * Ask Gemini a question. Optional context (e.g. current lesson) and locale for response language.
 * @param {string} prompt - User question
 * @param {{ context?: string, locale?: string }} options - context = e.g. "Current lesson: ...", locale = e.g. "hi" for Hindi
 * @returns {Promise<string>} - Model response text or error message
 */
export async function askGemini(prompt, options = {}) {
  if (!prompt || !String(prompt).trim()) return ''
  if (!isConfigured()) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('EduLite: Ask AI requires VITE_GEMINI_API_KEY in .env')
    }
    return 'Ask AI is not configured. Add VITE_GEMINI_API_KEY to .env and restart.'
  }
  try {
    const ai = new GoogleGenAI({ apiKey: KEY })
    const parts = []
    if (options.context) {
      parts.push(`Context (current lesson or topic):\n${options.context}\n\n`)
    }
    if (options.locale && options.locale !== 'en') {
      parts.push(`Respond in the user's language (locale: ${options.locale}).\n\n`)
    }
    parts.push(`User question: ${prompt.trim()}`)
    const fullPrompt = parts.join('')
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
    })
    const text = response?.text
    if (text) return text
    logError('gemini: no text in response', response)
    return 'No response from the assistant.'
  } catch (e) {
    logError('gemini: request failed', e)
    return e?.message ? `Error: ${e.message}` : 'Something went wrong. Try again.'
  }
}

export function isGeminiConfigured() {
  return isConfigured()
}
