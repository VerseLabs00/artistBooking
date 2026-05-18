import api from '../lib/api'

export interface AuthUser {
  id: number
  name: string
  email: string
  role: string
}

export interface AuthResponse {
  user: AuthUser
  access_token: string
}

export const login = (email: string, password: string): Promise<AuthResponse> =>
  api.post('/login', { email, password }).then(r => r.data)

export const register = (
  name: string,
  email: string,
  password: string,
  password_confirmation: string,
): Promise<AuthResponse> =>
  api.post('/register', { name, email, password, password_confirmation, role: 'client' }).then(r => r.data)

export const logout = (): Promise<void> =>
  api.post('/logout').then(() => {})