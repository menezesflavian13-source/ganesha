import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Route-level gate for the admin view: non-admins can never reach it, even
// by typing the URL directly. The underlying write calls are additionally
// enforced server-side by Firestore security rules (see firestore.rules).
export default function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, initializing } = useAuth()
  if (initializing) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  return children
}
