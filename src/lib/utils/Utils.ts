import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { SubscriptionPlan } from '@/lib/api/types'

// ─── Class names ──────────────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Money ────────────────────────────────────────────────────────────────────

/** Kobo → naira integer (100 kobo = ₦1) */
export function fromKobo(kobo: number): number {
  return Math.round(kobo / 100)
}

/** Naira → kobo integer */
export function toKobo(naira: number): number {
  return Math.round(naira * 100)
}

/**
 * Formats amount as naira.
 * Pass isKobo=true if the input value is in kobo.
 */
export function formatNaira(amount: number, isKobo = false): string {
  const n = isKobo ? amount / 100 : amount

  if (n >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`

  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n)
}

// ─── Strings ──────────────────────────────────────────────────────────────────

export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .slice(0, 2)
    .join('')
}

// ─── Dates ────────────────────────────────────────────────────────────────────

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const secs = Math.floor(diff / 1_000)
  const mins = Math.floor(secs / 60)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)

  if (secs < 60) return 'just now'
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`

  return formatDate(iso)
}

/** Days overdue — returns 0 if not yet due */
export function daysOverdue(dueDateIso: string | null): number {
  if (!dueDateIso) return 0

  return Math.max(
    0,
    Math.floor((Date.now() - new Date(dueDateIso).getTime()) / 86_400_000)
  )
}

/** Today's date as yyyy-mm-dd in Africa/Lagos timezone */
export function todayNg(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Lagos' })
}

// ─── Subscription ─────────────────────────────────────────────────────────────

export type UpgradeResponsePayload = {
  success?: boolean
  upgrade_required?: boolean
  feature?: string
  current_plan?: SubscriptionPlan | string
  required_plan?: SubscriptionPlan | string
  current_count?: number
  limit?: number
  resets_at?: string
  days_until_reset?: number
  message?: string
}

export const PLAN_META: Record<
  SubscriptionPlan,
  {
    label: string
    monthlyPrice: number
    description: string
    features: string[]
    cta: string
    popular?: boolean
  }
> = {
  free: {
    label: 'Free',
    monthlyPrice: 0,
    description: 'For businesses starting out with basic catalogue access and limited monthly usage',
    features: [
      'Digital store catalogue',
      'Up to 5 sales per month',
      'Up to 5 products per month',
      'Everything else locked until upgrade',
    ],
    cta: 'Current Plan',
  },
  growth: {
    label: 'Growth',
    monthlyPrice: 1850,
    description: 'For growing businesses that need day-to-day operations tools',
    features: [
      'Unlimited sales',
      'Unlimited products',
      'Invoices',
      'Debt tracking',
      'Customers',
      'Ledger',
      'Up to 2 staff accounts',
    ],
    cta: 'Choose Growth',
    popular: true,
  },
  pro: {
    label: 'Pro',
    monthlyPrice: 4500,
    description: 'For advanced businesses that need more power, branches, and admin tools',
    features: [
      'Everything in Growth',
      'Recruitment & job postings',
      'Multiple store branches',
      'Expense tracking',
      'Business identity / KYC',
      'Public business profile',
      'Custom domain',
      'Up to 5 staff accounts',
      'Priority support',
    ],
    cta: 'Choose Pro',
  },
  custom: {
    label: 'Custom',
    monthlyPrice: 0,
    description: 'For businesses that need tailored pricing and flexible limits',
    features: [
      'Everything in Pro',
      'Custom pricing',
      'Custom limits',
      'Dedicated onboarding',
    ],
    cta: 'Contact Sales',
  },
}

export const BILLING_OPTIONS = [
  { label: '1 Month', value: 1 },
  { label: '3 Months', value: 3 },
  { label: '6 Months', value: 6 },
  { label: '12 Months', value: 12 },
]

/** Total plan price in naira */
export function getPlanTotal(plan: SubscriptionPlan, periodMonths: number): number {
  const monthly = PLAN_META[plan]?.monthlyPrice ?? 0
  return monthly * periodMonths
}

export function getPlanLabel(plan: SubscriptionPlan | string): string {
  return PLAN_META[plan as SubscriptionPlan]?.label ?? String(plan)
}

export function isPaidPlan(plan: SubscriptionPlan | string): boolean {
  return plan === 'growth' || plan === 'pro' || plan === 'custom'
}

export function isFreePlan(plan: SubscriptionPlan | string): boolean {
  return plan === 'free'
}

export function planSupportsFeature(plan: SubscriptionPlan | string, feature: string): boolean {
  const planKey = String(plan) as SubscriptionPlan

  const featureMap: Record<SubscriptionPlan, string[]> = {
    free: ['digital_store', 'sales', 'products'],
    growth: [
      'digital_store',
      'sales',
      'products',
      'ledger',
      'invoices',
      'debt_tracking',
      'customers_basic',
      'staff_management',
    ],
    pro: [
      'digital_store',
      'sales',
      'products',
      'ledger',
      'invoices',
      'debt_tracking',
      'customers_basic',
      'staff_management',
      'recruitment',
      'stores',
      'identity_kyc',
      'public_profile',
      'expense_tracking',
      'custom_domain',
      'priority_support',
    ],
    custom: ['*'],
  }

  const features = featureMap[planKey]
  if (!features) return false
  if (features.includes('*')) return true
  return features.includes(feature)
}

export function getRequiredPlanForFeature(feature: string): SubscriptionPlan {
  const proOnly = new Set([
    'recruitment',
    'stores',
    'identity_kyc',
    'public_profile',
    'expense_tracking',
    'custom_domain',
    'priority_support',
  ])

  return proOnly.has(feature) ? 'pro' : 'growth'
}

export function getFeatureLabel(feature?: string): string {
  const labels: Record<string, string> = {
    sales: 'Sales recording',
    products: 'Product creation',
    invoices: 'Invoices',
    debt_tracking: 'Debt tracking',
    customers_basic: 'Customers',
    staff_management: 'Staff management',
    stores: 'Multiple stores',
    expense_tracking: 'Expense tracking',
    recruitment: 'Recruitment',
    identity_kyc: 'Business identity verification',
    public_profile: 'Public business profile',
    custom_domain: 'Custom domain',
    priority_support: 'Priority support',
    digital_store: 'Digital store',
    ledger: 'Ledger',
  }

  if (!feature) return 'This feature'
  return labels[feature] ?? feature.replace(/_/g, ' ')
}

// ─── Backend 402 / upgrade helpers ───────────────────────────────────────────

export function getErrorStatus(error: any): number | undefined {
  return error?.response?.status
}

export function getErrorData<T = any>(error: any): T | undefined {
  return error?.response?.data
}

export function isPaymentRequiredError(error: any): boolean {
  return getErrorStatus(error) === 402
}

export function isUpgradeRequiredError(error: any): boolean {
  const data = getErrorData<UpgradeResponsePayload>(error)
  return getErrorStatus(error) === 402 && Boolean(data?.upgrade_required)
}

export function getUpgradePayload(error: any): UpgradeResponsePayload | null {
  if (!isPaymentRequiredError(error)) return null
  return getErrorData<UpgradeResponsePayload>(error) ?? null
}

export function isLimitReachedError(error: any): boolean {
  const data = getUpgradePayload(error)
  return Boolean(
    data &&
      typeof data.limit === 'number' &&
      typeof data.current_count === 'number'
  )
}

export function isFeatureBlockedError(error: any): boolean {
  const data = getUpgradePayload(error)
  return Boolean(data && data.feature && typeof data.limit !== 'number')
}

export function getUpgradeMessage(error: any, fallback = 'This action requires a higher plan.'): string {
  const data = getUpgradePayload(error)
  return data?.message || fallback
}

export function getUpgradeTargetPlan(error: any): SubscriptionPlan | string | null {
  const data = getUpgradePayload(error)
  return data?.required_plan ?? null
}

export function getCurrentPlanFromError(error: any): SubscriptionPlan | string | null {
  const data = getUpgradePayload(error)
  return data?.current_plan ?? null
}

export function getResetDateLabel(error: any): string | null {
  const data = getUpgradePayload(error)
  if (!data?.resets_at) return null

  try {
    return formatDateTime(data.resets_at)
  } catch {
    return data.resets_at
  }
}

export function buildUpgradeSummary(error: any): {
  title: string
  description: string
  requiredPlan: SubscriptionPlan | string | null
  currentPlan: SubscriptionPlan | string | null
  feature?: string
  limit?: number
  currentCount?: number
  resetsAt?: string
  daysUntilReset?: number
} {
  const data = getUpgradePayload(error)

  if (!data) {
    return {
      title: 'Upgrade required',
      description: 'Your current plan does not allow this action.',
      requiredPlan: null,
      currentPlan: null,
    }
  }

  const featureLabel = getFeatureLabel(data.feature)
  const requiredPlan = data.required_plan ?? null
  const currentPlan = data.current_plan ?? null

  if (
    typeof data.limit === 'number' &&
    typeof data.current_count === 'number'
  ) {
    const noun =
      data.feature === 'sales' || data.feature === 'products'
        ? data.feature
        : 'items'

    return {
      title: `${featureLabel} limit reached`,
      description:
        data.message ||
        `You have used ${data.current_count} of ${data.limit} allowed ${noun}. Upgrade to ${getPlanLabel(
          String(requiredPlan || 'growth')
        )} or wait for your limit to reset.`,
      requiredPlan,
      currentPlan,
      feature: data.feature,
      limit: data.limit,
      currentCount: data.current_count,
      resetsAt: data.resets_at,
      daysUntilReset: data.days_until_reset,
    }
  }

  return {
    title: `${featureLabel} unavailable`,
    description:
      data.message ||
      `${featureLabel} is not available on your current plan. Upgrade to ${getPlanLabel(
        String(requiredPlan || 'growth')
      )} to continue.`,
    requiredPlan,
    currentPlan,
    feature: data.feature,
  }
}

/**
 * Friendly text for button-level errors/toasts.
 * Good for create sale / create product actions.
 */
export function getSubscriptionToastMessage(error: any): string {
  const data = getUpgradePayload(error)

  if (!data) {
    return 'This action is not available on your current plan.'
  }

  if (
    typeof data.limit === 'number' &&
    typeof data.current_count === 'number'
  ) {
    const days = typeof data.days_until_reset === 'number' ? data.days_until_reset : null
    const waitText = days !== null ? ` or wait ${days} day${days === 1 ? '' : 's'} for reset` : ''

    return (
      data.message ||
      `You have reached your limit for this month. Upgrade to ${getPlanLabel(
        String(data.required_plan || 'growth')
      )}${waitText}.`
    )
  }

  return (
    data.message ||
    `${getFeatureLabel(data.feature)} is not available on your current plan. Upgrade to ${getPlanLabel(
      String(data.required_plan || 'growth')
    )}.`
  )
}