'use client'

import type { SubscriptionPlan } from '@/lib/api/types'
import { useSubscription } from './useSubscription'

type Options = {
  requiredPlan?: Exclude<SubscriptionPlan, 'free'>
}

export function useRequireSubscription(options: Options = {}) {
  return useSubscription({
    redirectIfMissing: true,
    requireActive: true,
    requiredPlan: options.requiredPlan,
    redirectTo: '/dashboard/subscription',
  })
}