// src/lib/api/auth.ts
//
// IMPORTANT: loginUser, registerUser, logoutUser, and refreshToken MUST go
// through the Next.js API proxy routes (/api/auth/...) — NOT directly to
// the backend. This is because the backend sets an httpOnly "refresh_token"
// cookie, and cookies are domain-scoped. If the call goes directly to
// ogaos-backend-1.onrender.com, the cookie gets set on Render's domain and
// the browser on ogaos.taskiconnect.com never sees it. Going through /api/*
// (same origin) ensures the cookie is set on the frontend domain.
import api from './client'
import type {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  MeResponse,
  StatesResponse,
  LGAsResponse,
  InviteStaffRequest,
  // Admin types
  AdminLoginRequest,
  AdminLoginResponse,
  AdminOTPVerifyRequest,
  AdminOTPVerifyResponse,
  AdminResendOTPRequest,
  AdminSetupPasswordRequest,
  AdminSetupPasswordResponse,
  AdminProfileResponse,
  AdminMeResponse,
} from './types'

// ─── Auth endpoints (via Next.js proxy — cookie must land on this domain) ────

export const registerUser = async (data: RegisterRequest): Promise<AuthResponse> => {
  const res = await fetch('/api/auth/register', {
    method:      'POST',
    credentials: 'include',
    headers:     { 'Content-Type': 'application/json' },
    body:        JSON.stringify(data),
  })

  const json = await res.json()

  // fetch() does NOT throw on 4xx/5xx — we must check manually.
  // Also guard against a backend that returns HTTP 200 with success: false.
  if (!res.ok || json?.success === false) {
    const message = json?.message || json?.error || 'Registration failed'
    const err = new Error(message) as Error & { response: { data: typeof json } }
    err.response = { data: json }
    throw err
  }

  return json as AuthResponse
}

export const loginUser = async (data: LoginRequest): Promise<AuthResponse> => {
  const res = await fetch('/api/auth/login', {
    method:      'POST',
    credentials: 'include',   // ← ensures Set-Cookie lands on this domain
    headers:     { 'Content-Type': 'application/json' },
    body:        JSON.stringify(data),
  })

  const json = await res.json()

  if (!res.ok || json?.success === false) {
    const message = json?.message || json?.error || 'Login failed'
    const err = new Error(message) as Error & { response: { data: typeof json } }
    err.response = { data: json }
    throw err
  }

  return json as AuthResponse
}

export const logoutUser = () =>
  fetch('/api/auth/logout', {
    method:      'POST',
    credentials: 'include',
  }).then(() => undefined)

export const resendVerification = async (data: { email: string }): Promise<AuthResponse> => {
  const res = await fetch('/api/auth/resend-verification', {
    method:      'POST',
    credentials: 'include',
    headers:     { 'Content-Type': 'application/json' },
    body:        JSON.stringify(data),
  })

  const json = await res.json()

  if (!res.ok || json?.success === false) {
    const message = json?.message || json?.error || 'Failed to resend verification email'
    const err = new Error(message) as Error & { response: { data: typeof json } }
    err.response = { data: json }
    throw err
  }

  return json as AuthResponse
}

// ─── Remaining endpoints (no cookie needed — use axios client normally) ───────

export const verifyEmail = (token: string) =>
  api
    .get<{ success: boolean; message: string }>('/auth/verify', { params: { token } })
    .then((r) => r.data)

export const getMe = () =>
  api.get<{ success: boolean; data: MeResponse }>('/auth/me').then((r) => r.data.data)

export const createStaff = (data: InviteStaffRequest) =>
  api.post<{ success: boolean; message: string }>('/auth/staff', data).then((r) => r.data)

export const deactivateStaff = (staffId: string) =>
  api.delete<{ success: boolean; message: string }>(`/auth/staff/${staffId}`).then((r) => r.data)

// ─── Location helpers ─────────────────────────────────────────────────────────

export const getNigeriaStates = () =>
  api.get<StatesResponse>('/locations/states').then((r) => r.data.data)

export const getNigeriaLGAs = (state: string) =>
  api.get<LGAsResponse>('/locations/lgas', { params: { state } }).then((r) => r.data.data)

// ──────────────────────────────────────────────────────────────────────────────
// PLATFORM ADMIN AUTHENTICATION
// ──────────────────────────────────────────────────────────────────────────────

// Admin login - step 1 (email + password)
export const adminLogin = async (data: AdminLoginRequest): Promise<AdminLoginResponse> => {
  const res = await fetch('/api/admin/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  const json = await res.json()

  if (!res.ok || json?.success === false) {
    const message = json?.message || json?.error || 'Admin login failed'
    const err = new Error(message) as Error & { response: { data: typeof json } }
    err.response = { data: json }
    throw err
  }

  return json as AdminLoginResponse
}

// Admin OTP verification - step 2
export const adminVerifyOTP = async (data: AdminOTPVerifyRequest): Promise<AdminOTPVerifyResponse> => {
  const res = await fetch('/api/admin/auth/verify-otp', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  const json = await res.json()

  if (!res.ok || json?.success === false) {
    const message = json?.message || json?.error || 'OTP verification failed'
    const err = new Error(message) as Error & { response: { data: typeof json } }
    err.response = { data: json }
    throw err
  }

  return json as AdminOTPVerifyResponse
}

// Resend admin OTP
export const adminResendOTP = async (data: AdminResendOTPRequest): Promise<{ success: boolean; message: string }> => {
  const res = await fetch('/api/admin/auth/resend-otp', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  const json = await res.json()

  if (!res.ok || json?.success === false) {
    const message = json?.message || json?.error || 'Failed to resend OTP'
    const err = new Error(message) as Error & { response: { data: typeof json } }
    err.response = { data: json }
    throw err
  }

  return json
}

// Admin password setup (first-time setup)
export const adminSetupPassword = async (data: AdminSetupPasswordRequest): Promise<AdminSetupPasswordResponse> => {
  const res = await fetch('/api/admin/auth/setup-password', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  const json = await res.json()

  if (!res.ok || json?.success === false) {
    const message = json?.message || json?.error || 'Password setup failed'
    const err = new Error(message) as Error & { response: { data: typeof json } }
    err.response = { data: json }
    throw err
  }

  return json
}

// Get admin profile (requires MFA)
export const getAdminMe = async (): Promise<AdminMeResponse> => {
  const res = await fetch('/api/admin/me', {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const json = await res.json()

  if (!res.ok || json?.success === false) {
    const message = json?.message || json?.error || 'Failed to fetch admin profile'
    const err = new Error(message) as Error & { response: { data: typeof json } }
    err.response = { data: json }
    throw err
  }

  return json.data as AdminMeResponse
}

// Admin logout
export const adminLogout = () =>
  fetch('/api/admin/auth/logout', {
    method: 'POST',
    credentials: 'include',
  }).then(() => undefined)