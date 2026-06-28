import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import type { User, LoginRequest, RegisterRequest } from '../types'
import { login as authLogin } from '../api/auth.api'
import { getProfile } from '../api/profile.api'
import api from '../api/axios'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
    isAuthenticated: false,
    isLoading: true,
  })

  const fetchUser = useCallback(async () => {
    if (!state.accessToken) {
      setState((prev) => ({ ...prev, isLoading: false }))
      return
    }
    try {
      const response = await getProfile()
      const data = response.data.data || response.data
      const user: User = {
        id: String(data.userId || data.id || ''),
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        role: data.role,
        phone: data.phone,
        photo: data.photo,
      }
      setState((prev) => ({
        ...prev,
        user,
        isAuthenticated: true,
        isLoading: false,
      }))
    } catch {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      setState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  }, [state.accessToken])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const login = useCallback(async (email: string, password: string) => {
    const data: LoginRequest = { email, password }
    const response = await authLogin(data)
    const d = response.data
    localStorage.setItem('accessToken', d.accessToken)
    localStorage.setItem('refreshToken', d.refreshToken)
    const user: User = {
      id: String(d.userId),
      firstName: d.firstName || '',
      lastName: d.lastName || '',
      email: d.email,
      role: d.role,
      phone: d.phone,
    }
    setState({
      user,
      accessToken: d.accessToken,
      refreshToken: d.refreshToken,
      isAuthenticated: true,
      isLoading: false,
    })
  }, [])

  const register = useCallback(async (data: RegisterRequest) => {
    await api.post('/auth/register', data)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    })
    delete api.defaults.headers.common['Authorization']
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
