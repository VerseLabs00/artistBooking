import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getArtistsApi } from "../../api/artistsApi";

const initialState = {
  list: [],
  loading: false,
  error: null,
};

// Fetch pending artists and convert to notifications
export const fetchVerificationNotifications = createAsyncThunk(
  "notifications/fetchVerification",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await getArtistsApi({ status: "pending", per_page: 50 });
      const raw = Array.isArray(data) ? data : (data.data ?? []);
      
      // Convert pending artists to notification format
      return raw.map((artist, index) => ({
        id: `verification-${artist.id}`,
        type: "verification",
        title: "New Verification Request",
        message: `${artist.stage_name || artist.full_name || 'Artist'} submitted a verification application.`,
        time: artist.created_at
          ? new Date(artist.created_at).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Recently",
        read: false,
        link: `/admin/verification?expand=${artist.id}`,
        artistId: artist.id,
        artistName: artist.stage_name || artist.full_name || "Artist"
      }));
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to load notifications"
      );
    }
  }
);

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    markRead(state, action) {
      const n = state.list.find((n) => n.id === action.payload);
      if (n) n.read = true;
    },
    markAllRead(state) {
      state.list.forEach((n) => {
        n.read = true;
      });
    },
    dismissNotification(state, action) {
      state.list = state.list.filter((n) => n.id !== action.payload);
    },
    addNotification(state, action) {
      state.list.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVerificationNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVerificationNotifications.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.list = payload;
      })
      .addCase(fetchVerificationNotifications.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export const { markRead, markAllRead, dismissNotification, addNotification } =
  notificationsSlice.actions;

export const selectUnreadCount = (state) =>
  state.notifications.list.filter((n) => !n.read).length;

export default notificationsSlice.reducer;
