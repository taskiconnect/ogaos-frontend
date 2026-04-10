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
  const [query, setQuery]           = useState('')
  const [stateValue, setStateValue] = useState(initialState)
  const [lgaValue, setLgaValue]     = useState(initialLga)
  const [error, setError]           = useState<string | null>(null)

  const lgaOptions = useMemo(() => {
    const match = states.find((item) => item.name === stateValue)
    return match?.lgas ?? []
  }, [states, stateValue])

  function onStateChange(value: string) {
    setStateValue(value)
    const match = states.find((item) => item.name === value)
    if (!match?.lgas.includes(lgaValue)) setLgaValue('')
  }

  function normalizeLga(lga: string) {
    return lga.replace(/-/g, ' ')
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!stateValue) { setError('Please select a state.'); return }
    if (!lgaValue)   { setError('Please select a local government area.'); return }
    setError(null)
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    params.set('state', stateValue)
    params.set('lga', normalizeLga(lgaValue))
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
    params.set('lga', normalizeLga(lgaValue))
    params.set('radius_km', '10')
    router.push(`/public/search?${params.toString()}`)
  }

  return (
    <section className={`bg-background ${className}`}>
      <div className="border-b border-white/8">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10 lg:py-20">

          {/* Badge */}
          <div className="mb-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
              <Zap className="h-3 w-3" />
              Live business directory
            </span>
          </div>

          {/* Headline */}
          <div className="mb-10 max-w-3xl">
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Find businesses{' '}
              <span className="text-primary">near you</span>{' '}
              <span className="text-muted-foreground">across Nigeria.</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Search by name, category, or keyword. Pick your state and LGA — we surface the closest businesses first.
            </p>
          </div>

          {/* Search form */}
          <form onSubmit={onSubmit}>
            <div className="rounded-2xl border border-white/8 bg-white/2 p-1.5">
              <div className="grid grid-cols-1 gap-1.5 lg:grid-cols-[1fr_190px_190px_auto]">

                {/* Query */}
                <div className="flex items-center gap-3 rounded-xl bg-dash-bg border border-dash-border px-4 py-3 focus-within:ring-2 focus-within:ring-primary/30 transition-all">
                  <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="mb-0.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">What are you looking for?</p>
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Business name, category, keyword…"
                      className="w-full bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground/40 outline-none"
                    />
                  </div>
                </div>

                {/* State */}
                <div className="flex items-center gap-3 rounded-xl bg-dash-bg border border-dash-border px-4 py-3 focus-within:ring-2 focus-within:ring-primary/30 transition-all">
                  <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="mb-0.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">State</p>
                    <select
                      value={stateValue}
                      onChange={(e) => onStateChange(e.target.value)}
                      className="w-full bg-transparent text-sm font-medium text-foreground outline-none"
                      style={{ color: stateValue ? undefined : 'var(--muted-foreground)' }}
                    >
                      <option value="">Select state</option>
                      {states.map((s) => (
                        <option key={s.name} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* LGA */}
                <div className={`flex items-center gap-3 rounded-xl bg-dash-bg border border-dash-border px-4 py-3 focus-within:ring-2 focus-within:ring-primary/30 transition-all ${!stateValue ? 'opacity-40' : ''}`}>
                  <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="mb-0.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">Local Govt.</p>
                    <select
                      value={lgaValue}
                      onChange={(e) => setLgaValue(e.target.value)}
                      disabled={!stateValue}
                      className="w-full bg-transparent text-sm font-medium text-foreground outline-none disabled:cursor-not-allowed"
                    >
                      <option value="">Select LGA</option>
                      {lgaOptions.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:bg-primary/90 active:scale-95"
                >
                  <Search className="h-4 w-4" />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>
            </div>

            {/* Hint / error */}
            <div className="mt-2.5 px-1 min-h-[18px]">
              {error ? (
                <p className="text-xs font-semibold text-destructive">{error}</p>
              ) : (
                <p className="text-xs text-muted-foreground/60">
                  Closest businesses shown first — up to 50 km if needed.
                </p>
              )}
            </div>
          </form>

          {/* Category pills */}
          <div className="mt-7 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Browse:</span>
            {SUGGESTED_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className="rounded-full border border-white/8 bg-white/2 px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-all duration-150 hover:bg-primary/10 hover:border-primary/25 hover:text-primary"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Stats strip */}
          <div className="mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t border-white/8 pt-8">
            {[
              { label: 'Businesses listed', value: '2,400+' },
              { label: 'States covered',    value: '36 + FCT' },
              { label: 'Verified profiles', value: '800+' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-2xl font-bold text-foreground">{value}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}