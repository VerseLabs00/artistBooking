import api from './axios'

// POST /api/login  → { message, user, access_token, token_type }
export const loginApi = (email, password) =>
  api.post('/login', { email, password })

// POST /api/logout
export const logoutApi = () =>
  api.post('/logout')

// GET /api/user
export const getMeApi = () =>
  api.get('/user')
