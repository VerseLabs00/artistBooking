import api from './axios'

// GET /api/admin/customers
export const getCustomersApi = (params = {}) =>
  api.get('/admin/customers', { params })

// GET /api/admin/customers/:id
export const getCustomerApi = (id) =>
  api.get(`/admin/customers/${id}`)
