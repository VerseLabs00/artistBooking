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

// DELETE /api/admin/bookings/:id
export const deleteBookingApi = (id) =>
  api.delete(`/admin/bookings/${id}`)

// GET /api/admin/due-payments
export const getDuePaymentsApi = (params = {}) =>
  api.get('/admin/due-payments', { params })

// POST /api/admin/due-payments/:id/mark-sent
export const markAdvanceSentApi = (id) =>
  api.post(`/admin/due-payments/${id}/mark-sent`)
