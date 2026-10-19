// src/lib/api/auth.ts
//
// IMPORTANT: loginUser, registerUser, logoutUser, refreshToken, resendVerification,
// verifyEmail, forgotPassword and resetPassword MUST go through the Next.js API proxy
// routes (/api/auth/...) — NOT directly to the backend. This keeps auth cookies and
// auth flows on the frontend domain.

import api from './client'
import type {
  AuthResponse,
  ForgotPasswordRequest,
  InviteStaffRequest,
  LGAsResponse,
  LoginRequest,
  MeResponse,
  MessageResponse,
  RegisterRequest,
  ResetPasswordRequest,
  StatesResponse,
} from './types'

// ─── Auth endpoints (via Next.js proxy — cookie must land on this domain) ────

export const registerUser = async (data: RegisterRequest): Promise<AuthResponse> => {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  const json = await res.json()

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
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
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
    method: 'POST',
    credentials: 'include',
  }).then(() => undefined)

export const resendVerification = async (data: { email: string }): Promise<AuthResponse> => {
  const res = await fetch('/api/auth/resend-verification', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
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

export const verifyEmail = async (
  token: string,
): Promise<{ success: boolean; message: string }> => {
  const res = await fetch('/api/auth/verify', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  })

  const json = await res.json()

  if (!res.ok || json?.success === false) {
    const message = json?.message || json?.error || 'Verification failed'
    const err = new Error(message) as Error & { response: { data: typeof json } }
    err.response = { data: json }
    throw err
  }

  return json as { success: boolean; message: string }
}

// ─── Password reset (via Next.js proxy) ──────────────────────────────────────

/**
 * Error thrown by the password-reset calls. `status` is the HTTP status and
 * `response.data` is the parsed JSON body, so callers can read `data.code`
 * (e.g. "invalid_token") as well as the message.
 */
export type AuthRequestError = Error & {
  status: number
  response: { status: number; data: Record<string, unknown> }
}

async function postAuthJson(
  path: string,
  body: unknown,
  fallbackMessage: string,
): Promise<MessageResponse> {
  const res = await fetch(path, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  // Proxy/gateway errors may not return JSON — never let that mask the real status.
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>

  if (!res.ok || json?.success === false) {
    const message =
      (typeof json?.message === 'string' && json.message) ||
      (typeof json?.error === 'string' && json.error) ||
      fallbackMessage
    const err = new Error(message) as AuthRequestError
    err.status = res.status
    err.response = { status: res.status, data: json }
    throw err
  }

  return json as unknown as MessageResponse
}

/**
 * Request a password reset email. The backend always answers 200 for well-formed
 * requests (no account enumeration), so success never means the account exists.
 */
export const forgotPassword = (data: ForgotPasswordRequest): Promise<MessageResponse> =>
  postAuthJson(
    '/api/auth/forgot-password',
    { email: data.email.trim().toLowerCase() },
    'Could not send the reset link',
  )

/** Set a new password using the single-use token from the emailed link. */
export const resetPassword = (data: ResetPasswordRequest): Promise<MessageResponse> =>
  postAuthJson('/api/auth/reset-password', data, 'Could not reset your password')

// ─── Protected user endpoints (axios client with bearer token) ───────────────

export const getMe = () =>
  api.get<{ success: boolean; data: MeResponse }>('/auth/me').then((r) => r.data.data)

export const createStaff = (data: InviteStaffRequest) =>
  api.post<{ success: boolean; message: string }>('/staff', data).then((r) => r.data)

export const deactivateStaff = (staffId: string) =>
  api.delete<{ success: boolean; message: string }>(`/staff/${staffId}`).then((r) => r.data)

// Optional helper if you need it in the UI
export const listStaff = () =>
  api.get<{ success: boolean; data: unknown[] }>('/staff').then((r) => r.data.data)

// ─── Location helpers ─────────────────────────────────────────────────────────

export const getNigeriaStates = () =>
  api.get<StatesResponse>('/locations/states').then((r) => r.data.data)

export const getNigeriaLGAs = (state: string) =>
  api.get<LGAsResponse>('/locations/lgas', { params: { state } }).then((r) => r.data.data)