import { createContext, useContext, useMemo, useState } from 'react'
import { ADMIN_EMAIL, ADMIN_PASSWORD, SESSION_STORAGE_KEY } from '../constants'

// No Firebase Auth here on purpose — login is just: admin types the fixed
// password, or a team member picks their name (managed by the admin in
// Firestore). The chosen session is remembered in localStorage for this
// browser. See README.md for what this does and doesn't protect against.
function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readSession())

  function persist(next) {
    setSession(next)
    if (next) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(next))
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY)
    }
  }

  async function loginAdmin(email, password) {
    if (email.trim().toLowerCase() !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      throw new Error('Invalid admin email or password.')
    }
    persist({ role: 'admin', name: 'Admin' })
  }

  async function loginAsUser(name) {
    if (!name) {
      throw new Error('Please choose your name.')
    }
    persist({ role: 'user', name })
  }

  function logout() {
    persist(null)
  }

  const isAdmin = session?.role === 'admin'
  const isAuthenticated = Boolean(session)
  const displayName = session?.name || ''

  const value = useMemo(
    () => ({
      initializing: false,
      isAdmin,
      isAuthenticated,
      displayName,
      loginAdmin,
      loginAsUser,
      logout,
    }),
    [isAdmin, isAuthenticated, displayName]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
