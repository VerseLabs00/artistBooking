import api from '../lib/api'

export interface ArtistCard {
  id: string
  stage_name: string
  category: string
  location: string
  avatar_url: string | null
  cover_url: string | null
  starting_price: number | null
  max_price: number | null
  tags: string[]
  short_bio: string | null
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
  is_external_link: boolean
}

export interface Review {
  id: string
  rating: number
  title: string | null
  body: string | null
  reviewer_name: string
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