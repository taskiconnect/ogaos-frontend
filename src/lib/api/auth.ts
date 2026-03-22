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

export const registerUser = (data: RegisterRequest) =>
  fetch('/api/auth/register', {
    method:      'POST',
    credentials: 'include',
    headers:     { 'Content-Type': 'application/json' },
    body:        JSON.stringify(data),
  }).then(r => r.json()) as Promise<AuthResponse>

export const loginUser = (data: LoginRequest) =>
  fetch('/api/auth/login', {
    method:      'POST',
    credentials: 'include',   // ← ensures Set-Cookie lands on this domain
    headers:     { 'Content-Type': 'application/json' },
    body:        JSON.stringify(data),
  }).then(r => r.json()) as Promise<AuthResponse>

export const logoutUser = () =>
  fetch('/api/auth/logout', {
    method:      'POST',
    credentials: 'include',
  }).then(() => undefined)

export const resendVerification = (data: { email: string }) =>
  fetch('/api/auth/resend-verification', {
    method:      'POST',
    credentials: 'include',
    headers:     { 'Content-Type': 'application/json' },
    body:        JSON.stringify(data),
  }).then(r => r.json()) as Promise<AuthResponse>

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