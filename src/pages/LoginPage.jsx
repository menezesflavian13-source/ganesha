import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCollection } from '../hooks/useCollection'
import { ADMIN_EMAIL } from '../constants'

export default function LoginPage() {
  const { isAuthenticated, isAdmin, initializing, loginAsUser, loginAdmin } = useAuth()
  const navigate = useNavigate()
  const { data: members, loading: loadingMembers } = useCollection('members', {
    orderByField: 'name',
    direction: 'asc',
  })

  const [tab, setTab] = useState('user')
  const [selectedName, setSelectedName] = useState('')
  const [email, setEmail] = useState(ADMIN_EMAIL)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!initializing && isAuthenticated) {
      navigate(isAdmin ? '/admin' : '/dashboard', { replace: true })
    }
  }, [initializing, isAuthenticated, isAdmin, navigate])

  async function handleUserLogin(e) {
    e.preventDefault()
    setError('')
    if (!selectedName) {
      setError('Please select your name.')
      return
    }
    setSubmitting(true)
    try {
      await loginAsUser(selectedName)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Could not log in. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleAdminLogin(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await loginAdmin(email.trim(), password)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err.message || 'Invalid admin email or password.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-header">
          <span className="login-emoji" aria-hidden="true">🐘</span>
          <h1>Ambika Ganapati – Ambika Cha Raja</h1>
          <p className="login-subtitle">Committee expense &amp; contribution tracker</p>
        </div>

        <div className="tabs">
          <button
            type="button"
            className={`tab ${tab === 'user' ? 'tab-active' : ''}`}
            onClick={() => setTab('user')}
          >
            Team Member
          </button>
          <button
            type="button"
            className={`tab ${tab === 'admin' ? 'tab-active' : ''}`}
            onClick={() => setTab('admin')}
          >
            Admin
          </button>
        </div>

        {tab === 'user' ? (
          <form className="form" onSubmit={handleUserLogin}>
            <div className="form-row">
              <label htmlFor="login-name">Your name</label>
              {loadingMembers ? (
                <p className="empty-state">Loading names…</p>
              ) : !members.length ? (
                <p className="empty-state">
                  No team members yet. Ask the admin to add your name first.
                </p>
              ) : (
                <select
                  id="login-name"
                  value={selectedName}
                  onChange={(e) => setSelectedName(e.target.value)}
                >
                  <option value="" disabled>
                    Select your name
                  </option>
                  {members.map((member) => (
                    <option key={member.id} value={member.name}>
                      {member.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            {error && <p className="form-error">{error}</p>}
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={submitting || !members.length}
            >
              {submitting ? 'Logging in…' : 'Continue'}
            </button>
          </form>
        ) : (
          <form className="form" onSubmit={handleAdminLogin}>
            <div className="form-row">
              <label htmlFor="admin-email">Email</label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div className="form-row">
              <label htmlFor="admin-password">Password</label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Logging in…' : 'Log in as Admin'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
