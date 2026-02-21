import { INDIAN_LANGUAGES } from '../constants/locales'

export default function LanguageSelect({ value, onChange, id = 'language-select', className = '' }) {
  return (
    <label className={`language-select-wrap ${className}`.trim()}>
      <span className="language-select-label">Language</span>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="language-select"
        aria-label="Select language"
      >
        {INDIAN_LANGUAGES.map(({ code, label }) => (
          <option key={code} value={code}>
            {label}
          </option>
        ))}
      </select>
    </label>
  )
}
