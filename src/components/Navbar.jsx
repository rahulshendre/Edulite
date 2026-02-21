import LanguageSelect from './LanguageSelect'

export default function Navbar({ onHome, onHowItWorks, onProfile, onLogout, showProfile, locale, onLocaleChange }) {
  return (
    <nav className="navbar">
      <button type="button" className="navbar-brand" onClick={onHome}>
        <img src="/graduation-cap-icon.svg" alt="" className="navbar-brand-icon" aria-hidden />
        EduLite
      </button>
      <div className="navbar-links">
        <button type="button" className="navbar-link" onClick={onHowItWorks}>
          How it works
        </button>
        {locale != null && onLocaleChange && (
          <LanguageSelect value={locale} onChange={onLocaleChange} className="navbar-lang" />
        )}
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
