// src/components/settings/LocationSelect.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LocationSelectProps {
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder: string
  disabled?: boolean
}

export default function LocationSelect({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
}: LocationSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={cn(
          'w-full flex items-center justify-between gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none text-left transition-colors',
          disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-white/25 cursor-pointer',
          value ? 'text-white' : 'text-gray-400'
        )}
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown
          className={cn('w-4 h-4 text-gray-500 shrink-0 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div
          className="absolute z-50 top-full mt-1.5 w-full rounded-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.8)] overflow-hidden"
          style={{ backgroundColor: '#0d1526' }}
        >
          <div className="max-h-56 overflow-y-auto overscroll-contain">
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false) }}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-500 hover:bg-white/6 hover:text-gray-300 transition-colors border-b border-white/6"
            >
              {placeholder}
            </button>
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setOpen(false) }}
                className={cn(
                  'w-full text-left px-4 py-2.5 text-sm transition-colors border-b border-white/4 last:border-b-0',
                  value === opt
                    ? 'bg-primary/20 text-white font-medium'
                    : 'text-gray-300 hover:bg-white/6 hover:text-white'
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}