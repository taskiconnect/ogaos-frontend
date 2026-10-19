// components/auth/password-fields.tsx
// Shared by change-password and reset-password pages.
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, Check, X } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export interface PasswordRule {
  label: string
  test: (v: string) => boolean
}

// Backend currently enforces min=8,max=72 only. Keep these in sync with it.
export const PASSWORD_MAX_LENGTH = 72

export const PASSWORD_RULES: PasswordRule[] = [
  { label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { label: 'One uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { label: 'One lowercase letter', test: (v) => /[a-z]/.test(v) },
  { label: 'One number', test: (v) => /\d/.test(v) },
  { label: 'One special character (!@#…)', test: (v) => /[^A-Za-z0-9]/.test(v) },
]

export const allRulesPassed = (v: string) =>
  v.length <= PASSWORD_MAX_LENGTH && PASSWORD_RULES.every((r) => r.test(v))

export function StrengthBar({ password }: { password: string }) {
  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length
  const pct = (passed / PASSWORD_RULES.length) * 100

  const color =
    passed <= 1 ? '#ef4444' :
    passed <= 2 ? '#f97316' :
    passed <= 3 ? '#eab308' :
    passed <= 4 ? 'var(--color-primary)' :
                  '#22c55e'

  const label =
    passed === 0 ? '' :
    passed <= 1 ? 'Very weak' :
    passed <= 2 ? 'Weak' :
    passed <= 3 ? 'Fair' :
    passed <= 4 ? 'Good' :
                  'Strong'

  return (
    <div className="space-y-1.5 mt-1">
      <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      {label && (
        <p className="text-xs" style={{ color }}>
          {label}
        </p>
      )}
    </div>
  )
}

export function RuleItem({ rule, value }: { rule: PasswordRule; value: string }) {
  const ok = rule.test(value)
  return (
    <li
      className="flex items-center gap-2 text-xs transition-colors"
      style={{ color: ok ? '#22c55e' : '#6b7280' }}
    >
      {ok ? <Check className="w-3 h-3 shrink-0" /> : <X className="w-3 h-3 shrink-0" />}
      {rule.label}
    </li>
  )
}

export function PasswordInput({
  id,
  name,
  value,
  onChange,
  placeholder,
  label,
  extra,
  autoComplete,
}: {
  id: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  label: string
  extra?: React.ReactNode
  autoComplete?: string
}) {
  const [show, setShow] = useState(false)

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <Label htmlFor={id} className="text-xs font-medium text-gray-400 uppercase tracking-wide">
          {label}
        </Label>
        {extra}
      </div>
      <div className="relative">
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        <Input
          id={id}
          name={name}
          type={show ? 'text' : 'password'}
          placeholder={placeholder ?? '••••••••'}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          maxLength={PASSWORD_MAX_LENGTH}
          required
          className="pl-10 pr-11 h-11 bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg transition-all"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}