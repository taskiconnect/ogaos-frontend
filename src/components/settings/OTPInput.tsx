// src/components/settings/OTPInput.tsx
'use client'

interface OTPInputProps {
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}

export default function OTPInput({ value, onChange, disabled }: OTPInputProps) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
      disabled={disabled}
      inputMode="numeric"
      placeholder="000000"
      maxLength={6}
      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 tracking-[0.3em] text-center font-mono text-lg disabled:opacity-50"
    />
  )
}