import { useState } from 'react'
import { login } from '../utils/auth'
import { signInTeacher } from '../api/schoolAuth'
import { isSupabaseConfigured } from '../lib/supabase'
import { log } from '../utils/debug'

const MOCK_TEACHER_ID = 'teacher1'
const MOCK_PASSWORD = 'pass'

export default function SchoolTeacherLogin({ school, onLogin, onBack }) {
  const [teacherId, setTeacherId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const trimmedId = teacherId.trim()
    if (!trimmedId || !password) {
      setError('Enter teacher ID and password.')
      return
    }
    setLoading(true)
    try {
      if (isSupabaseConfigured()) {
        const result = await signInTeacher({
          teacherId: trimmedId,
          password,
          schoolId: school?.id ?? 'school-1',
          schoolName: school?.name,
        })
        if (result.error) {
          setError(result.error)
          return
        }
        login(result.user)
      } else {
        if (trimmedId !== MOCK_TEACHER_ID || password !== MOCK_PASSWORD) {
          setError('Invalid teacher ID or password.')
          return
        }
        login({
          path: 'school',
          role: 'teacher',
          teacherId: trimmedId,
          name: `Teacher ${trimmedId}`,
          ...(school && { schoolId: school.id, schoolName: school.name }),
        })
      }
      log('SchoolTeacherLogin: submitted', { teacherId: trimmedId })
      onLogin()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <button type="button" className="back path-choice-back" onClick={onBack} aria-label="Back">
          ← Back
        </button>
        <h1>School — Teacher</h1>
        {school && <p className="login-subtitle">Signing in to {school.name}</p>}
        <p className="login-subtitle">Sign in with your teacher ID and password.</p>
        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="teacher-id">Teacher ID</label>
          <input
            id="teacher-id"
            type="text"
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            placeholder="e.g. T001"
            autoComplete="username"
            className="login-input"
          />
          <label htmlFor="teacher-password">Password</label>
          <input
            id="teacher-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            className="login-input"
          />
          {error && <p className="login-error" role="alert">{error}</p>}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
