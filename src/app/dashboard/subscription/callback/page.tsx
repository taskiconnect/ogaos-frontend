'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSubscription } from '@/lib/hooks/useSubscription'
import { verifyPaymentReference } from '@/lib/api/subscription'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'

type Stage = 'verifying' | 'activating' | 'error'

export default function SubscriptionCallbackContent() {
  const router = useRouter()
  const params = useSearchParams()
  const reference = params.get('reference')

  const { subscription, refetch } = useSubscription()
  const [stage, setStage] = useState<Stage>('verifying')
  const [errMsg, setErrMsg] = useState<string>()
  const [tries, setTries] = useState(0)

  useEffect(() => {
    if (!reference) {
      router.replace('/dashboard/subscription')
      return
    }

    let cancelled = false
    let interval: NodeJS.Timeout | null = null

    async function run() {
      console.log('🔄 [Callback] Starting verification for reference:', reference)

      // Step 1: Verify with backend
      try {
        setStage('verifying')
        await verifyPaymentReference({ reference: reference! })
        console.log('✅ [Callback] verifyPaymentReference succeeded')
      } catch (err: any) {
        const status = err?.response?.status
        console.log('⚠️ [Callback] verify failed with status:', status)

        if (status === 402) {
          console.warn('[Callback] Payment not yet completed on Paystack → polling')
        } else if (status !== undefined) {
          if (!cancelled) {
            setErrMsg(err?.response?.data?.message ?? 'Verification failed. Please contact support.')
            setStage('error')
          }
          return
        }
      }

      if (cancelled) return

      // Step 2: Poll until plan upgrades
      setStage('activating')
      setTries(0)

      interval = setInterval(async () => {
        if (cancelled) {
          if (interval) clearInterval(interval)
          return
        }

        const currentTry = tries + 1
        setTries(currentTry)
        console.log(`🔄 [Callback] Poll #${currentTry} – current plan: ${subscription?.plan ?? 'free'}`)

        try {
          const res = await refetch()
          const plan = res?.data?.data?.plan

          if (plan && plan !== 'free') {
            console.log('🎉 [Callback] Plan upgraded to', plan, '– redirecting to success')
            if (interval) clearInterval(interval)
            router.replace('/dashboard/subscription/success')
            return
          }
        } catch (e) {
          console.warn('[Callback] Poll error (ignored):', e)
        }

        // Safety net
        if (currentTry >= 30) {
          if (interval) clearInterval(interval)
          if (!cancelled) {
            setErrMsg(
              'We could not confirm your subscription after 75 seconds. ' +
              'Your payment may still be processing. Please check again or contact support with this reference.'
            )
            setStage('error')
          }
        }
      }, 2500)
    }

    run()

    return () => {
      cancelled = true
      if (interval) clearInterval(interval)
    }
  }, [reference, router, refetch, subscription?.plan]) // subscription?.plan added so UI updates live

  // Error state
  if (stage === 'error') {
    return (
      <div className="max-w-2xl mx-auto rounded-3xl border border-white/10 bg-white/2 p-10 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6 text-red-400" />
        </div>

        <h1 className="mt-5 text-2xl font-bold text-white">Something went wrong</h1>
        <p className="mt-2 text-sm text-gray-400">{errMsg}</p>

        {reference && (
          <p className="mt-4 text-xs text-gray-500 font-mono break-all">Ref: {reference}</p>
        )}

        <div className="mt-8 flex gap-3 justify-center">
          <button
            onClick={() => router.replace('/dashboard/subscription')}
            className="px-6 py-2.5 rounded-xl bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-colors"
          >
            Back to Subscription
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Loading state
  return (
    <div className="max-w-2xl mx-auto rounded-3xl border border-white/10 bg-white/2 p-10 text-center">
      <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>

      <h1 className="mt-5 text-2xl font-bold text-white">
        {stage === 'verifying' ? 'Verifying your payment…' : 'Activating your subscription…'}
      </h1>
      <p className="mt-2 text-sm text-gray-400">
        {stage === 'verifying'
          ? 'Confirming transaction with Paystack.'
          : 'Please wait while we activate your new plan.'}
      </p>

      {reference && (
        <p className="mt-4 text-xs text-gray-500 font-mono break-all">Ref: {reference}</p>
      )}

      <div className="mt-6 text-xs text-gray-600">
        Current plan:{' '}
        <span className="capitalize font-medium">{subscription?.plan ?? 'free'}</span>
      </div>

      {stage === 'activating' && (
        <div className="mt-8">
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Check status now
          </button>
        </div>
      )}

      <p className="mt-8 text-[10px] text-gray-500">
        Attempt {tries} of 30 • This usually takes less than 30 seconds
      </p>
    </div>
  )
}