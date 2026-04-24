import api from './client'
import type { ApiSuccess } from './types'
import type {
  ListBanksResponse,
  ResolveAccountRequest,
  ResolveAccountResponse,
  StartVerificationRequest,
  ConfirmVerificationRequest,
  ResendVerificationRequest,
  VerificationResponse,
  PayoutAccountResponse,
} from './types'

function handleApiError(error: any): never {
  const status = error?.response?.status
  const data = error?.response?.data

  if (status === 402 && data?.upgrade_required) {
    throw { type: 'subscription', status, ...data }
  }

  throw {
    type: 'api',
    status,
    message: data?.message ?? error?.message ?? 'Something went wrong',
  }
}

export const listBanks = async (): Promise<ListBanksResponse> => {
  try {
    const res = await api.get<ApiSuccess<ListBanksResponse>>('/business/me/payout/banks')
    return res.data.data
  } catch (error) {
    handleApiError(error)
  }
}

export const resolveAccount = async (
  data: ResolveAccountRequest
): Promise<ResolveAccountResponse['data']> => {
  try {
    const res = await api.post<ApiSuccess<ResolveAccountResponse>>(
      '/business/me/payout/resolve',
      data
    )

    return res.data.data.data
  } catch (error) {
    handleApiError(error)
  }
}

export const startPayoutVerification = async (
  data: StartVerificationRequest
): Promise<VerificationResponse> => {
  try {
    const res = await api.post<ApiSuccess<VerificationResponse>>(
      '/business/me/payout/verify/start',
      data
    )
    return res.data.data
  } catch (error) {
    handleApiError(error)
  }
}

export const resendPayoutVerification = async (
  data: ResendVerificationRequest
): Promise<VerificationResponse> => {
  try {
    const res = await api.post<ApiSuccess<VerificationResponse>>(
      '/business/me/payout/verify/resend',
      data
    )
    return res.data.data
  } catch (error) {
    handleApiError(error)
  }
}

export const confirmPayoutVerification = async (
  data: ConfirmVerificationRequest
): Promise<PayoutAccountResponse> => {
  try {
    const res = await api.post<ApiSuccess<PayoutAccountResponse>>(
      '/business/me/payout/verify/confirm',
      data
    )
    return res.data.data
  } catch (error) {
    handleApiError(error)
  }
}

export const getPendingPayoutVerification = async (): Promise<VerificationResponse> => {
  try {
    const res = await api.get<ApiSuccess<VerificationResponse>>(
      '/business/me/payout/verify/pending'
    )
    return res.data.data
  } catch (error) {
    handleApiError(error)
  }
}

export const getDefaultPayoutAccount = async (): Promise<PayoutAccountResponse> => {
  try {
    const res = await api.get<ApiSuccess<PayoutAccountResponse>>(
      '/business/me/payout/account'
    )
    return res.data.data
  } catch (error) {
    handleApiError(error)
  }
}