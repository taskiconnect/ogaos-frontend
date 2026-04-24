// src/components/settings/PayoutAccountSection.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, CreditCard, Landmark, Loader2, RefreshCw, ShieldCheck, X } from 'lucide-react'
import {
  confirmPayoutVerification,
  getDefaultPayoutAccount,
  listBanks,
  resendPayoutVerification,
  resolveAccount,
  startPayoutVerification,
} from '@/lib/api/payout'
import type { PaystackBank, VerificationResponse } from '@/lib/api/types'
import { cn } from '@/lib/utils'
import Section from '@/components/settings/Section'
import BankSelect from '@/components/settings/BankSelect'
import OTPInput from '@/components/settings/OTPInput'

type PayoutStep = 'idle' | 'form' | 'otp'

export default function PayoutAccountSection() {
  const qc = useQueryClient()

  const { data: account, isLoading: accountLoading } = useQuery({
    queryKey: ['payout-account'],
    queryFn: getDefaultPayoutAccount,
    retry: false,
  })

  const { data: banks = [], isLoading: banksLoading } = useQuery({
    queryKey: ['payout-banks'],
    queryFn: listBanks,
    staleTime: 1000 * 60 * 10,
    select: (res) => res?.data ?? [],
  })

  const [step, setStep] = useState<PayoutStep>('idle')
  const [bankCode, setBankCode] = useState('')
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [resolvedName, setResolvedName] = useState('')
  const [resolving, setResolving] = useState(false)
  const [resolveErr, setResolveErr] = useState('')

  const [verification, setVerification] = useState<VerificationResponse | null>(null)
  const [otp, setOtp] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [formErr, setFormErr] = useState('')
  const [otpErr, setOtpErr] = useState('')
  const [success, setSuccess] = useState(false)

  // ── Resolve account number
  useEffect(() => {
    if (accountNumber.length !== 10 || !bankCode) {
      setResolvedName('')
      setResolveErr('')
      return
    }

    let cancelled = false
    setResolving(true)
    setResolveErr('')
    setResolvedName('')

    resolveAccount({ bank_code: bankCode, account_number: accountNumber })
      .then((res) => {
        if (cancelled) return
        // res is ResolveAccountData: { account_number, account_name, bank_id }
        setResolvedName(res?.account_name ?? '')
      })
      .catch((e: any) => {
        if (cancelled) return
        setResolveErr(e?.message ?? 'Could not verify account')
      })
      .finally(() => {
        if (!cancelled) setResolving(false)
      })

    return () => { cancelled = true }
  }, [accountNumber, bankCode])

  // ── Cooldown timer
  function startCooldown(resendAfter: string) {
    const diff = Math.max(0, Math.ceil((new Date(resendAfter).getTime() - Date.now()) / 1000))
    setResendCooldown(diff)
    if (cooldownRef.current) clearInterval(cooldownRef.current)
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(cooldownRef.current!); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  useEffect(() => () => { if (cooldownRef.current) clearInterval(cooldownRef.current) }, [])

  // ── Mutations
  const startMut = useMutation({
    mutationFn: () =>
      startPayoutVerification({ bank_name: bankName, bank_code: bankCode, account_number: accountNumber, account_name: resolvedName }),
    onSuccess: (data) => {
      if (!data) return
      setVerification(data)
      setStep('otp')
      setFormErr('')
      startCooldown(data.resend_after)
    },
    onError: (e: any) => setFormErr(e?.message ?? 'Failed to send OTP'),
  })

  const resendMut = useMutation({
    mutationFn: () => resendPayoutVerification({ verification_id: verification!.id }),
    onSuccess: (data) => {
      if (!data) return
      setVerification(data)
      setOtp('')
      setOtpErr('')
      startCooldown(data.resend_after)
    },
    onError: (e: any) => setOtpErr(e?.message ?? 'Failed to resend OTP'),
  })

  const confirmMut = useMutation({
    mutationFn: () => confirmPayoutVerification({ verification_id: verification!.id, otp }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payout-account'] })
      setSuccess(true)
      setStep('idle')
      setOtp('')
      setVerification(null)
      setBankCode(''); setBankName(''); setAccountNumber(''); setResolvedName('')
      setTimeout(() => setSuccess(false), 4000)
    },
    onError: (e: any) => setOtpErr(e?.message ?? 'Invalid OTP'),
  })

  function resetForm() {
    setStep('idle')
    setBankCode(''); setBankName(''); setAccountNumber(''); setResolvedName('')
    setResolveErr(''); setFormErr(''); setOtp(''); setOtpErr(''); setVerification(null)
    if (cooldownRef.current) clearInterval(cooldownRef.current)
    setResendCooldown(0)
  }

  const canSubmitForm = bankCode && accountNumber.length === 10 && resolvedName && !resolving

  // ── Account card (idle)
  function renderAccountCard() {
    if (accountLoading) {
      return (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading payout account...
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {account ? (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">{account.account_name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{account.bank_name}</p>
              <p className="text-xs font-mono text-gray-500 mt-1 tracking-wider">{account.account_number}</p>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              Default
            </span>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 p-6 flex flex-col items-center gap-2 text-center">
            <CreditCard className="w-7 h-7 text-gray-600" />
            <p className="text-sm text-gray-400 font-medium">No payout account yet</p>
            <p className="text-xs text-gray-600">Add a bank account to receive payouts</p>
          </div>
        )}

        {success && (
          <p className="flex items-center gap-1.5 text-sm text-emerald-400 font-medium">
            <Check className="w-4 h-4" />
            Payout account saved successfully!
          </p>
        )}

        <button
          onClick={() => { setStep('form'); setSuccess(false) }}
          className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors font-semibold"
        >
          <Landmark className="w-4 h-4" />
          {account ? 'Change payout account' : 'Add payout account'}
        </button>
      </div>
    )
  }

  // ── Bank form
  function renderForm() {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <p className="text-sm font-semibold text-white flex-1">Add Bank Account</p>
          <button onClick={resetForm} className="text-gray-500 hover:text-gray-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Bank</label>
          <BankSelect
            value={bankCode}
            onChange={(code, name) => { setBankCode(code); setBankName(name); setResolvedName(''); setResolveErr('') }}
            banks={banks as PaystackBank[]}
            disabled={banksLoading}
          />
          {banksLoading && (
            <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Loading banks...
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Account Number</label>
          <input
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="10-digit account number"
            inputMode="numeric"
            maxLength={10}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/25 font-mono tracking-wider"
          />
        </div>

        <div className="rounded-xl border border-white/8 bg-white/2 px-4 py-3 min-h-12 flex items-center gap-2">
          {resolving && (
            <>
              <Loader2 className="w-4 h-4 text-gray-500 animate-spin shrink-0" />
              <span className="text-sm text-gray-500">Verifying account...</span>
            </>
          )}
          {!resolving && resolveErr && <span className="text-sm text-red-400">{resolveErr}</span>}
          {!resolving && resolvedName && (
            <>
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-sm font-semibold text-emerald-400">{resolvedName}</span>
            </>
          )}
          {!resolving && !resolvedName && !resolveErr && (
            <span className="text-sm text-gray-600">Account name will appear here</span>
          )}
        </div>

        {formErr && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{formErr}</p>
        )}

        <div className="flex gap-2 pt-1">
          <button
            onClick={resetForm}
            className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-400 hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => startMut.mutate()}
            disabled={!canSubmitForm || startMut.isPending}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}
          >
            {startMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ── OTP step
  function renderOTP() {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <p className="text-sm font-semibold text-white flex-1">Verify Your Account</p>
          <button onClick={resetForm} className="text-gray-500 hover:text-gray-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="rounded-xl border border-white/8 bg-white/2 p-4 space-y-1">
          <p className="text-xs text-gray-500">Adding account for</p>
          <p className="text-sm font-semibold text-white">{verification?.account_name}</p>
          <p className="text-xs text-gray-400">{verification?.bank_name} · {verification?.account_number}</p>
        </div>

        <div>
          <p className="text-xs text-gray-400 mb-3">
            An OTP has been sent to your registered email address. Enter it below to confirm.
          </p>
          <OTPInput value={otp} onChange={setOtp} disabled={confirmMut.isPending} />
        </div>

        {otpErr && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{otpErr}</p>
        )}

        <button
          onClick={() => confirmMut.mutate()}
          disabled={otp.length < 6 || confirmMut.isPending}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}
        >
          {confirmMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          Confirm & Save Account
        </button>

        <div className="flex items-center justify-between">
          <button
            onClick={() => resendMut.mutate()}
            disabled={resendCooldown > 0 || resendMut.isPending}
            className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', resendMut.isPending && 'animate-spin')} />
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
          </button>

          <button
            onClick={() => setStep('form')}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            ← Change account
          </button>
        </div>
      </div>
    )
  }

  return (
    <Section title="Payout Account">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Landmark className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Bank Account for Payouts</p>
            <p className="text-xs text-gray-400 mt-0.5">
              This account receives your earnings. Adding a new account replaces the current default.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/2 p-4">
          {step === 'idle' && renderAccountCard()}
          {step === 'form' && renderForm()}
          {step === 'otp' && renderOTP()}
        </div>
      </div>
    </Section>
  )
}