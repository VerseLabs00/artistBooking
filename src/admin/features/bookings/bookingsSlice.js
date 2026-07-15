import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getBookingsApi, getBookingApi, updateBookingStatusApi } from '../../api/bookingsApi'

// ── Normalise backend Booking → UI shape ─────────────────────────────────────
// Backend fields (from Booking model):
//   customer_id, artist_profile_id, event_date, event_start_time,
//   event_duration_hours, event_type, venue, special_notes, agreed_price,
//   advance_amount, booking_status, payment_status, payhere_order_id,
//   customer_name, customer_email, customer_phone
// Relations: customer{id,name,email}, artistProfile{id,stage_name,full_name,category,email,avatar_url}
function normaliseBooking(b) {
  const statusMap = {
    awaiting_confirmation: 'awaiting',
    pending_payment: 'pending',
    confirmed:       'confirmed',
    rejected:        'suspended',
    cancelled:       'cancelled',
    completed:       'completed',
  }

  const artist   = b.artist_profile ?? b.artistProfile ?? {}
  const customer = b.customer ?? {}

  const totalPrice   = parseFloat(b.agreed_price   ?? 0)
  const advancePrice = parseFloat(b.advance_amount ?? 0)
  const platformFee  = parseFloat(b.platform_fee    ?? 0)
  const commission   = parseFloat(b.commission_rate ?? 15)

  return {
    ...b,
    status: statusMap[b.booking_status] ?? b.booking_status ?? 'pending',
    commissionRate: commission,

    customer: {
      id:     customer.id,
      name:   b.customer_name  || customer.name  || '—',
      email:  b.customer_email || customer.email || '—',
      phone:  b.customer_phone || '—',
      avatar: customer.avatar_url || `https://i.pravatar.cc/40?u=c${customer.id ?? b.customer_id}`,
    },
    artist: {
      id:       artist.id,
      name:     artist.stage_name || artist.full_name || '—',
      email:    artist.email || '—',
      category: artist.category || '—',
      rating:   artist.average_rating ?? artist.rating ?? 0,
      avatar:   artist.avatar_url || `https://i.pravatar.cc/40?u=a${artist.id ?? b.artist_profile_id}`,
    },

    // Formatted amounts
    amount:      totalPrice   ? `LKR ${totalPrice.toLocaleString()}`   : '—',
    deposit:     advancePrice ? `LKR ${advancePrice.toLocaleString()}` : '—',
    balance:     totalPrice   ? `LKR ${(totalPrice - advancePrice).toLocaleString()}` : '—',
    commission:  platformFee  ? `LKR ${platformFee.toFixed(0)}` : '—',
    platformFee: platformFee || 0,

    depositStatus: b.payment_status ?? 'pending',
    balanceStatus: b.booking_status === 'completed' ? 'paid' : 'pending',

    // Event
    date:         b.event_date
      ? new Date(b.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : '—',
    time:         b.event_start_time || '—',
    duration:     b.event_duration_hours ? `${b.event_duration_hours} hrs` : '—',
    eventType:    b.event_type    || '—',
    venue:        b.venue         || '—',
    location:     b.venue         || '—',      // backend uses 'venue'
    specialNotes: b.special_notes || '',
    bookedOn:     b.created_at
      ? new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : '—',
    chatUnlocked: b.payment_status === 'paid',
    addOns:       b.add_ons || [],
    review:       b.review ?? null,
  }
}

const initialState = {
  list: [],
  selected: null,
  filter: 'all',
  searchQuery: '',
  loading: false,
  selectedLoading: false,
  error: null,
  pagination: null,
}

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchBookings = createAsyncThunk(
  'bookings/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await getBookingsApi(params)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load bookings')
    }
  }
)

export const fetchBooking = createAsyncThunk(
  'bookings/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await getBookingApi(id)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load booking')
    }
  }
)

export const updateBookingStatus = createAsyncThunk(
  'bookings/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const { data } = await updateBookingStatusApi(id, status)
      return data // { message, booking }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Update failed')
    }
  }
)

// ── Slice ─────────────────────────────────────────────────────────────────────

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    setFilter(state, action)      { state.filter = action.payload },
    setSearchQuery(state, action) { state.searchQuery = action.payload },
    clearSelected(state)          { state.selected = null },
    // kept for backward-compat with any leftover usage
    cancelBooking(state, action) {
      const b = state.list.find(b => b.id === action.payload)
      if (b) b.status = 'cancelled'
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending,   (state) => { state.loading = true; state.error = null })
      .addCase(fetchBookings.fulfilled, (state, { payload }) => {
        state.loading = false
        const raw = Array.isArray(payload) ? payload : (payload.data ?? [])
        state.list = raw.map(normaliseBooking)
        state.pagination = {
          current_page: payload.current_page ?? 1,
          last_page:    payload.last_page    ?? 1,
          total:        payload.total        ?? raw.length,
        }
      })
      .addCase(fetchBookings.rejected, (state, { payload }) => { state.loading = false; state.error = payload })

      .addCase(fetchBooking.pending,   (state) => { state.selectedLoading = true })
      .addCase(fetchBooking.fulfilled, (state, { payload }) => {
        state.selectedLoading = false
        state.selected = normaliseBooking(payload.data ?? payload)
      })
      .addCase(fetchBooking.rejected,  (state, { payload }) => { state.selectedLoading = false; state.error = payload })

      // updateStatus → { message, booking }
      .addCase(updateBookingStatus.fulfilled, (state, { payload }) => {
        const updated = normaliseBooking(payload.booking ?? payload.data ?? payload)
        const idx = state.list.findIndex(b => b.id === updated.id)
        if (idx !== -1) state.list[idx] = updated
        if (state.selected?.id === updated.id) state.selected = updated
      })
  },
})

export const { setFilter, setSearchQuery, clearSelected, cancelBooking } = bookingsSlice.actions

export const selectFilteredBookings = (state) => {
  const { list, filter, searchQuery } = state.bookings
  return list
    .filter(b => filter === 'all' || b.status === filter)
    .filter(b => {
      const q = searchQuery.toLowerCase()
      return (
        String(b.id).toLowerCase().includes(q) ||
        (b.customer?.name  || '').toLowerCase().includes(q) ||
        (b.artist?.name    || '').toLowerCase().includes(q)
      )
    })
}

export default bookingsSlice.reducer
