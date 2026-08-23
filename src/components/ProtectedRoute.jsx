import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Requires any logged-in session (admin or a named user).
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, initializing } = useAuth()
  if (initializing) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}
