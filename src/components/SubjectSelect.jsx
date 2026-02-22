import { useState, useEffect } from 'react'
import { log } from '../utils/debug'

const ASSIGNMENTS_JSON_URL = (typeof import.meta.env?.BASE_URL === 'string' ? import.meta.env.BASE_URL : '') + 'packets/assignments.json'

const SUBJECT_LABELS = {
  Math: 'Math',
  EVS: 'EVS',
  Geography: 'Geography',
  Science: 'Science',
  English: 'English',
}

export default function SubjectSelect({ onSelect, onBack }) {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(ASSIGNMENTS_JSON_URL)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!Array.isArray(data)) {
          setSubjects([])
          return
        }
        const unique = [...new Set(data.map((a) => a.subject).filter(Boolean))].sort()
        setSubjects(unique)
        log('SubjectSelect: loaded subjects', unique)
      })
      .catch(() => setSubjects([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">Loading subjects…</div>

  if (subjects.length === 0) {
    return (
      <section className="subject-select-screen">
        <h2>Choose a subject</h2>
        <p className="subject-select-empty">No subjects available. Assignments may not be loaded yet.</p>
        {onBack && (
          <button type="button" className="subject-back" onClick={onBack}>
            ← Back
          </button>
        )}
      </section>
    )
  }

  return (
    <section className="subject-select-screen">
      <h2>Choose a subject</h2>
      <p className="subject-select-intro">Select a subject to see your assigned packets.</p>
      <div className="subject-options">
        {subjects.map((subject) => (
          <button
            key={subject}
            type="button"
            className="subject-card"
            onClick={() => onSelect(subject)}
          >
            <span className="subject-label">{SUBJECT_LABELS[subject] ?? subject}</span>
          </button>
        ))}
      </div>
      {onBack && (
        <button type="button" className="subject-back" onClick={onBack}>
          ← Back
        </button>
      )}
    </section>
  )
}
