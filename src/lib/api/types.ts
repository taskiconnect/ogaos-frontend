// src/lib/api/types.ts

export interface RegisterRequest {
  first_name: string
  last_name: string
  phone_number: string
  email: string
  password: string
  business_name: string
  business_category: string
  address?: string
  referral_code?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  access_token?: string     // might not be returned if httpOnly
  refresh_token?: string    // might not be returned
  message?: string          // success message
}

export interface ErrorResponse {
  error: string
}