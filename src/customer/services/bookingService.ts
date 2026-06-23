import api from '../lib/api'

export interface InitiateBookingPayload {
  artist_profile_id: string
  event_date: string
  event_start_time: string
  event_type: string
  venue: string
  customer_phone: string
  event_duration_hours?: number
  venue_lat?: number
  venue_lng?: number
  special_notes?: string
}

export interface BookingSummary {
  id: string
  order_id: string
  agreed_price: number
  advance_amount: number
  booking_status: string
  payment_status: string
}

export interface PayhereData {
  checkout_url: string
  merchant_id: string
  order_id: string
  items: string
  amount: string
  currency: string
  hash: string
  first_name: string
  last_name: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  notify_url: string
  return_url: string
  cancel_url: string
}

export interface InitiateBookingResponse {
  booking: BookingSummary
  payhere: PayhereData
}

export const initiateBooking = (payload: InitiateBookingPayload): Promise<InitiateBookingResponse> =>
  api.post('/bookings/initiate', payload).then(r => r.data)

export const getBookings = (): Promise<{ data: BookingSummary[] }> =>
  api.get('/bookings').then(r => r.data)

export const getBooking = (id: string) =>
  api.get(`/bookings/${id}`).then(r => r.data.booking)

export const cancelBooking = (id: string): Promise<void> =>
  api.post(`/bookings/${id}/cancel`).then(() => {})