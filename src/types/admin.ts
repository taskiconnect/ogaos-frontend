// src/types/admin.ts

// ── Roles ─────────────────────────────────────────────────────────────────────

export type AdminRole = 'super_admin' | 'support' | 'finance'

// ── Admin profile ─────────────────────────────────────────────────────────────
// Mirrors AdminProfile in internal/service/admin_auth/admin_auth.go

export interface AdminProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  role: AdminRole
  is_active: boolean
  password_set: boolean
  last_login_at: string | null
  created_at: string
}

// ── Auth flow ─────────────────────────────────────────────────────────────────

export interface AdminLoginPayload {
  email: string
  password: string
}

export interface AdminLoginResponse {
  otp_required: boolean
  temp_token: string
  message: string
}

export interface AdminVerifyOTPPayload {
  temp_token: string
  otp: string
}

export interface AdminVerifyOTPResponse {
  access_token: string
  message: string
}

export interface AdminSetupPasswordPayload {
  token: string
  password: string
}

export interface AdminResendOTPPayload {
  temp_token: string
}

// ── Admin management ──────────────────────────────────────────────────────────

export interface InviteAdminPayload {
  email: string
  first_name: string
  last_name: string
  role: AdminRole
}

export interface UpdateAdminPayload {
  role?: AdminRole
  is_active?: boolean
}

// ── Coupons ───────────────────────────────────────────────────────────────────
// Mirrors the coupon handler + service in the Go backend

export interface Coupon {
  id: string
  code: string
  description: string
  discount_value: number           // integer 1-100 (percentage)
  applicable_plans: string[]
  starts_at: string                // ISO 8601
  expires_at: string               // ISO 8601
  max_redemptions: number          // 0 = unlimited
  redemptions: number              // live count from List endpoint
  remaining: number                // max_redemptions - redemptions (0 if unlimited)
  is_active: boolean
  created_at: string
}

export interface CreateCouponPayload {
  code: string
  description?: string
  discount_value: number
  applicable_plans: string[]
  starts_at: string                // RFC3339
  expires_at: string               // RFC3339
  max_redemptions: number
}

export type UpdateCouponPayload = Partial<CreateCouponPayload> & {
  is_active?: boolean
}

// ── API response wrappers ─────────────────────────────────────────────────────

export interface ApiResponse<T = null> {
  success: boolean
  message: string
  data?: T
}

export interface AdminLoginApiResponse    extends ApiResponse<AdminLoginResponse>  {}
export interface AdminProfileApiResponse  extends ApiResponse<AdminProfile>        {}
export interface AdminListApiResponse     extends ApiResponse<AdminProfile[]>      {}
export interface CouponApiResponse        extends ApiResponse<Coupon>              {}
export interface CouponListApiResponse    extends ApiResponse<Coupon[]>            {}