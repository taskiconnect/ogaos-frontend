import type { SubscriptionPlan } from '@/lib/api/types'
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
    description:
      'For businesses starting out with basic catalogue access and limited monthly usage',
    features: [
      'Digital store catalogue',
      'Up to 5 sales per month',
      'Up to 5 products per month',
      'Business dashboard included',
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
    features: ['Everything in Pro', 'Custom pricing', 'Custom limits', 'Dedicated onboarding'],
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
