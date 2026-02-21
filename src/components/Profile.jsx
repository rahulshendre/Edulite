import { useState, useEffect } from 'react'
import { login } from '../utils/auth'
import { getAllProgress } from '../db'
import { logError } from '../utils/debug'

export default function Profile({ user, onUpdateUser, onChangeContentMode, onLogout }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user?.name ?? '')
  const [studentId, setStudentId] = useState(user?.studentId ?? '')
  const [completedCount, setCompletedCount] = useState(0)

  useEffect(() => {
    setName(user?.name ?? '')
    setStudentId(user?.studentId ?? '')
  }, [user?.name, user?.studentId])

  useEffect(() => {
    if (!user?.id) return
    getAllProgress(user.id)
      .then((all) => {
        const count = all.filter((p) => p.status === 'completed').length
        setCompletedCount(count)
      })
      .catch((e) => {
        logError('Profile: getAllProgress failed', e)
        setCompletedCount(0)
      })
  }, [user?.id])

  const handleSave = () => {
    const trimmedName = name.trim()
    if (!trimmedName) return
    login({ name: trimmedName, studentId: studentId.trim() || undefined })
    onUpdateUser?.()
    setEditing(false)
  }

  return (
    <div className="profile-screen">
      <h1>Profile</h1>

      <section className="profile-card">
        <h2>Account</h2>
        {editing ? (
          <>
            <label htmlFor="profile-name">Name</label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="profile-input"
              autoComplete="name"
            />
            <label htmlFor="profile-student-id">Student ID (optional)</label>
            <input
              id="profile-student-id"
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="profile-input"
              autoComplete="off"
            />
            <div className="profile-actions">
              <button type="button" className="profile-btn primary" onClick={handleSave}>
                Save
              </button>
              <button type="button" className="profile-btn secondary" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="profile-field">
              <span className="profile-label">Name</span>
              <span className="profile-value">{user?.name ?? '—'}</span>
            </p>
            {user?.studentId && (
              <p className="profile-field">
                <span className="profile-label">Student ID</span>
                <span className="profile-value">{user.studentId}</span>
              </p>
            )}
            <button type="button" className="profile-btn secondary" onClick={() => setEditing(true)}>
              Edit profile
            </button>
          </>
        )}
      </section>

      <section className="profile-card">
        <h2>Progress</h2>
        <p className="profile-stat">
          <span className="profile-stat-value">{completedCount}</span>
          <span className="profile-stat-label">Packets completed</span>
        </p>
      </section>

      <section className="profile-actions-block">
        <button type="button" className="profile-btn full" onClick={onChangeContentMode}>
          Change content mode
        </button>
        <button type="button" className="profile-btn full outline" onClick={onLogout}>
          Log out
        </button>
      </section>
    </div>
  )
}
