import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import artistsReducer from '../features/artists/artistsSlice'
import verificationReducer from '../features/verification/verificationSlice'
import customersReducer from '../features/customers/customersSlice'
import bookingsReducer from '../features/bookings/bookingsSlice'
import settingsReducer from '../features/settings/settingsSlice'
import notificationsReducer from '../features/notifications/notificationsSlice'
import dashboardReducer from '../features/dashboard/dashboardSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    artists: artistsReducer,
    verification: verificationReducer,
    customers: customersReducer,
    bookings: bookingsReducer,
    settings: settingsReducer,
    notifications: notificationsReducer,
    dashboard: dashboardReducer,
  },
})
