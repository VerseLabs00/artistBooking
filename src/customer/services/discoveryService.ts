import api from '../lib/api'

export interface ArtistCard {
  id: string
  stage_name: string
  category: string
  location: string
  avatar_url: string | null
  cover_url: string | null
  full_price: number | null
  advance: number | null
  tags: string[]
  short_bio: string | null
  verification_status: string | null
}

export interface ArtistDetail extends ArtistCard {
  full_name: string
  bio_1: string | null
  bio_2: string | null
  paragraph: string | null
  youtube_link: string | null
  facebook_link: string | null
  instagram_link: string | null
  spotify_link: string | null
  verification_status: string
  rating: {
    average: number | null
    total: number
    distribution: Record<number, number>
    recent_reviews: Review[]
  }
  media: Media[]
  gallery: Media[]
}

export interface Media {
  id: string
  media_type: string
  url: string
  title?: string | null
  is_external_link: boolean
}

export interface Review {
  id: string
  rating: number
  title: string | null
  body: string | null
  reviewer_name: string
  reviewer_avatar?: string | null
  created_at: string
}

export interface PaginatedMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export const getCategories = (): Promise<string[]> =>
  api.get('/discovery/categories').then(r => r.data.categories)

export const getStats = (): Promise<{ total_artists: number; sample_avatars: string[] }> =>
  api.get('/discovery/stats').then(r => r.data)

export interface ArtistSearchParams {
  category?: string
  search?: string
  location?: string
  event_date?: string
  max_budget?: number
  per_page?: number
  page?: number
}

export const getArtists = (
  params?: ArtistSearchParams,
): Promise<{ data: ArtistCard[]; meta: PaginatedMeta }> =>
  api.get('/discovery/artists', { params }).then(r => r.data)

export const getNearYou = (
  location: string,
  per_page = 12,
): Promise<{ data: ArtistCard[]; meta: PaginatedMeta }> =>
  api.get('/discovery/near-you', { params: { location, per_page } }).then(r => r.data)

export const getArtist = (id: string): Promise<ArtistDetail> =>
  api.get(`/discovery/artists/${id}`).then(r => r.data.artist)

export const submitReview = (
  artistId: string,
  payload: { rating: number; title?: string; body?: string },
): Promise<Review> =>
  api.post(`/discovery/artists/${artistId}/reviews`, payload).then(r => r.data.review)

export interface CalendarEntry {
  id: string
  date: string
  title: string
  description?: string | null
  source: 'booking' | 'manual'
  status?: string
  editable?: boolean
}

export const getArtistCalendar = (
  artistId: string,
  month: string,
): Promise<CalendarEntry[]> =>
  api.get(`/discovery/artists/${artistId}/calendar`, { params: { month } }).then(r => r.data.entries ?? [])