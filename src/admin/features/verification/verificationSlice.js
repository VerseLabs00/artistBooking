import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getArtistsApi, verifyArtistApi, deleteArtistApi } from '../../api/artistsApi'

const initialState = {
  list: [],        // pending artist profiles
  filter: 'all',  // all | today | resubmitted
  expandedId: null,
  loading: false,
  error: null,
}

// ── Normalise pending ArtistProfile → verification card shape ─────────────────
function normaliseVerification(a) {
  const media = a.user?.artist_media || []
  const frontDoc = media.find(m => m.purpose === 'verification_front')
  const backDoc = media.find(m => m.purpose === 'verification_back')
  const selfieDoc = media.find(m => m.purpose === 'selfie')

  return {
    id: a.id,
    name:     a.stage_name || a.full_name || '—',
    email:    a.email || a.user?.email || '—',
    category: a.category || '—',
    location: a.location || '—',
    avatar:   a.avatar_url || `https://i.pravatar.cc/80?u=${a.id}`,
    submittedAt: a.created_at,
    isToday: a.created_at
      ? new Date(a.created_at).toDateString() === new Date().toDateString()
      : false,
    isResubmitted: a.is_resubmitted ?? false,
    submittedDate: a.created_at
      ? new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : '—',
    // Profile fields
    profile: {
      fullName:    a.full_name    || '—',
      stageName:   a.stage_name  || '—',
      location:    a.location    || '—',
      phone:       a.phone_number || '—',
      email:       a.email || a.user?.email || '—',
      category:    a.category    || '—',
      dateOfBirth: a.dob         || '—',
      genres:      Array.isArray(a.genres) ? a.genres.join(', ') : '—',
      nic:         a.nic         || '—',
    },
    documents: [
      { label: 'Front Side', uploaded: !!frontDoc, url: frontDoc?.url },
      { label: 'Back Side',  uploaded: !!backDoc,  url: backDoc?.url },
      { label: 'Selfie with Document', uploaded: !!selfieDoc, url: selfieDoc?.url },
    ],
    portfolio: {
      images: a.gallery_images || [],
      video:  a.youtube_link   || null,
    },
    pricing: a.starting_price ? {
      basePrice:    parseFloat(a.starting_price),
      pricePerHour: parseFloat(a.max_price ?? a.starting_price),
      addOns:       Array.isArray(a.add_ons) ? a.add_ons : [],
    } : null,
    travelRadius: a.travel_radius || 0,
    socialLinks: {
      instagram: a.instagram_link || '',
      facebook:  a.facebook_link  || '',
      youtube:   a.youtube_link   || '',
      spotify:   a.spotify_link   || '',
    },
  }
}

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchPendingArtists = createAsyncThunk(
  'verification/fetchPending',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await getArtistsApi({ status: 'pending', per_page: 50 })
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load pending artists')
    }
  }
)

export const approveArtist = createAsyncThunk(
  'verification/approve',
  async (id, { rejectWithValue }) => {
    try {
      await verifyArtistApi(id, 'approved')
      return id
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Approval failed')
    }
  }
)

export const rejectArtist = createAsyncThunk(
  'verification/reject',
  async (id, { rejectWithValue }) => {
    try {
      await deleteArtistApi(id)
      return id
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Rejection failed')
    }
  }
)

// ── Slice ─────────────────────────────────────────────────────────────────────

const verificationSlice = createSlice({
  name: 'verification',
  initialState,
  reducers: {
    setFilter(state, action) { state.filter = action.payload },
    toggleExpand(state, action) {
      state.expandedId = state.expandedId === action.payload ? null : action.payload
    },
    // Legacy local-only actions kept for compatibility
    approveApplication(state, action) {
      state.list = state.list.filter(v => v.id !== action.payload)
    },
    rejectApplication(state, action) {
      state.list = state.list.filter(v => v.id !== action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPendingArtists.pending,   (state) => { state.loading = true; state.error = null })
      .addCase(fetchPendingArtists.fulfilled, (state, { payload }) => {
        state.loading = false
        const raw = Array.isArray(payload) ? payload : (payload.data ?? [])
        state.list = raw.map(normaliseVerification)
        // auto-expand first card
        if (raw.length > 0 && !state.expandedId) state.expandedId = raw[0].id
      })
      .addCase(fetchPendingArtists.rejected,  (state, { payload }) => { state.loading = false; state.error = payload })

      // On approve / reject → remove from list
      .addCase(approveArtist.fulfilled, (state, { payload: id }) => {
        state.list = state.list.filter(v => v.id !== id)
      })
      .addCase(rejectArtist.fulfilled, (state, { payload: id }) => {
        state.list = state.list.filter(v => v.id !== id)
      })
  },
})

export const {
  setFilter, toggleExpand, approveApplication, rejectApplication,
} = verificationSlice.actions

export const selectFilteredVerifications = (state) => {
  const { list, filter } = state.verification
  if (filter === 'today')       return list.filter(v => v.isToday)
  if (filter === 'resubmitted') return list.filter(v => v.isResubmitted)
  return list
}

export default verificationSlice.reducer
