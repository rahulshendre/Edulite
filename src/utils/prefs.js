const DEFAULT_TIER_KEY = 'learningPackets_defaultTier'

export function getDefaultTier() {
  try {
    const t = localStorage.getItem(DEFAULT_TIER_KEY)
    if (t === 'textOnly' || t === 'textAndImages' || t === 'full') return t
    return null
  } catch {
    return null
  }
}

export function setDefaultTier(tierId) {
  localStorage.setItem(DEFAULT_TIER_KEY, tierId)
}

export function clearDefaultTier() {
  localStorage.removeItem(DEFAULT_TIER_KEY)
}
