import { createContext, useContext, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import client, { setAuthToken } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('camp_user')
    if (!stored) return null
    const parsed = JSON.parse(stored)
    setAuthToken(parsed.token)
    return parsed
  })
  const navigate = useNavigate()

  const login = useCallback(async (email, password) => {
    const { data } = await client.post('/auth/login', { email, password })
    const userData = { token: data.token, role: data.role, email: data.email }
    localStorage.setItem('camp_user', JSON.stringify(userData))
    setAuthToken(data.token)
    setUser(userData)
    return userData
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('camp_user')
    setAuthToken(null)
    setUser(null)
    navigate('/login')
  }, [navigate])

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
