import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  getArtistsApi,
  getArtistApi,
  verifyArtistApi,
  toggleOnboardApi,
  deleteArtistApi,
} from '../../api/artistsApi'

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

// ── Normalise backend ArtistProfileCustomer → UI shape ────────────────────────────────
// Backend fields (from ArtistProfile model):
//   full_name, stage_name, location, phone_number, dob, category, email,
//   short_bio, bio_1, bio_2, paragraph, tags, starting_price, max_price,
//   avatar_url, cover_url, youtube_link, facebook_link, instagram_link,
//   spotify_link, verification_status, is_onboarded
// Relations: user{id,name,email}, reviews, bankDetails
function normaliseArtist(a) {
  const statusMap = { approved: 'verified', pending: 'pending', rejected: 'suspended' }

  // Social links assembled from flat columns
  const socials = {}
  if (a.facebook_link)  socials.facebook  = a.facebook_link
  if (a.instagram_link) socials.instagram = a.instagram_link
  if (a.spotify_link)   socials.spotify   = a.spotify_link
  if (a.youtube_link)   socials.youtube   = a.youtube_link

  // Bio: prefer longer fields, fall back to short_bio
  const bio = a.short_bio || a.bio_1 || ''
  const overview = [a.bio_1, a.bio_2, a.paragraph].filter(Boolean).join('\n\n') || bio

  return {
    ...a,
    // Identity
    name:     a.stage_name || a.full_name || a.user?.name || '—',
    email:    a.email || a.user?.email || '—',
    phone:    a.phone_number || '—',
    location: a.location || '—',
    category: a.category || '—',
    avatar:   a.avatar_url || (a.user?.id ? `https://i.pravatar.cc/150?u=${a.user.id}` : `https://i.pravatar.cc/150?u=${a.id}`),
    coverImage: a.cover_url || null,
    // Status
    status: statusMap[a.verification_status] ?? a.verification_status ?? 'pending',
    isOnboarded: a.is_onboarded ?? false,
    // Pricing
    fullPrice:  parseFloat(a.full_price ?? 0),
    advance:    parseFloat(a.advance ?? 0),
    priceRange: '',
    // Stats
    rating:         a.average_rating ?? a.rating ?? 0,
    reviewCount:    a.review_count ?? 0,
    bookings:       a.bookings_count ?? 0,
    totalEarnings:  a.total_earnings ? `LKR ${Number(a.total_earnings).toLocaleString()}` : 'LKR 0',
    completionRate: a.completion_rate ?? 0,
    joinedDate:     a.created_at
      ? new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      : '—',
    // Content
    bio,
    overview,
    tags:     Array.isArray(a.tags) ? a.tags : [],
    genres:   Array.isArray(a.genres) ? a.genres : [],
    gallery:  a.gallery_images || [],
    media:    a.media || [],
    socials,
    // Misc
    ageLimit:      a.age_limit || 'All ages',
    suspendReason: a.suspend_reason || null,
  }
}

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchArtists = createAsyncThunk(
  'artists/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await getArtistsApi(params)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load artists')
    }
  }
)

export const fetchArtist = createAsyncThunk(
  'artists/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await getArtistApi(id)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load artist')
    }
  }
)

export const verifyArtist = createAsyncThunk(
  'artists/verify',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const { data } = await verifyArtistApi(id, status)
      return data // { message, artist }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Action failed')
    }
  }
)

export const toggleArtistOnboard = createAsyncThunk(
  'artists/toggleOnboard',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await toggleOnboardApi(id)
      return { id, is_onboarded: data.is_onboarded } // { message, is_onboarded }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Action failed')
    }
  }
)

export const deleteArtist = createAsyncThunk(
  'artists/delete',
  async (id, { rejectWithValue }) => {
    try {
      await deleteArtistApi(id)
      return id
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Delete failed')
    }
  }
)

// ── Slice ─────────────────────────────────────────────────────────────────────

const artistsSlice = createSlice({
  name: 'artists',
  initialState,
  reducers: {
    setFilter(state, action)      { state.filter = action.payload },
    setSearchQuery(state, action) { state.searchQuery = action.payload },
    clearSelected(state)          { state.selected = null },
  },
  extraReducers: (builder) => {
    builder
      // fetchAll
      .addCase(fetchArtists.pending,   (state) => { state.loading = true; state.error = null })
      .addCase(fetchArtists.fulfilled, (state, { payload }) => {
        state.loading = false
        // Laravel pagination: { data:[...], current_page, last_page, total }
        const raw = Array.isArray(payload) ? payload : (payload.data ?? [])
        state.list = raw.map(normaliseArtist)
        state.pagination = {
          current_page: payload.current_page ?? 1,
          last_page:    payload.last_page ?? 1,
          total:        payload.total ?? raw.length,
        }
      })
      .addCase(fetchArtists.rejected,  (state, { payload }) => { state.loading = false; state.error = payload })

      // fetchOne
      .addCase(fetchArtist.pending,   (state) => { state.selectedLoading = true; state.error = null })
      .addCase(fetchArtist.fulfilled, (state, { payload }) => {
        state.selectedLoading = false
        const raw = payload.data ?? payload
        state.selected = normaliseArtist(raw)
        const idx = state.list.findIndex(a => a.id === state.selected.id)
        if (idx !== -1) state.list[idx] = state.selected
      })
      .addCase(fetchArtist.rejected,  (state, { payload }) => { state.selectedLoading = false; state.error = payload })

      // verify → { message, artist }
      .addCase(verifyArtist.fulfilled, (state, { payload }) => {
        const updated = normaliseArtist(payload.artist ?? payload.data ?? payload)
        const idx = state.list.findIndex(a => a.id === updated.id)
        if (idx !== -1) state.list[idx] = updated
        if (state.selected?.id === updated.id) state.selected = updated
      })

      // toggleOnboard → { id, is_onboarded }
      .addCase(toggleArtistOnboard.fulfilled, (state, { payload }) => {
        const idx = state.list.findIndex(a => a.id === payload.id)
        if (idx !== -1) state.list[idx] = { ...state.list[idx], isOnboarded: payload.is_onboarded }
        if (state.selected?.id === payload.id)
          state.selected = { ...state.selected, isOnboarded: payload.is_onboarded }
      })

      // delete
      .addCase(deleteArtist.fulfilled, (state, { payload: id }) => {
        state.list = state.list.filter(a => a.id !== id)
        if (state.selected?.id === id) state.selected = null
      })
  },
})

export const { setFilter, setSearchQuery, clearSelected } = artistsSlice.actions

export const selectFilteredArtists = (state) => {
  const { list, filter, searchQuery } = state.artists
  return list
    .filter(a => filter === 'all' || a.status === filter)
    .filter(a =>
      (a.name  || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
}

export default artistsSlice.reducer
