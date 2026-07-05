import { createContext, useContext, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('camp_user')
    return stored ? JSON.parse(stored) : null
  })
  const navigate = useNavigate()

  const login = useCallback(async (email, password) => {
    const { data } = await client.post('/auth/login', { email, password })
    const userData = { token: data.token, role: data.role, email: data.email }
    localStorage.setItem('camp_user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('camp_user')
    setUser(null)
    navigate('/login')
  }, [navigate])

  const authedClient = useCallback(() => {
    const instance = client
    instance.defaults.headers.common['Authorization'] = user?.token
      ? `Bearer ${user.token}`
      : ''
    return instance
  }, [user])

  return (
    <AuthContext.Provider value={{ user, login, logout, authedClient }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
