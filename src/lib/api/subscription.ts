// src/lib/api/subscription.ts
import api from './client'
import type {
  ApiSuccess,
  Subscription,
  CouponValidationData,
  ValidateSubscriptionCouponRequest,
  InitiateSubscriptionRequest,
  InitiateSubscriptionData,
  VerifySubscriptionRequest,
  VerifySubscriptionData,
} from './types'

export const getMySubscription = async (): Promise<ApiSuccess<Subscription> | null> => {
  try {
    const { data } = await api.get<ApiSuccess<Subscription>>('/subscriptions/me')
    return data
  } catch (err: any) {
    if (err?.response?.status === 404) {
      return null
    }
    throw err
  }
}

export const validateSubscriptionCoupon = async (
  payload: ValidateSubscriptionCouponRequest
): Promise<ApiSuccess<CouponValidationData>> => {
  const { data } = await api.post<ApiSuccess<CouponValidationData>>(
    '/subscriptions/validate-coupon',
    payload
  )
  return data
}

export const initiateSubscription = async (
  payload: InitiateSubscriptionRequest
): Promise<ApiSuccess<InitiateSubscriptionData>> => {
  const { data } = await api.post<ApiSuccess<InitiateSubscriptionData>>(
    '/subscriptions/initiate',
    payload
  )
  return data
}

/**
 * Verify a Paystack payment reference after redirect.
 * Calls POST /subscriptions/verify on the backend which:
 *   1. Confirms the charge with Paystack directly
 *   2. Activates the subscription in the DB (idempotent — safe if webhook already fired)
 *   3. Returns the updated Subscription
 *
 * Throws with response.status 402 if the payment has not yet
 * completed on Paystack's side — caller should fall back to polling.
 */
export const verifyPaymentReference = async (
  payload: VerifySubscriptionRequest
): Promise<ApiSuccess<VerifySubscriptionData>> => {
  const { data } = await api.post<ApiSuccess<VerifySubscriptionData>>(
    '/subscriptions/verify',
    payload
  )
  return data
}