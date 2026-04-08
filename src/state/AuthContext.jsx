import { createContext, useContext, useEffect, useState } from 'react'
import {
  clearStoredUser,
  getStoredUser,
  setStoredUser,
} from '../utils/authStorage'
import { getCurrentUser, loginUser } from '../api/authApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser())
  const [loading, setLoading] = useState(() => Boolean(getStoredUser()?.token))

  // Login against backend and keep auth data in localStorage.
  const login = async (credentials) => {
    const response = await loginUser(credentials)
    const nextUser = { ...response.user, token: response.token }
    setUser(nextUser)
    setStoredUser(nextUser)
    return nextUser
  }

  const logout = () => {
    setUser(null)
    clearStoredUser()
  }

  const updateUser = (nextUser) => {
    const merged = { ...user, ...nextUser }
    setUser(merged)
    setStoredUser(merged)
  }

  const token = user?.token

  useEffect(() => {
    if (!token) return

    let ignore = false
    setLoading(true)

    getCurrentUser(token)
      .then((response) => {
        if (ignore) return
        const refreshedUser = { ...response.user, token }
        setUser(refreshedUser)
        setStoredUser(refreshedUser)
      })
      .catch(() => {
        if (ignore) return
        setUser(null)
        clearStoredUser()
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [token])

  const value = {
    user,
    token: user?.token ?? null,
    isLoggedIn: Boolean(user?.token),
    loading,
    login,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
