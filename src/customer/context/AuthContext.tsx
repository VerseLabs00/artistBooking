import { createContext, useContext, useState, ReactNode } from 'react'
import * as authService from '../services/authService'
import type { AuthUser } from '../services/authService'

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  setUser: (user: AuthUser | null) => void
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('auth_user')
    return stored ? JSON.parse(stored) : null
  })
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'))

  const setUser = (user: AuthUser | null) => {
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('auth_user')
    }
    setUserState(user)
  }

  const login = async (email: string, password: string) => {
    const data = await authService.login(email, password)
    
    // Check if the user has the 'client' role
    if (data.user.role !== 'client') {
      throw new Error('Access denied. This login is for customers only.')
    }

    localStorage.setItem('auth_token', data.access_token)
    localStorage.setItem('auth_user', JSON.stringify(data.user))
    setToken(data.access_token)
    setUserState(data.user)
  }

  const register = async (name: string, email: string, password: string, passwordConfirmation: string) => {
    const data = await authService.register(name, email, password, passwordConfirmation)
    localStorage.setItem('auth_token', data.access_token)
    localStorage.setItem('auth_user', JSON.stringify(data.user))
    setToken(data.access_token)
    setUserState(data.user)
  }

  const logout = () => {
    authService.logout().catch(() => {})
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    setToken(null)
    setUserState(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, setUser, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
