import { SAMPLE_SCHOOLS } from '../constants/schools'

export default function SchoolSelectScreen({ onSelect, onBack }) {
  return (
    <div className="login-screen">
      <div className="login-card path-choice-card">
        <button type="button" className="back path-choice-back" onClick={onBack} aria-label="Back">
          ← Back
        </button>
        <h1>Choose your school</h1>
        <p className="path-choice-prompt">Select the school you belong to.</p>
        <div className="path-choice-buttons">
          {SAMPLE_SCHOOLS.map((school) => (
            <button
              key={school.id}
              type="button"
              className="path-choice-btn"
              onClick={() => onSelect(school)}
            >
              <span className="path-choice-label">{school.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
