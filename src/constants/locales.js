/**
 * Source language for all packet content.
 */
export const SOURCE_LOCALE = 'en'

/**
 * All 22 scheduled Indian languages + English (code, label).
 * Order: English first, then alphabetical by label.
 */
export const INDIAN_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'as', label: 'Assamese' },
  { code: 'bn', label: 'Bengali' },
  { code: 'brx', label: 'Bodo' },
  { code: 'doi', label: 'Dogri' },
  { code: 'gu', label: 'Gujarati' },
  { code: 'hi', label: 'Hindi' },
  { code: 'kn', label: 'Kannada' },
  { code: 'ks', label: 'Kashmiri' },
  { code: 'kok', label: 'Konkani' },
  { code: 'mai', label: 'Maithili' },
  { code: 'ml', label: 'Malayalam' },
  { code: 'mni', label: 'Manipuri' },
  { code: 'mr', label: 'Marathi' },
  { code: 'ne', label: 'Nepali' },
  { code: 'or', label: 'Odia' },
  { code: 'pa', label: 'Punjabi' },
  { code: 'sa', label: 'Sanskrit' },
  { code: 'sat', label: 'Santali' },
  { code: 'sd', label: 'Sindhi' },
  { code: 'ta', label: 'Tamil' },
  { code: 'te', label: 'Telugu' },
  { code: 'ur', label: 'Urdu' },
]

const LOCALE_STORAGE_KEY = 'edulite_locale'

/**
 * Map browser/device language to a supported locale.
 */
const BROWSER_TO_LOCALE = {
  hi: 'hi',
  'hi-in': 'hi',
  mr: 'mr',
  'mr-in': 'mr',
  ta: 'ta',
  'ta-in': 'ta',
  te: 'te',
  'te-in': 'te',
  bn: 'bn',
  'bn-in': 'bn',
  kn: 'kn',
  'kn-in': 'kn',
  ml: 'ml',
  'ml-in': 'ml',
  gu: 'gu',
  'gu-in': 'gu',
  as: 'as',
  'as-in': 'as',
  or: 'or',
  'or-in': 'or',
  pa: 'pa',
  'pa-in': 'pa',
  ur: 'ur',
  'ur-in': 'ur',
  en: 'en',
  'en-in': 'en',
  'en-us': 'en',
  'en-gb': 'en',
}

const CODES_SET = new Set(INDIAN_LANGUAGES.map((l) => l.code))

export function isValidLocale(code) {
  return CODES_SET.has(code)
}

export function getStoredLocale() {
  try {
    const s = localStorage.getItem(LOCALE_STORAGE_KEY)
    return s && isValidLocale(s) ? s : null
  } catch {
    return null
  }
}

export function setStoredLocale(code) {
  try {
    if (code && isValidLocale(code)) {
      localStorage.setItem(LOCALE_STORAGE_KEY, code)
    } else {
      localStorage.removeItem(LOCALE_STORAGE_KEY)
    }
  } catch {}
}

/**
 * Get preferred locale: user-selected (dropdown) first, else device language, else English.
 */
export function getPreferredLocale() {
  const stored = getStoredLocale()
  if (stored) return stored
  if (typeof navigator === 'undefined' || !navigator.language) return SOURCE_LOCALE
  const raw = navigator.language.toLowerCase()
  const primary = raw.split('-')[0]
  return BROWSER_TO_LOCALE[raw] ?? BROWSER_TO_LOCALE[primary] ?? SOURCE_LOCALE
}

/**
 * Locale to TTS lang (e.g. hi -> hi-IN for SpeechSynthesis).
 */
export function localeToTTSLang(locale) {
  if (locale === 'en') return 'en-IN'
  if (locale.length <= 3) return `${locale}-IN`
  return locale
}
