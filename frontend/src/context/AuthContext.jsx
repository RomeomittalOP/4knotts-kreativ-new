import { createContext, useContext, useState, useCallback } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('4kk-user') || 'null') } catch { return null }
  })
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState('login')  // 'login' | 'signup'

  const persist = (u, token) => {
    if (u && token) {
      localStorage.setItem('4kk-token', token)
      localStorage.setItem('4kk-user', JSON.stringify(u))
      setUser(u)
    } else {
      localStorage.removeItem('4kk-token')
      localStorage.removeItem('4kk-user')
      setUser(null)
    }
  }

  const sendOtp = useCallback(async ({ phone, email, purpose }) => {
    const r = await api.post('/auth/send-otp', { phone, email, purpose })
    return r.data
  }, [])

  const signup = useCallback(async (payload) => {
    const r = await api.post('/auth/signup', payload)
    persist(r.data.user, r.data.token)
    return r.data
  }, [])

  const login = useCallback(async (payload) => {
    const r = await api.post('/auth/login', payload)
    persist(r.data.user, r.data.token)
    return r.data
  }, [])

  const logout = useCallback(() => persist(null, null), [])

  const openAuth = useCallback((mode = 'login') => {
    setAuthModalMode(mode)
    setAuthModalOpen(true)
  }, [])
  const closeAuth = useCallback(() => setAuthModalOpen(false), [])

  return (
    <AuthContext.Provider value={{
      user, sendOtp, signup, login, logout,
      authModalOpen, authModalMode, openAuth, closeAuth, setAuthModalMode,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
