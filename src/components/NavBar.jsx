import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function NavBar() {
  const { displayName, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="navbar">
      <div className="navbar-title">
        <span className="navbar-emoji" aria-hidden="true">🙏</span>
        <span>Expense Manager</span>
      </div>
      <div className="navbar-user">
        <span className={`badge ${isAdmin ? 'badge-admin' : 'badge-user'}`}>
          {isAdmin ? 'Admin' : displayName}
        </span>
        <button type="button" className="btn btn-secondary btn-sm" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </header>
  )
}
