import { log, logError } from './debug'
import { getPacket, getTranslation, saveTranslation } from '../db'
import { SOURCE_LOCALE } from '../constants/locales'

const KEY = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_RAPIDAPI_KEY : ''
const HOST = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_RAPIDAPI_TRANSLATE_HOST : 'google-translate113.p.rapidapi.com'
const PATH = (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_RAPIDAPI_TRANSLATE_PATH : '') || '/api/v1/translator/json'

const TRANSLATE_URL = `https://${HOST}${PATH.startsWith('/') ? PATH : `/${PATH}`}`

function isConfigured() {
  return !!KEY && typeof fetch !== 'undefined'
}

/** Parse API response trans: array or object with numeric keys -> string[] */
function parseTrans(data) {
  const t = data?.trans
  if (!t) return []
  if (Array.isArray(t)) return t
  const keys = Object.keys(t).filter((k) => /^\d+$/.test(k)).sort((a, b) => Number(a) - Number(b))
  return keys.map((k) => t[k])
}

/**
 * Batch translate via /api/v1/translator/json. Body: { from, to, json: string[] }. Response: { trans: [...] or { "0": ..., "1": ... } }
 */
async function translateBatch(texts, targetLang, sourceLang = SOURCE_LOCALE) {
  if (!texts?.length || targetLang === sourceLang) return texts
  if (!isConfigured()) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('EduLite: Translation skipped. Add VITE_RAPIDAPI_KEY (and optionally VITE_RAPIDAPI_TRANSLATE_HOST) to .env — see .env.example')
    }
    log('translate: no API key, returning originals')
    return texts
  }
  const trimmed = texts.map((s) => (typeof s === 'string' ? s.trim() : ''))
  if (trimmed.every((s) => !s)) return texts
  try {
    const body = {
      from: sourceLang,
      to: targetLang,
      json: trimmed,
    }
    const res = await fetch(TRANSLATE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': KEY,
        'X-RapidAPI-Host': HOST,
      },
      body: JSON.stringify(body),
    })
    const rawText = await res.text()
    if (!res.ok) {
      logError('translate: API error', res.status, rawText)
      if (res.status === 404 && typeof console !== 'undefined' && console.warn) {
        console.warn(
          'EduLite: Translation API returned 404. Set VITE_RAPIDAPI_TRANSLATE_PATH=/api/v1/translator/json in .env, then restart the dev server.'
        )
      }
      return texts
    }
    let data
    try {
      data = JSON.parse(rawText)
    } catch {
      logError('translate: invalid JSON response', rawText?.slice(0, 200))
      return texts
    }
    const results = parseTrans(data)
    if (results.length !== trimmed.length) {
      logError('translate: trans length mismatch', { expected: trimmed.length, got: results.length })
      return texts
    }
    return results.map((r, i) => (typeof r === 'string' ? r : texts[i]))
  } catch (e) {
    logError('translate: request failed', e)
    return texts
  }
}

/**
 * Translate a single string. Uses batch endpoint with one item.
 */
export async function translateText(text, targetLang, sourceLang = SOURCE_LOCALE) {
  if (!text || typeof text !== 'string' || !String(text).trim()) return text
  if (targetLang === sourceLang) return text
  const [result] = await translateBatch([text], targetLang, sourceLang)
  return result ?? text
}

/**
 * Collect all user-visible strings from a packet in order, then map translated results back.
 */
function collectPacketStrings(packet) {
  const list = []
  const push = (s) => list.push(s || '')
  if (packet.title) push(packet.title)
  if (packet.content?.text) push(packet.content.text)
  if (Array.isArray(packet.practice)) {
    for (const q of packet.practice) {
      push(q.question)
      if (Array.isArray(q.options)) for (const o of q.options) push(o)
    }
  }
  if (Array.isArray(packet.assessment)) {
    for (const q of packet.assessment) {
      push(q.question)
      if (Array.isArray(q.options)) for (const o of q.options) push(o)
    }
  }
  return list
}

/**
 * Translate all user-visible text in a packet. One batch API call.
 */
export async function translatePacket(packet, targetLang, sourceLang = SOURCE_LOCALE) {
  if (!packet || targetLang === sourceLang) return packet
  const strings = collectPacketStrings(packet)
  if (strings.length === 0) return packet
  const translated = await translateBatch(strings, targetLang, sourceLang)
  let i = 0
  const next = () => (translated[i] != null ? translated[i++] : '')
  const out = { ...packet }
  if (packet.title) out.title = next()
  if (packet.content) {
    out.content = { ...packet.content }
    if (packet.content.text) out.content.text = next()
  }
  if (Array.isArray(packet.practice)) {
    out.practice = packet.practice.map((q) => {
      const tq = { ...q }
      tq.question = next()
      if (Array.isArray(q.options)) tq.options = q.options.map(() => next())
      return tq
    })
  }
  if (Array.isArray(packet.assessment)) {
    out.assessment = packet.assessment.map((q) => {
      const tq = { ...q }
      tq.question = next()
      if (Array.isArray(q.options)) tq.options = q.options.map(() => next())
      return tq
    })
  }
  return out
}

/**
 * Get packet in the requested locale. Uses cache; translates and caches when online and API configured.
 */
export async function getPacketInLocale(packetId, locale) {
  const packet = await getPacket(packetId)
  if (!packet) return null
  if (locale === SOURCE_LOCALE) return packet

  const cached = await getTranslation(locale, packetId)
  if (cached?.packet) {
    log('translate: cache hit', { locale, packetId })
    return cached.packet
  }

  if (!isConfigured()) {
    log('translate: no API, returning source packet')
    return packet
  }

  try {
    const translated = await translatePacket(packet, locale, SOURCE_LOCALE)
    await saveTranslation(locale, packetId, translated)
    log('translate: translated and cached', { locale, packetId })
    return translated
  } catch (e) {
    logError('translate: translate failed', e)
    return packet
  }
}

export function isTranslationConfigured() {
  return isConfigured()
}
