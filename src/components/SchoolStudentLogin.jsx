import { useState } from 'react'
import { login } from '../utils/auth'
import { signInStudent } from '../api/schoolAuth'
import { isSupabaseConfigured } from '../lib/supabase'
import { log } from '../utils/debug'

const MOCK_GR = 'student1'
const MOCK_PASSWORD = 'pass'

export default function SchoolStudentLogin({ school, onLogin, onBack }) {
  const [grNo, setGrNo] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const trimmedGr = grNo.trim()
    if (!trimmedGr || !password) {
      setError('Enter GR number and password.')
      return
    }
    setLoading(true)
    try {
      if (isSupabaseConfigured()) {
        const result = await signInStudent({
          grNo: trimmedGr,
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
        if (trimmedGr !== MOCK_GR || password !== MOCK_PASSWORD) {
          setError('Invalid GR number or password.')
          return
        }
        login({
          path: 'school',
          role: 'student',
          grNo: trimmedGr,
          name: `Student ${trimmedGr}`,
          ...(school && { schoolId: school.id, schoolName: school.name }),
        })
      }
      log('SchoolStudentLogin: submitted', { grNo: trimmedGr })
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
        <h1>School — Student</h1>
        {school && <p className="login-subtitle">Signing in to {school.name}</p>}
        <p className="login-subtitle">Enter your GR number and password.</p>
        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="school-gr">GR number</label>
          <input
            id="school-gr"
            type="text"
            value={grNo}
            onChange={(e) => setGrNo(e.target.value)}
            placeholder="e.g. 12345"
            autoComplete="username"
            className="login-input"
          />
          <label htmlFor="school-password">Password</label>
          <input
            id="school-password"
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
