// src/lib/api/auth.ts
import api from './client'
import {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  MeResponse,
  StatesResponse,
  LGAsResponse,
  InviteStaffRequest,   // ← added
} from './types'

export const registerUser = async (data: RegisterRequest): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>('/auth/register', data)
  return res.data
}

export const loginUser = async (data: LoginRequest): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>('/auth/login', data)
  return res.data
}

export const refreshToken = async (): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>('/auth/refresh')
  return res.data
}

export const logoutUser = async (): Promise<void> => {
  await api.post('/auth/logout')
}

export const verifyEmail = async (token: string): Promise<{ success: boolean; message: string }> => {
  const res = await api.get<{ success: boolean; message: string }>('/auth/verify', {
    params: { token },
  })
  return res.data
}

export const getMe = async (): Promise<MeResponse> => {
  const res = await api.get<{ success: boolean; data: MeResponse }>('/auth/me')
  return res.data.data
}

// ────────────────────────────────────────────────
// Location helpers (used during signup)
// ────────────────────────────────────────────────

export const getNigeriaStates = async (): Promise<string[]> => {
  const res = await api.get<StatesResponse>('/locations/states')
  return res.data.data
}

export const getNigeriaLGAs = async (state: string): Promise<string[]> => {
  const res = await api.get<LGAsResponse>('/locations/lgas', {
    params: { state },
  })
  return res.data.data
}

// ────────────────────────────────────────────────
// Staff Management (Owner only) — added from your backend
// ────────────────────────────────────────────────

export const createStaff = async (data: InviteStaffRequest) => {
  const res = await api.post('/staff', data)
  return res.data
}

export const deactivateStaff = async (id: string): Promise<void> => {
  await api.delete(`/staff/${id}`)
}