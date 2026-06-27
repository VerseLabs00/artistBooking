import api from './axios'

export const settingsApi = {
   async getSettings() {
     const response = await api.get('/admin/settings')
     return response.data
   },

   async updateSettings(settings) {
     const response = await api.put('/admin/settings', settings)
     return response.data
   },

   async toggleMaintenance(enabled) {
     const response = await api.put('/admin/settings', { maintenance_mode: enabled })
     return response.data
   },
}
