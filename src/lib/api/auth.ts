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
  RegisterRequest, LoginRequest,
  AuthResponse, MeResponse, StatesResponse, LGAsResponse, InviteStaffRequest,
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