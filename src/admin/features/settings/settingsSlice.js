import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  commissionRate: 15,
  depositRate: 30,
  featuredListingPrice: 2500,
  autoApproveEnabled: false,
  maintenanceMode: false,
  notificationsEnabled: true,
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
    toggleMaintenance(state) {
      state.maintenanceMode = !state.maintenanceMode
    },
    toggleNotifications(state) {
      state.notificationsEnabled = !state.notificationsEnabled
    },
  },
})

export const {
  updateCommissionRate,
  updateDepositRate,
  updateFeaturedPrice,
  toggleAutoApprove,
  toggleMaintenance,
  toggleNotifications,
} = settingsSlice.actions

export default settingsSlice.reducer
