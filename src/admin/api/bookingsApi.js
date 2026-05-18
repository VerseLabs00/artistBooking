import api from './axios'

// GET /api/admin/bookings
export const getBookingsApi = (params = {}) =>
  api.get('/admin/bookings', { params })

// GET /api/admin/bookings/:id
export const getBookingApi = (id) =>
  api.get(`/admin/bookings/${id}`)

// PUT /api/admin/bookings/:id/status  (body: { status })
export const updateBookingStatusApi = (id, status) =>
  api.put(`/admin/bookings/${id}/status`, { status })
