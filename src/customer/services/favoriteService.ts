import api from '../lib/api'

export interface FavoriteArtist {
    id: string
    name: string
    category: string
    location: string
    avatar_url: string | null
    full_price: number | null
    advance: number | null
    verification_status: string | null
}

export interface FavoriteCustomer {
    id: string
    name: string
    email: string
    avatar_url: string | null
    favorited_at: string
}

export const toggleFavorite = (artistProfileId: string): Promise<{ is_favorited: boolean }> =>
    api.post('/favorites/toggle', { artist_profile_id: artistProfileId }).then(r => r.data)

export const getFavorites = (): Promise<FavoriteArtist[]> =>
    api.get('/favorites').then(r => r.data.favorites)

export const getCustomersWhoFavorited = (artistProfileId: string): Promise<{ customers: FavoriteCustomer[]; total: number }> =>
    api.get(`/favorites/customers/${artistProfileId}`).then(r => r.data)
