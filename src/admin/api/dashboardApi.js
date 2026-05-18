import api from './axios'

// GET /api/admin/dashboard/stats
export const getDashboardStatsApi = () =>
  api.get('/admin/dashboard/stats')
