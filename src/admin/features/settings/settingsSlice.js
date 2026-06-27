import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  commissionRate: 15,
  depositRate: 30,
  featuredListingPrice: 2500,
  autoApproveEnabled: false,
  notificationsEnabled: true,
  maintenanceMode: false,
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateCommissionRate(state, action) {
      state.commissionRate = action.payload
    },
    updateDepositRate(state, action) {
      state.depositRate = action.payload
    },
    updateFeaturedPrice(state, action) {
      state.featuredListingPrice = action.payload
    },
    toggleAutoApprove(state) {
      state.autoApproveEnabled = !state.autoApproveEnabled
    },
    toggleNotifications(state) {
      state.notificationsEnabled = !state.notificationsEnabled
    },
    setMaintenanceMode(state, action) {
      state.maintenanceMode = action.payload
    },
  },
})

export const {
  updateCommissionRate,
  updateDepositRate,
  updateFeaturedPrice,
  toggleAutoApprove,
  toggleNotifications,
  setMaintenanceMode,
} = settingsSlice.actions

export default settingsSlice.reducer
