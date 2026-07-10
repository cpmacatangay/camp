import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import client, { setAuthToken } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const navigateRef = useRef(navigate)
  navigateRef.current = navigate

  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('camp_user')
    if (!stored) return null
    try {
      const parsed = JSON.parse(stored)
      setAuthToken(parsed.token)
      return parsed
    } catch {
      localStorage.removeItem('camp_user')
      return null
    }
  })

  const logout = useCallback(() => {
    localStorage.removeItem('camp_user')
    setAuthToken(null)
    setUser(null)
    navigateRef.current('/login')
  }, [])

  // 401 interceptor — auto logout on expired/invalid token
  useEffect(() => {
    const interceptor = client.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 401 && err.config?.url !== '/auth/login') {
          logout()
        }
        return Promise.reject(err)
      },
    )
    return () => client.interceptors.response.eject(interceptor)
  }, [logout])

  // Multi-tab logout sync
  useEffect(() => {
    function handleStorageChange(e) {
      if (e.key === 'camp_user' && !e.newValue) {
        setAuthToken(null)
        setUser(null)
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const login = useCallback(async (email, password) => {
    const { data } = await client.post('/auth/login', { email, password })
    const userData = { token: data.token, role: data.role, email: data.email, mustChangePassword: data.mustChangePassword || false }
    localStorage.setItem('camp_user', JSON.stringify(userData))
    setAuthToken(data.token)
    setUser(userData)
    return userData
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
