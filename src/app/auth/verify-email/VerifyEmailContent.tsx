'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { verifyEmail } from '@/lib/api/auth'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { LandingHeader } from '@/components/shared/LandingHeader'
import { Footer } from '@/components/shared/Footer'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, Loader2, Mail, ArrowRight, RefreshCw } from 'lucide-react'
import Link from 'next/link'

type State = 'verifying' | 'success' | 'expired' | 'invalid'

export default function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [state, setState] = useState<State>('verifying')

  const mutation = useMutation({
    mutationFn: verifyEmail,
    onSuccess: () => {
      setState('success')
      toast.success('Email verified successfully!')
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || ''
      if (msg.includes('expired')) setState('expired')
      else setState('invalid')
      toast.error(msg)
    },
  })

  useEffect(() => {
    if (!token) {
      setState('invalid')
      return
    }
    mutation.mutate(token)
  }, [token])

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      <LandingHeader />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.05),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-size-[4rem_4rem]" />

      <div className="relative z-10 flex min-h-[calc(100vh-80px)] items-center justify-center px-5 pt-28 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div
            className="rounded-2xl border border-white/10 p-8 md:p-10 text-center"
            style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)' }}
          >
            <AnimatePresence mode="wait">
              {state === 'verifying' && (
                <motion.div
                  key="verifying"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-5"
                >
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <h1 className="text-2xl font-bold">Verifying your email...</h1>
                </motion.div>
              )}

              {state === 'success' && (
                <motion.div
                  key="success"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="flex flex-col items-center gap-6"
                >
                  <CheckCircle2 className="w-16 h-16 text-green-400" />
                  <h1 className="text-3xl font-bold">Email Verified!</h1>
                  <p className="text-gray-400">Your account is now active.</p>
                  <Link href="/auth/login" className="w-full">
                    <Button className="w-full">
                      Sign In Now <ArrowRight className="ml-2" />
                    </Button>
                  </Link>
                </motion.div>
              )}

              {state === 'expired' && (
                <motion.div
                  key="expired"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="flex flex-col items-center gap-6"
                >
                  <Mail className="w-16 h-16 text-yellow-400" />
                  <h1 className="text-2xl font-bold">Link Expired</h1>
                  <Button
                    onClick={() => router.push('/auth/signup')}
                    className="flex items-center gap-2"
                  >
                    Request New Link <RefreshCw className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}

              {state === 'invalid' && (
                <motion.div
                  key="invalid"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="flex flex-col items-center gap-6"
                >
                  <XCircle className="w-16 h-16 text-red-400" />
                  <h1 className="text-2xl font-bold">Invalid Link</h1>
                  <Link href="/auth/login">
                    <Button>Go to Sign In</Button>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  )
}