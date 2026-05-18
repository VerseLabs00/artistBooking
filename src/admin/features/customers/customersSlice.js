import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getCustomersApi, getCustomerApi } from '../../api/customersApi'

// ── Helper: normalise backend User → UI shape ─────────────────────────────────
function normaliseCustomer(c, stats = null) {
  return {
    ...c,
    name: c.name || '—',
    email: c.email || '—',
    status: c.status || 'active',
    avatar: c.avatar || `https://i.pravatar.cc/150?u=${c.id}`,
    joined: c.created_at
      ? new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      : '—',
    lastActive: c.updated_at
      ? new Date(c.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : '—',
    bookings: stats?.total ?? c.bookings_count ?? 0,
    totalSpent: stats?.total_spent != null
      ? `LKR ${Number(stats.total_spent).toLocaleString()}`
      : 'LKR 0',
    bookingHistory: c.bookingHistory ?? [],
    reviews: c.reviews ?? [],
  }
}

const initialState = {
  list: [],
  selected: null,
  selectedStats: null,
  filter: 'all',
  searchQuery: '',
  loading: false,
  selectedLoading: false,
  error: null,
  pagination: null,
}

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchCustomers = createAsyncThunk(
  'customers/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await getCustomersApi(params)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load customers')
    }
  }
)

export const fetchCustomer = createAsyncThunk(
  'customers/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await getCustomerApi(id)
      return data // { customer, stats }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load customer')
    }
  }
)

// ── Slice ─────────────────────────────────────────────────────────────────────

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    setFilter(state, action) { state.filter = action.payload },
    setSearchQuery(state, action) { state.searchQuery = action.payload },
    clearSelected(state) { state.selected = null; state.selectedStats = null },
    // Local-optimistic ban/unban (no dedicated API endpoint in backend)
    banCustomer(state, action) {
      const c = state.list.find(c => c.id === action.payload)
      if (c) c.status = 'banned'
      if (state.selected?.id === action.payload) state.selected.status = 'banned'
    },
    unbanCustomer(state, action) {
      const c = state.list.find(c => c.id === action.payload)
      if (c) c.status = 'active'
      if (state.selected?.id === action.payload) state.selected.status = 'active'
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchCustomers.fulfilled, (state, { payload }) => {
        state.loading = false
        const raw = Array.isArray(payload) ? payload : (payload.data ?? [])
        state.list = raw.map(c => normaliseCustomer(c))
        state.pagination = payload.meta || {
          current_page: payload.current_page,
          last_page: payload.last_page,
          total: payload.total,
        }
      })
      .addCase(fetchCustomers.rejected, (state, { payload }) => {
        state.loading = false; state.error = payload
      })
      .addCase(fetchCustomer.pending, (state) => { state.selectedLoading = true })
      .addCase(fetchCustomer.fulfilled, (state, { payload }) => {
        state.selectedLoading = false
        // Backend returns { customer, stats }
        const raw = payload.customer ?? payload.data ?? payload
        const stats = payload.stats ?? null
        state.selected = normaliseCustomer(raw, stats)
        state.selectedStats = stats
      })
      .addCase(fetchCustomer.rejected, (state, { payload }) => {
        state.selectedLoading = false; state.error = payload
      })
  },
})

export const { setFilter, setSearchQuery, clearSelected, banCustomer, unbanCustomer } = customersSlice.actions

export const selectFilteredCustomers = (state) => {
  const { list, filter, searchQuery } = state.customers
  return list
    .filter(c => filter === 'all' || c.status === filter)
    .filter(c =>
      (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
}

export default customersSlice.reducer
