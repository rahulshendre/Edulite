/**
 * Content mode tiers (2G / 3G / 4G style).
 * Each tier defines which content keys are loaded/shown.
 */
export const CONTENT_TIERS = {
  textOnly: {
    label: 'Text only',
    description: 'Best for slow connections (2G)',
    keys: ['text'],
  },
  textAndImages: {
    label: 'Text + images',
    description: 'Good for 3G',
    keys: ['text', 'image'],
  },
  full: {
    label: 'Full (text, images, audio, video)',
    description: 'Best experience, needs good connection (4G)',
    keys: ['text', 'image', 'audio', 'videoRef'],
  },
}

export const TIER_IDS = Object.keys(CONTENT_TIERS)
