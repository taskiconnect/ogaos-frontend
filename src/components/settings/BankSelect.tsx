// src/components/settings/BankSelect.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PaystackBank } from '@/lib/api/types'

interface BankSelectProps {
  value: string
  onChange: (code: string, name: string) => void
  banks: PaystackBank[]
  disabled?: boolean
}

export default function BankSelect({ value, onChange, banks, disabled = false }: BankSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  const filtered = banks.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  )

  const selected = banks.find((b) => b.code === value)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
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
          'w-full flex items-center justify-between gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-left transition-colors focus:outline-none',
          disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-white/25 cursor-pointer',
          selected ? 'text-white' : 'text-gray-400'
        )}
      >
        <span className="truncate">{selected?.name ?? 'Select bank'}</span>
        <ChevronDown className={cn('w-4 h-4 text-gray-500 shrink-0 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          className="absolute z-50 top-full mt-1.5 w-full rounded-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.8)] overflow-hidden"
          style={{ backgroundColor: '#0d1526' }}
        >
          <div className="p-2 border-b border-white/6">
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search banks..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none"
            />
          </div>
          <div className="max-h-56 overflow-y-auto overscroll-contain">
            {filtered.length === 0 ? (
              <p className="text-sm text-gray-500 px-4 py-3">No banks found</p>
            ) : (
              filtered.map((b) => (
                <button
                  key={b.code}
                  type="button"
                  onClick={() => { onChange(b.code, b.name); setOpen(false); setSearch('') }}
                  className={cn(
                    'w-full text-left px-4 py-2.5 text-sm transition-colors border-b border-white/4 last:border-b-0',
                    value === b.code
                      ? 'bg-primary/20 text-white font-medium'
                      : 'text-gray-300 hover:bg-white/6 hover:text-white'
                  )}
                >
                  {b.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}