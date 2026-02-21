import { useState } from 'react'
import { login } from '../utils/auth'
import { log } from '../utils/debug'

export default function Login({ onLogin }) {
  const [name, setName] = useState('')
  const [studentId, setStudentId] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    login({ name: trimmed, studentId: studentId.trim() || undefined })
    log('Login: submitted', { name: trimmed, studentId: studentId.trim() || '(none)' })
    onLogin()
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <img src="/graduation-cap-icon.svg" alt="" className="login-logo" aria-hidden />
        <h1>Learning Packets</h1>
        <p className="login-subtitle">Learn offline. Sync when you can.</p>
        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="login-name">Your name</label>
          <input
            id="login-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Alex"
            required
            autoComplete="name"
            className="login-input"
          />
          <label htmlFor="login-student-id">Student ID <span className="optional">(optional)</span></label>
          <input
            id="login-student-id"
            type="text"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="e.g. 12345"
            autoComplete="off"
            className="login-input"
          />
          <button type="submit" className="login-btn">
            Continue
          </button>
        </form>
      </div>
    </div>
  )
}
