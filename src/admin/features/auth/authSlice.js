import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { loginApi, logoutApi } from '../../api/authApi'

// Persist token to localStorage so it survives a page refresh
const savedToken = localStorage.getItem('admin_token')
const savedAdmin = (() => {
  try { return JSON.parse(localStorage.getItem('admin_user')) } catch { return null }
})()

const initialState = {
  isAuthenticated: !!(savedToken && savedAdmin),
  admin: savedAdmin,
  token: savedToken,
  loading: false,
  error: null,
}

export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await loginApi(email, password)
      // Backend returns: { message, user, access_token, token_type }
      return { token: data.access_token, user: data.user }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Invalid credentials'
      )
    }
  }
)

export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async () => {
    try { await logoutApi() } catch { /* always clear local state */ }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.isAuthenticated = false
      state.admin = null
      state.token = null
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginThunk.fulfilled, (state, { payload }) => {
        state.loading = false
        state.isAuthenticated = true
        state.token = payload.token
        state.admin = payload.user
        localStorage.setItem('admin_token', payload.token)
        localStorage.setItem('admin_user', JSON.stringify(payload.user))
      })
      .addCase(loginThunk.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.isAuthenticated = false
        state.admin = null
        state.token = null
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
      })
  },
})

export const { logout } = authSlice.actions
export default authSlice.reducer
