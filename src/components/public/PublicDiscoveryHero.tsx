'use client'

import { FormEvent, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Search, Zap } from 'lucide-react'

type StateOption = {
  name: string
  lgas: string[]
}

interface PublicDiscoveryHeroProps {
  states: StateOption[]
  initialState?: string
  initialLga?: string
  className?: string
}

const SUGGESTED_TAGS = [
  'Electronics', 'Fashion', 'Food & Drinks', 'Pharmacy',
  'Groceries', 'Beauty', 'Repairs', 'Logistics',
]

export default function PublicDiscoveryHero({
  states,
  initialState = '',
  initialLga = '',
  className = '',
}: PublicDiscoveryHeroProps) {
  const router = useRouter()
  const [query, setQuery]         = useState('')
  const [stateValue, setStateValue] = useState(initialState)
  const [lgaValue, setLgaValue]   = useState(initialLga)
  const [error, setError]         = useState<string | null>(null)
  const [focused, setFocused]     = useState<string | null>(null)

  const lgaOptions = useMemo(() => {
    const match = states.find((item) => item.name === stateValue)
    return match?.lgas ?? []
  }, [states, stateValue])

  function onStateChange(value: string) {
    setStateValue(value)
    const match = states.find((item) => item.name === value)
    if (!match?.lgas.includes(lgaValue)) setLgaValue('')
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!stateValue) { setError('Please select a state.'); return }
    if (!lgaValue)   { setError('Please select a local government area.'); return }
    setError(null)
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    params.set('state', stateValue)
    params.set('lga', lgaValue)
    params.set('radius_km', '10')
    router.push(`/public/search?${params.toString()}`)
  }

  function handleTagClick(tag: string) {
    setQuery(tag)
    if (!stateValue || !lgaValue) { setError('Please select your state and LGA first.'); return }
    setError(null)
    const params = new URLSearchParams()
    params.set('q', tag)
    params.set('state', stateValue)
    params.set('lga', lgaValue)
    params.set('radius_km', '10')
    router.push(`/public/search?${params.toString()}`)
  }

  const fieldStyle = (field: string) => ({
    background: focused === field ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.05)',
    outline: focused === field ? '1.5px solid rgba(34,197,94,0.55)' : '1.5px solid transparent',
    transition: 'all 0.2s',
  })

  return (
    <section className={`relative ${className}`}>
      {/* Divider line between hero and rest of page */}
      <div className="absolute inset-x-0 bottom-0 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10 lg:py-24">
        {/* Badge */}
        <div className="mb-8">
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest"
            style={{ background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.22)', color: '#4ade80' }}
          >
            <Zap className="h-3 w-3" />
            Live business directory
          </span>
        </div>

        {/* Headline */}
        <div className="mb-10 max-w-4xl">
          <h1 className="text-5xl font-black leading-[1.04] tracking-tight text-white sm:text-6xl lg:text-[5.5rem]">
            Find businesses{' '}
            <span style={{
              background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 60%, #86efac 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              near you
            </span>
            <br className="hidden sm:block" />
            <span style={{ color: 'rgba(255,255,255,0.75)' }}> across Nigeria.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed sm:text-lg" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Search by name, category, or keyword. Pick your state and LGA — we surface the closest businesses first.
          </p>
        </div>

        {/* Search form */}
        <form onSubmit={onSubmit}>
          <div
            className="rounded-[22px] p-1.5"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', backdropFilter: 'blur(20px)' }}
          >
            <div className="grid grid-cols-1 gap-1.5 lg:grid-cols-[1fr_200px_200px_auto]">

              {/* Query */}
              <div className="flex items-center gap-3 rounded-[16px] px-4 py-3.5" style={fieldStyle('q')}>
                <Search className="h-4.5 w-4.5 shrink-0" style={{ color: focused === 'q' ? '#4ade80' : 'rgba(255,255,255,0.30)' }} />
                <div className="min-w-0 flex-1">
                  <p className="mb-0.5 text-[9px] font-bold uppercase tracking-[0.12em]" style={{ color: 'rgba(255,255,255,0.28)' }}>What are you looking for?</p>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setFocused('q')}
                    onBlur={() => setFocused(null)}
                    placeholder="Business name, category, keyword…"
                    className="w-full bg-transparent text-sm font-medium text-white placeholder:text-white/25 outline-none"
                  />
                </div>
              </div>

              {/* State */}
              <div className="flex items-center gap-3 rounded-[16px] px-4 py-3.5" style={fieldStyle('state')}>
                <MapPin className="h-4.5 w-4.5 shrink-0" style={{ color: focused === 'state' ? '#4ade80' : 'rgba(255,255,255,0.30)' }} />
                <div className="min-w-0 flex-1">
                  <p className="mb-0.5 text-[9px] font-bold uppercase tracking-[0.12em]" style={{ color: 'rgba(255,255,255,0.28)' }}>State</p>
                  <select
                    value={stateValue}
                    onChange={(e) => onStateChange(e.target.value)}
                    onFocus={() => setFocused('state')}
                    onBlur={() => setFocused(null)}
                    className="w-full bg-transparent text-sm font-medium outline-none"
                    style={{ color: stateValue ? 'white' : 'rgba(255,255,255,0.28)' }}
                  >
                    <option value="" style={{ background: '#0b1524' }}>Select state</option>
                    {states.map((s) => (
                      <option key={s.name} value={s.name} style={{ background: '#0b1524', color: 'white' }}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* LGA */}
              <div
                className="flex items-center gap-3 rounded-[16px] px-4 py-3.5"
                style={{ ...fieldStyle('lga'), opacity: !stateValue ? 0.4 : 1 }}
              >
                <MapPin className="h-4.5 w-4.5 shrink-0" style={{ color: focused === 'lga' ? '#4ade80' : 'rgba(255,255,255,0.30)' }} />
                <div className="min-w-0 flex-1">
                  <p className="mb-0.5 text-[9px] font-bold uppercase tracking-[0.12em]" style={{ color: 'rgba(255,255,255,0.28)' }}>Local Govt.</p>
                  <select
                    value={lgaValue}
                    onChange={(e) => setLgaValue(e.target.value)}
                    onFocus={() => setFocused('lga')}
                    onBlur={() => setFocused(null)}
                    disabled={!stateValue}
                    className="w-full bg-transparent text-sm font-medium outline-none disabled:cursor-not-allowed"
                    style={{ color: lgaValue ? 'white' : 'rgba(255,255,255,0.28)' }}
                  >
                    <option value="" style={{ background: '#0b1524' }}>Select LGA</option>
                    {lgaOptions.map((l) => (
                      <option key={l} value={l} style={{ background: '#0b1524', color: 'white' }}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-[16px] px-7 py-3.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)', boxShadow: '0 8px 28px rgba(34,197,94,0.30)' }}
              >
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>
          </div>

          {/* Hint / error */}
          <div className="mt-3 px-1 min-h-[20px]">
            {error ? (
              <p className="text-xs font-semibold" style={{ color: '#f87171' }}>{error}</p>
            ) : (
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Searching from the centre of your LGA — closest businesses shown first, up to 50 km if needed.
              </p>
            )}
          </div>
        </form>

        {/* Category pills */}
        <div className="mt-8 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.22)' }}>Browse:</span>
          {SUGGESTED_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagClick(tag)}
              className="rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 hover:-translate-y-0.5"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.50)' }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.background = 'rgba(34,197,94,0.10)'
                el.style.borderColor = 'rgba(34,197,94,0.30)'
                el.style.color = '#4ade80'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.background = 'rgba(255,255,255,0.05)'
                el.style.borderColor = 'rgba(255,255,255,0.09)'
                el.style.color = 'rgba(255,255,255,0.50)'
              }}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Stats strip */}
        <div
          className="mt-12 flex flex-wrap gap-x-10 gap-y-4 pt-8"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          {[
            { label: 'Businesses listed', value: '2,400+' },
            { label: 'States covered',    value: '36 + FCT' },
            { label: 'Verified profiles', value: '800+' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-2xl font-black text-white">{value}</p>
              <p className="mt-0.5 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}