import type { ApiResponse } from '@/types/admin'

export interface AdminBusinessOwner {
  id: string
  name: string
  email: string
  phone_number: string
}

export interface AdminBusinessStaff {
  id: string
  name: string
  email: string
  role: string
  is_active: boolean
  joined_at: string
}

export interface AdminBusinessSubscription {
  plan: 'free' | 'growth' | 'pro' | 'custom' | string
  status: 'active' | 'expired' | 'cancelled' | 'grace_period' | string
  current_period_start: string | null
  current_period_end: string | null
  grace_period_ends_at: string | null
  max_staff: number
  max_stores: number
  max_products: number
  max_customers: number
}

// Matches the flattened JSON from GET /admin/businesses (models.Business is
// embedded without a json tag on the Go side, so its fields sit at the top level).
export interface AdminBusinessListItem {
  id: string
  name: string
  slug: string
  category: string
  description: string | null
  logo_url: string | null
  website_url: string | null
  street: string
  city_town: string
  local_government: string
  state: string
  country: string
  status: string
  is_profile_public: boolean
  profile_views: number
  is_verified: boolean
  gallery_image_urls: string
  storefront_video_url: string | null
  created_at: string
  updated_at: string
  owner: AdminBusinessOwner | null
  subscription: AdminBusinessSubscription | null
}

export interface AdminBusinessDetail extends AdminBusinessListItem {
  staff: AdminBusinessStaff[]
}

export interface AdminBusinessListParams {
  search?: string
  status?: string
  is_verified?: boolean
  plan?: string
  subscription_status?: string
  cursor?: string
  limit?: number
}

// ── API response envelopes, matching AdminListApiResponse / AdminProfileApiResponse ──
// ApiResponse is generic (ApiResponse<T>, defaulting to null) — pass the data
// type as the type argument rather than extending + redeclaring `data`,
// which TypeScript rejects since the base `data: null` can't widen.

export type AdminBusinessListApiResponse = ApiResponse<AdminBusinessListItem[]> & {
  next_cursor: string | null
}

export type AdminBusinessApiResponse = ApiResponse<AdminBusinessDetail>

export type AdminBusinessSubscriptionApiResponse = ApiResponse<AdminBusinessSubscription>
