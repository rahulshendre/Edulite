import { CONTENT_TIERS } from '../constants/tiers'
import { getAllowedTierIds, getStrictCapability } from '../utils/capability'

export default function ContentModeScreen({ onSelect }) {
  const allowedTierIds = getAllowedTierIds()
  const { reason } = getStrictCapability()

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
              onClick={() => onSelect(tierId)}
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
