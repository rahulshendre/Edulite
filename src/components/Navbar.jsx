export default function Navbar({ onHome, onHowItWorks, onProfile, onLogout, showProfile }) {
  return (
    <nav className="navbar">
      <button type="button" className="navbar-brand" onClick={onHome}>
        Learning Packets
      </button>
      <div className="navbar-links">
        <button type="button" className="navbar-link" onClick={onHowItWorks}>
          How it works
        </button>
        <button
          type="button"
          className={`navbar-link ${showProfile ? 'active' : ''}`}
          onClick={onProfile}
          aria-current={showProfile ? 'page' : undefined}
        >
          Profile
        </button>
        <button type="button" className="navbar-link navbar-logout" onClick={onLogout}>
          Log out
        </button>
      </div>
    </nav>
  )
}
