import { CONTENT_TIERS } from '../constants/tiers'
import { getAllowedTierIds, getStrictCapability } from '../utils/capability'
import { log } from '../utils/debug'

export default function ContentModeScreen({ onSelect }) {
  const allowedTierIds = getAllowedTierIds()
  const capability = getStrictCapability()
  const { reason } = capability
  log('ContentModeScreen: capability', { reason, maxTier: capability.maxTier, allowedTierIds })

  const handleSelect = (tierId) => {
    log('ContentModeScreen: tier selected', tierId)
    onSelect(tierId)
  }

  return (
    <section className="content-mode-screen">
      <h2>Content mode</h2>
      <p className="tier-capability">{reason}</p>
      <p className="tier-hint">Choose how much data to load. Only options safe for your connection are shown.</p>
      <div className="tier-options">
        {allowedTierIds.map((tierId) => {
          const t = CONTENT_TIERS[tierId]
          return (
            <button
              key={tierId}
              type="button"
              className="tier-card"
              onClick={() => handleSelect(tierId)}
            >
              <span className="tier-label">{t.label}</span>
              <span className="tier-desc">{t.description}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
