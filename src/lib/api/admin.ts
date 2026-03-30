// src/lib/api/admin.ts
//
// All calls go to Next.js API proxy routes (/api/admin/*).
// The proxy (src/lib/api/proxy.ts) forwards them server-side to the Go backend,
// keeping the real backend URL and httpOnly cookies off the browser entirely.

import api from './adminClient'
import type {
  AdminLoginPayload,
  AdminLoginApiResponse,
  AdminVerifyOTPPayload,
  AdminVerifyOTPResponse,
  AdminSetupPasswordPayload,
  AdminResendOTPPayload,
  AdminProfileApiResponse,
  AdminListApiResponse,
  InviteAdminPayload,
  UpdateAdminPayload,
  ApiResponse,
  CreateCouponPayload,
  UpdateCouponPayload,
  CouponApiResponse,
  CouponListApiResponse,
} from '@/types/admin'

// ── Auth flow ─────────────────────────────────────────────────────────────────

export async function adminLogin(payload: AdminLoginPayload): Promise<AdminLoginApiResponse> {
  const res = await api.post<AdminLoginApiResponse>('/api/admin/auth/login', payload)
  return res.data
}

export async function adminVerifyOTP(payload: AdminVerifyOTPPayload): Promise<AdminVerifyOTPResponse> {
  const res = await api.post<AdminVerifyOTPResponse>('/api/admin/auth/verify-otp', payload)
  return res.data
}

export async function adminResendOTP(payload: AdminResendOTPPayload): Promise<ApiResponse> {
  const res = await api.post<ApiResponse>('/api/admin/auth/resend-otp', payload)
  return res.data
}

// Refresh goes via fetch (not axios) so the httpOnly admin_refresh_token cookie
// is forwarded correctly — same pattern as the user refresh in client.ts.
export async function adminRefreshToken(): Promise<AdminVerifyOTPResponse> {
  const res = await fetch('/api/admin/auth/refresh', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.message || 'Token refresh failed')
  }
  return res.json()
}

export async function adminLogout(): Promise<ApiResponse> {
  const res = await api.post<ApiResponse>('/api/admin/auth/logout')
  return res.data
}

export async function adminSetupPassword(payload: AdminSetupPasswordPayload): Promise<ApiResponse> {
  const res = await api.post<ApiResponse>('/api/admin/auth/setup-password', payload)
  return res.data
}

// ── Admin profile ─────────────────────────────────────────────────────────────

export async function getAdminProfile(): Promise<AdminProfileApiResponse> {
  const res = await api.get<AdminProfileApiResponse>('/api/admin/auth/me')
  return res.data
}

// ── Admin management (super_admin only) ──────────────────────────────────────

export async function inviteAdmin(payload: InviteAdminPayload): Promise<ApiResponse> {
  const res = await api.post<ApiResponse>('/api/admin/admins/invite', payload)
  return res.data
}

export async function listAdmins(): Promise<AdminListApiResponse> {
  const res = await api.get<AdminListApiResponse>('/api/admin/admins')
  return res.data
}

export async function getAdmin(id: string): Promise<AdminProfileApiResponse> {
  const res = await api.get<AdminProfileApiResponse>(`/api/admin/admins/${id}`)
  return res.data
}

export async function updateAdmin(id: string, payload: UpdateAdminPayload): Promise<ApiResponse> {
  const res = await api.patch<ApiResponse>(`/api/admin/admins/${id}`, payload)
  return res.data
}

export async function deactivateAdmin(id: string): Promise<ApiResponse> {
  const res = await api.delete<ApiResponse>(`/api/admin/admins/${id}`)
  return res.data
}

// ── Coupons (super_admin + support for reads) ─────────────────────────────────

export async function listCoupons(): Promise<CouponListApiResponse> {
  const res = await api.get<CouponListApiResponse>('/api/admin/coupons')
  return res.data
}

export async function getCoupon(id: string): Promise<CouponApiResponse> {
  const res = await api.get<CouponApiResponse>(`/api/admin/coupons/${id}`)
  return res.data
}

export async function createCoupon(payload: CreateCouponPayload): Promise<CouponApiResponse> {
  const res = await api.post<CouponApiResponse>('/api/admin/coupons', payload)
  return res.data
}

export async function updateCoupon(id: string, payload: UpdateCouponPayload): Promise<ApiResponse> {
  const res = await api.patch<ApiResponse>(`/api/admin/coupons/${id}`, payload)
  return res.data
}

export async function deleteCoupon(id: string): Promise<ApiResponse> {
  const res = await api.delete<ApiResponse>(`/api/admin/coupons/${id}`)
  return res.data
}