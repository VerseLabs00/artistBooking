import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getDashboardStatsApi } from '../../api/dashboardApi'

const initialState = {
  stats: null,
  recentBookings: [],
  loading: false,
  error: null,
}

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await getDashboardStatsApi()
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load dashboard')
    }
  }
)

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchDashboardStats.fulfilled, (state, { payload }) => {
        state.loading = false
        state.stats = payload.stats
        state.recentBookings = payload.recent_bookings ?? []
      })
      .addCase(fetchDashboardStats.rejected, (state, { payload }) => {
        state.loading = false; state.error = payload
      })
  },
})

export default dashboardSlice.reducer
