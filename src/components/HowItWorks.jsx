export default function HowItWorks({ onClose }) {
  return (
    <div className="how-it-works-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="how-it-works-title">
      <div className="how-it-works-modal" onClick={(e) => e.stopPropagation()}>
        <div className="how-it-works-header">
          <h2 id="how-it-works-title">How it works</h2>
          <button type="button" className="how-it-works-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="how-it-works-body">
          <p className="how-it-works-tagline">
            We built learning for places where the internet doesn’t.
          </p>
          <ul className="how-it-works-list">
            <li>
              <strong>Offline-first</strong> — Download packets and learn with no connection. Everything you need is on your device.
            </li>
            <li>
              <strong>Content tiers</strong> — Pick text-only, text + images, or full (audio/video) so it works on slow or limited networks.
            </li>
            <li>
              <strong>Sync when you can</strong> — Progress is saved locally. Use “Sync now” when you have any network to upload results.
            </li>
            <li>
              <strong>Sync-by, not submit-by</strong> — In School mode, assignments have a “sync by” date. You can work offline for days and sync before the date.
            </li>
          </ul>
          <p className="how-it-works-footer">
            Study mode = learn at your pace. School mode = same experience, with assignments and deadlines.
          </p>
        </div>
      </div>
    </div>
  )
}
