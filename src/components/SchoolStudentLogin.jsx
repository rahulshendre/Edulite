import { useState } from 'react'
import { login } from '../utils/auth'
import { log } from '../utils/debug'

// Mock: replace with real API later. GR no. + password.
const MOCK_GR = 'student1'
const MOCK_PASSWORD = 'pass'

export default function SchoolStudentLogin({ school, onLogin, onBack }) {
  const [grNo, setGrNo] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    const trimmedGr = grNo.trim()
    if (!trimmedGr || !password) {
      setError('Enter GR number and password.')
      return
    }
    // Mock validation
    if (trimmedGr !== MOCK_GR || password !== MOCK_PASSWORD) {
      setError('Invalid GR number or password.')
      return
    }
    const user = {
      path: 'school',
      role: 'student',
      grNo: trimmedGr,
      name: `Student ${trimmedGr}`,
      ...(school && { schoolId: school.id, schoolName: school.name }),
    }
    login(user)
    log('SchoolStudentLogin: submitted', { grNo: trimmedGr })
    onLogin()
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
          <button type="submit" className="login-btn">
            Sign in
          </button>
        </form>
      </div>
    </div>
  )
}
