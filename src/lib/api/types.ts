// src/lib/api/types.ts

// ─── Response envelopes ───────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true
  data: T
}

export interface ApiMessage {
  success: true
  message: string
}

export interface ApiError {
  success: false
  message: string
}

export interface ApiCursorList<T> {
  success: true
  data: T[]
  next_cursor: string | null
}

export interface CursorParams {
  cursor?: string
  limit?: number
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

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

export interface StatesResponse {
  success: boolean
  data: string[]
}

export interface LGAsResponse {
  success: boolean
  state: string
  data: string[]
}

export interface ErrorResponse {
  success: false
  message: string
}

// ─── Admin Auth ───────────────────────────────────────────────────────────────

export interface AdminLoginRequest {
  email: string
  password: string
}

export interface AdminLoginResponse {
  success: boolean
  data: {
    otp_required: boolean
    temp_token: string
    message: string
  }
}

export interface AdminOTPVerifyRequest {
  temp_token: string
  otp: string
}

export interface AdminOTPVerifyResponse {
  success: boolean
  access_token: string
  message: string
}

export interface AdminResendOTPRequest {
  temp_token: string
}

export interface AdminSetupPasswordRequest {
  token: string
  password: string
}

export interface AdminSetupPasswordResponse {
  success: boolean
  message: string
}

export interface AdminProfileResponse {
  success: boolean
  data: {
    admin_id: string
    email: string
    role: string
  }
}

export interface AdminMeResponse extends MeResponse {
  is_platform: true
  mfa_verified: boolean
}

// ─── Business ─────────────────────────────────────────────────────────────────

export interface Business {
  id: string
  name: string
  category: string
  slug: string
  description: string | null
  logo_url: string | null
  website_url: string | null
  street: string | null
  city_town: string | null
  local_government: string | null
  state: string | null
  country: string | null
  is_profile_public: boolean
  is_verified: boolean
  status: string
  gallery_image_urls: string
  storefront_video_url: string | null
  created_at: string
  updated_at: string
}

export interface UpdateBusinessRequest {
  name?: string
  category?: string
  description?: string
  website_url?: string
  street?: string
  city_town?: string
  local_government?: string
  state?: string
  country?: string
}

// ─── Subscription ─────────────────────────────────────────────────────────────

export type SubscriptionPlan = 'free' | 'growth' | 'pro' | 'custom'

export type SubscriptionStatus =
  | 'active'
  | 'expired'
  | 'cancelled'
  | 'grace_period'

export interface Subscription {
  id: string
  business_id: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  current_period_start: string | null
  current_period_end: string | null
  grace_period_ends_at: string | null
  max_staff: number
  max_stores: number
  max_products: number
  max_customers: number
  created_at: string
  updated_at: string
}

export interface CouponValidationData {
  coupon_code?: string
  original_amount: number
  discount_amount: number
  final_amount: number
  discount_type?: 'percentage' | 'fixed'
  discount_value?: number
}

export interface ValidateSubscriptionCouponRequest {
  plan: SubscriptionPlan
  period_months: number
  coupon_code: string
  original_amount: number
}

export interface InitiateSubscriptionRequest {
  plan: SubscriptionPlan
  period_months: number
  coupon_code?: string
}

export interface InitiateSubscriptionData {
  reference: string
  amount: number
  plan: SubscriptionPlan
  period_months: number
  coupon?: CouponValidationData
  activated?: boolean
  needs_payment?: boolean
  message?: string
  paystack_authorization_url?: string
}

// ─── NEW: Verify Subscription Types ───────────────────────────────────────────

export interface VerifySubscriptionRequest {
  /** Paystack transaction reference returned after the payment redirect */
  reference: string
}

export type VerifySubscriptionData = Subscription

// ─── Store ────────────────────────────────────────────────────────────────────

export interface Store {
  id: string
  business_id: string
  name: string
  description: string | null
  street: string | null
  city_town: string | null
  state: string | null
  phone: string | null
  is_default: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateStoreRequest {
  name: string
  description?: string
  street?: string
  city_town?: string
  state?: string
  phone?: string
}

export interface UpdateStoreRequest {
  name?: string
  description?: string
  street?: string
  city_town?: string
  state?: string
  phone?: string
}

// ─── Customer ─────────────────────────────────────────────────────────────────

export interface Customer {
  id: string
  business_id: string
  first_name: string
  last_name: string
  email: string | null
  phone_number: string | null
  address: string | null
  notes: string | null
  total_purchases: number
  total_orders: number
  outstanding_debt: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateCustomerRequest {
  first_name: string
  last_name: string
  email?: string
  phone_number?: string
  address?: string
  notes?: string
}

export interface UpdateCustomerRequest {
  first_name?: string
  last_name?: string
  email?: string
  phone_number?: string
  address?: string
  notes?: string
}

export interface CustomerListParams extends CursorParams {
  search?: string
}

// ─── Product ──────────────────────────────────────────────────────────────────

export interface Product {
  id: string
  business_id: string
  store_id: string | null
  name: string
  description: string | null
  type: 'product' | 'service' | string
  sku: string | null
  price: number
  cost_price: number | null
  image_url: string | null
  track_inventory: boolean
  stock_quantity: number
  low_stock_threshold: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateProductRequest {
  store_id?: string
  name: string
  description?: string
  type: 'product' | 'service'
  sku?: string
  price: number
  cost_price?: number
  track_inventory?: boolean
  stock_quantity?: number
  low_stock_threshold?: number
}

export interface UpdateProductRequest {
  name?: string
  description?: string
  sku?: string
  price?: number
  cost_price?: number
  track_inventory?: boolean
  low_stock_threshold?: number
  is_active?: boolean
}

export interface AdjustStockRequest {
  adjustment: number
  reason?: string
}

export interface ProductListParams extends CursorParams {
  store_id?: string
  type?: 'product' | 'service'
  search?: string
  low_stock?: boolean
}

// ─── Sale ─────────────────────────────────────────────────────────────────────

export interface SaleItem {
  id: string
  sale_id: string
  product_id: string | null
  product_name: string
  product_sku: string | null
  unit_price: number
  quantity: number
  discount: number
  total_price: number
}

export interface Sale {
  id: string
  business_id: string
  store_id: string | null
  customer_id: string | null
  invoice_id: string | null
  recorded_by: string
  staff_name: string | null
  sale_number: string
  receipt_number: string | null
  sub_total: number
  discount_amount: number
  vat_rate: number
  vat_inclusive: boolean
  vat_amount: number
  wht_rate: number
  wht_amount: number
  total_amount: number
  amount_paid: number
  balance_due: number
  payment_method: string
  status: 'completed' | 'partial' | 'cancelled' | string
  notes: string | null
  receipt_sent_at: string | null
  created_at: string
  updated_at: string
  customer?: Customer
  items?: SaleItem[]
}

export interface WalkInCustomer {
  first_name: string
  last_name: string
  phone: string
  email?: string
}

export interface CreateSaleItemRequest {
  product_id?: string
  product_name: string
  product_sku?: string
  unit_price: number
  quantity: number
  discount?: number
}

export interface CreateSaleRequest {
  store_id?: string
  customer_id?: string
  invoice_id?: string
  walk_in_customer?: WalkInCustomer
  staff_name?: string
  items: CreateSaleItemRequest[]
  payment_method: string
  amount_paid: number
  discount_amount?: number
  vat_rate?: number
  vat_inclusive?: boolean
  wht_rate?: number
  send_receipt_email?: boolean
  notes?: string
}

export interface SaleListParams extends CursorParams {
  store_id?: string
  customer_id?: string
  status?: string
  date_from?: string
  date_to?: string
}

// ─── Invoice ──────────────────────────────────────────────────────────────────

export interface InvoiceItem {
  id: string
  invoice_id: string
  product_id: string | null
  description: string
  product_sku: string | null
  unit_price: number
  quantity: number
  discount: number
  total_price: number
  vat_inclusive: boolean
}

export interface Invoice {
  id: string
  business_id: string
  store_id: string | null
  customer_id: string | null
  created_by: string
  invoice_number: string
  issue_date: string
  due_date: string
  sub_total: number
  discount_amount: number
  vat_rate: number
  vat_inclusive: boolean
  vat_amount: number
  wht_rate: number
  wht_amount: number
  total_amount: number
  amount_paid: number
  balance_due: number
  currency: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | string
  notes: string | null
  payment_terms: string | null
  sent_at: string | null
  paid_at: string | null
  created_at: string
  updated_at: string
  customer?: Customer
  items?: InvoiceItem[]
}

export interface CreateInvoiceItemRequest {
  product_id?: string
  description: string
  product_sku?: string
  unit_price: number
  quantity: number
  discount?: number
  vat_inclusive?: boolean
}

export interface CreateInvoiceRequest {
  customer_id?: string
  store_id?: string
  issue_date: string
  due_date: string
  items: CreateInvoiceItemRequest[]
  discount_amount?: number
  vat_rate?: number
  vat_inclusive?: boolean
  wht_rate?: number
  notes?: string
  payment_terms?: string
}

export interface InvoiceListParams extends CursorParams {
  status?: string
  customer_id?: string
  date_from?: string
  date_to?: string
}

// ─── Expense ──────────────────────────────────────────────────────────────────

export interface Expense {
  id: string
  business_id: string
  store_id: string | null
  expense_type: 'opex' | 'capex' | string
  category: string
  description: string
  amount: number
  vat_inclusive: boolean
  vat_rate: number
  vat_amount: number
  is_tax_deductible: boolean
  asset_life_years: number | null
  asset_start_date: string | null
  receipt_url: string | null
  expense_date: string
  recorded_by: string
  created_at: string
  updated_at: string
}

export interface CreateExpenseRequest {
  store_id?: string
  expense_type: 'opex' | 'capex'
  category: string
  description: string
  amount: number
  vat_inclusive?: boolean
  vat_rate?: number
  is_tax_deductible?: boolean
  asset_life_years?: number
  asset_start_date?: string
  expense_date: string
}

export interface UpdateExpenseRequest {
  category?: string
  description?: string
  amount?: number
  expense_date?: string
  receipt_url?: string
}

export interface ExpenseMonthlySummary {
  year: number
  month: number
  total_opex: number
  total_capex: number
  total_amount: number
  by_category: Record<string, number>
}

export interface ExpenseListParams extends CursorParams {
  store_id?: string
  expense_type?: 'opex' | 'capex'
  category?: string
  date_from?: string
  date_to?: string
}

// ─── Debt ─────────────────────────────────────────────────────────────────────

export interface Debt {
  id: string
  business_id: string
  direction: 'receivable' | 'payable' | string
  customer_id: string | null
  supplier_name: string | null
  supplier_phone: string | null
  description: string
  total_amount: number
  amount_paid: number
  amount_due: number
  due_date: string | null
  status: 'outstanding' | 'partial' | 'settled' | 'overdue' | string
  notes: string | null
  recorded_by: string
  created_at: string
  updated_at: string
  customer?: Customer
}

export interface CreateDebtRequest {
  direction: 'receivable' | 'payable'
  customer_id?: string
  supplier_name?: string
  supplier_phone?: string
  description: string
  total_amount: number
  due_date?: string
  notes?: string
}

export interface RecordDebtPaymentRequest {
  amount: number
  note?: string
}

export interface DebtListParams extends CursorParams {
  direction?: 'receivable' | 'payable'
  status?: string
  customer_id?: string
  overdue?: boolean
}

// ─── Digital Products ─────────────────────────────────────────────────────────

export interface DigitalProduct {
  id: string
  business_id: string
  title: string
  slug: string
  description: string
  type: string
  price: number
  currency: string
  cover_image_url: string | null
  gallery_image_urls: string
  promo_video_url: string | null
  file_size: number | null
  file_mime_type: string | null
  is_published: boolean
  expires_at: string | null
  sales_count: number
  total_revenue: number
  created_at: string
  updated_at: string
}

export interface CreateDigitalProductRequest {
  title: string
  description: string
  type: string
  price: number
  promo_video_url?: string
}

export interface UpdateDigitalProductRequest {
  title?: string
  description?: string
  price?: number
  promo_video_url?: string
  is_published?: boolean
}

export type DigitalProductListParams = CursorParams

export interface DigitalOrder {
  id: string
  business_id: string
  digital_product_id: string
  buyer_name: string
  buyer_email: string
  buyer_phone: string | null
  amount_paid: number
  platform_fee: number
  owner_payout_amount: number
  currency: string
  payment_channel: string
  payment_status: string
  paid_at: string | null
  access_granted: boolean
  payout_status: string
  created_at: string
}

// ─── Staff ────────────────────────────────────────────────────────────────────

export interface StaffMember {
  id: string
  business_id: string
  user_id: string
  role: 'owner' | 'staff' | string
  job_title: string | null
  department: string | null
  is_active: boolean
  joined_at: string
  created_at: string
  updated_at: string
  user?: {
    id: string
    first_name: string
    last_name: string
    email: string
    phone_number: string | null
    is_active: boolean
  }
}

export interface InviteStaffRequest {
  first_name: string
  last_name: string
  email: string
  phone_number: string
  password: string
  job_title?: string
  department?: string
}

export interface UpdateStaffRequest {
  job_title?: string
  department?: string
  is_active?: boolean
}

export interface StaffListParams extends CursorParams {
  is_active?: boolean
}

// ─── Recruitment ──────────────────────────────────────────────────────────────

export interface JobOpening {
  id: string
  business_id: string
  posted_by: string
  title: string
  slug: string
  description: string
  requirements: string | null
  responsibilities: string | null
  type: 'full_time' | 'part_time' | 'contract' | 'internship' | string
  location: string | null
  is_remote: boolean
  salary_range_min: number | null
  salary_range_max: number | null
  application_deadline: string | null
  status: 'open' | 'closed' | string
  assessment_enabled: boolean
  assessment_category: string | null
  pass_threshold: number
  time_limit_minutes: number
  application_count: number
  created_at: string
  updated_at: string
}

export interface CreateJobRequest {
  title: string
  description: string
  requirements?: string
  responsibilities?: string
  type: 'full_time' | 'part_time' | 'contract' | 'internship'
  location?: string
  is_remote?: boolean
  salary_range_min?: number
  salary_range_max?: number
  application_deadline?: string
  assessment_enabled?: boolean
  assessment_category?: string
  pass_threshold?: number
  time_limit_minutes?: number
}

export interface JobListParams extends CursorParams {
  status?: 'open' | 'closed'
  type?: 'full_time' | 'part_time' | 'contract' | 'internship'
}

export interface RecruitmentApplication {
  id: string
  business_id: string
  job_opening_id: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
  cover_letter: string | null
  cv_url: string | null
  status: 'new' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired' | string
  review_notes: string | null
  assessment_status: 'not_required' | 'pending' | 'completed' | 'expired' | string
  assessment_score: number | null
  assessment_passed: boolean | null
  assessment_completed_at: string | null
  created_at: string
  updated_at: string
  job_opening?: JobOpening
}

export interface ReviewApplicationRequest {
  status: 'reviewing' | 'shortlisted' | 'rejected' | 'hired' | string
  review_notes?: string
}

export interface ApplicationListParams extends CursorParams {
  job_id?: string
  status?: string
}