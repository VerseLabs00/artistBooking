import api from './axios'

// GET /api/admin/artists?status=&search=&per_page=
export const getArtistsApi = (params = {}) =>
  api.get('/admin/artists', { params })

// GET /api/admin/artists/:id
export const getArtistApi = (id) =>
  api.get(`/admin/artists/${id}`)

// PUT /api/admin/artists/:id/verify  body: { status: 'approved'|'rejected' }
export const verifyArtistApi = (id, status) =>
  api.put(`/admin/artists/${id}/verify`, { status })

// PUT /api/admin/artists/:id/toggle-onboard
export const toggleOnboardApi = (id) =>
  api.put(`/admin/artists/${id}/toggle-onboard`)

// DELETE /api/admin/artists/:id
export const deleteArtistApi = (id) =>
  api.delete(`/admin/artists/${id}`)
