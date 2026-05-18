import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list: [
    {
      id: 1,
      type: "verification", // verification | booking | artist | customer | system
      title: "New Verification Request",
      message: "Nirmala Kumari submitted a verification application.",
      time: "2 min ago",
      read: false,
      link: "/verification",
    },
    {
      id: 2,
      type: "booking",
      title: "Booking Cancelled",
      message: "Booking #BK-2838 was cancelled by Kavya Nair.",
      time: "15 min ago",
      read: false,
      link: "/bookings/%23BK-2838",
    },
    {
      id: 3,
      type: "verification",
      title: "New Verification Request",
      message: "Tharindu Perera re-submitted their verification.",
      time: "1 hr ago",
      read: false,
      link: "/verification",
    },
    {
      id: 4,
      type: "artist",
      title: "Artist Suspended",
      message: "Sarah Bands account was suspended due to disputes.",
      time: "3 hr ago",
      read: true,
      link: "/artists/4",
    },
    {
      id: 5,
      type: "booking",
      title: "New Booking Confirmed",
      message: "Tom Wilson confirmed booking #BK-2837 with MC Royal.",
      time: "5 hr ago",
      read: true,
      link: "/bookings/%23BK-2837",
    },
    {
      id: 6,
      type: "customer",
      title: "Customer Banned",
      message: "Dilan Silva was banned for abusive behaviour.",
      time: "1 day ago",
      read: true,
      link: "/customers/7",
    },
    {
      id: 7,
      type: "system",
      title: "Commission Rate Updated",
      message: "Platform commission rate changed to 15%.",
      time: "2 days ago",
      read: true,
      link: "/settings",
    },
  ],
};

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
});

export const { markRead, markAllRead, dismissNotification, addNotification } =
  notificationsSlice.actions;

export const selectUnreadCount = (state) =>
  state.notifications.list.filter((n) => !n.read).length;

export default notificationsSlice.reducer;
