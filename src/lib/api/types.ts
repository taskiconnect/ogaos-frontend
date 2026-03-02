// src/lib/api/types.ts

// ────────────────────────────────────────────────
// Auth / Register
// ────────────────────────────────────────────────

export interface RegisterRequest {
  first_name: string
  last_name: string
  phone_number: string
  email: string
  password: string
  business_name: string
  business_category: string
  street?: string
  city_town?: string
  local_government?: string
  state?: string
  country?: string
  referral_code?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  access_token?: string
  message?: string
}

// ────────────────────────────────────────────────
// Me / Profile
// ────────────────────────────────────────────────

export interface BusinessProfile {
  id: string
  name: string
  category: string
  status: string
  street: string
  city_town: string
  local_government: string
  state: string
  country: string
}

export interface MeResponse {
  id: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
  email_verified_at: string | null
  is_active: boolean
  role: 'owner' | 'staff' | 'platform_admin' | string
  is_platform: boolean
  created_at: string
  business?: BusinessProfile
}

// ────────────────────────────────────────────────
// Locations
// ────────────────────────────────────────────────

export interface StatesResponse {
  success: boolean
  data: string[]
}

export interface LGAsResponse {
  success: boolean
  state: string
  data: string[]
}

// ────────────────────────────────────────────────
// Errors
// ────────────────────────────────────────────────

export interface ErrorResponse {
  success: false
  message: string
}