/**
 * Strict capability check: network + device → max allowed content tier.
 * Only tiers that are safe for the current connection/device are offered.
 * URL override: ?cap=2g|3g|4g for testing (takes precedence).
 */

const TIER_ORDER = ['textOnly', 'textAndImages', 'full']

const CAP_TO_TIER = {
  '2g': { maxTier: 'textOnly', reason: 'Testing: 2G — text only.' },
  '3g': { maxTier: 'textAndImages', reason: 'Testing: 3G — text and images only.' },
  '4g': { maxTier: 'full', reason: 'Testing: 4G — full content allowed.' },
}

function tierIndex(tierId) {
  const i = TIER_ORDER.indexOf(tierId)
  return i >= 0 ? i : 0
}

function getUrlCapOverride() {
  if (typeof window === 'undefined' || !window.location?.search) return null
  const cap = new URLSearchParams(window.location.search).get('cap')
  if (!cap) return null
  const key = cap.toLowerCase()
  return CAP_TO_TIER[key] || null
}

/**
 * Returns the strict cap: recommended tier and max tier the user is allowed to pick.
 * @returns {{ maxTier: string, recommendedTier: string, reason: string }}
 */
export function getStrictCapability() {
  const override = getUrlCapOverride()
  if (override) {
    return {
      maxTier: override.maxTier,
      recommendedTier: override.maxTier,
      reason: override.reason,
    }
  }

  let maxTier = 'full'
  let reason = 'Connection unknown — full content allowed.'

  if (typeof navigator === 'undefined') {
    return { maxTier, recommendedTier: maxTier, reason }
  }

  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection

  if (conn) {
    if (conn.saveData) {
      maxTier = 'textOnly'
      reason = 'Data saver is on — text only.'
      return { maxTier, recommendedTier: maxTier, reason }
    }
    const effectiveType = (conn.effectiveType || '').toLowerCase()
    if (effectiveType === 'slow-2g' || effectiveType === '2g') {
      maxTier = 'textOnly'
      reason = 'Slow connection (2G) — text only.'
    } else if (effectiveType === '3g') {
      maxTier = 'textAndImages'
      reason = '3G connection — text and images only.'
    } else if (effectiveType === '4g') {
      maxTier = 'full'
      reason = 'Good connection (4G) — full content allowed.'
    }
  }

  if (typeof navigator.deviceMemory === 'number' && navigator.deviceMemory < 4 && tierIndex(maxTier) > 1) {
    maxTier = 'textAndImages'
    reason = 'Limited device memory — text and images only.'
  }

  return {
    maxTier,
    recommendedTier: maxTier,
    reason,
  }
}

/**
 * Returns tier ids that are allowed by the strict capability check.
 */
export function getAllowedTierIds() {
  const { maxTier } = getStrictCapability()
  const maxIndex = tierIndex(maxTier)
  return TIER_ORDER.filter((_, i) => i <= maxIndex)
}

/**
 * Returns the effective tier: the stricter of saved tier and current capability.
 * Use this when rendering content so we never load above current capability.
 */
export function getEffectiveTier(savedTier) {
  const { maxTier } = getStrictCapability()
  const savedIndex = tierIndex(savedTier)
  const maxIndex = tierIndex(maxTier)
  const effectiveIndex = Math.min(savedIndex, maxIndex)
  return TIER_ORDER[effectiveIndex]
}

/**
 * Cap a tier by a max tier (e.g. assignment maxTier). Returns the stricter of the two.
 */
export function capTierByMax(tier, maxTier) {
  if (!maxTier) return tier
  const i = TIER_ORDER.indexOf(tier)
  const j = TIER_ORDER.indexOf(maxTier)
  const idx = Math.min(i >= 0 ? i : 0, j >= 0 ? j : 0)
  return TIER_ORDER[idx]
}

/**
 * Tier ids allowed by capability, further limited by assignment maxTier when provided.
 */
export function getAllowedTierIdsWithMax(assignmentMaxTier) {
  const ids = getAllowedTierIds()
  if (!assignmentMaxTier) return ids
  const maxIdx = TIER_ORDER.indexOf(assignmentMaxTier)
  if (maxIdx < 0) return ids
  return ids.filter((id) => TIER_ORDER.indexOf(id) <= maxIdx)
}
