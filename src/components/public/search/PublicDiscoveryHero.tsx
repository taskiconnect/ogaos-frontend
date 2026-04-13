'use client'

import { FormEvent, useMemo, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Search, Zap, Loader2, Navigation } from 'lucide-react'

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
  const [query, setQuery] = useState('')
  const [stateValue, setStateValue] = useState(initialState)
  const [lgaValue, setLgaValue] = useState(initialLga)
  const [error, setError] = useState<string | null>(null)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

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

  // Get user's current location
  function getCurrentLocation() {
    setGettingLocation(true)
    setLocationError(null)
    
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser')
      setGettingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        
        // Search with coordinates instead of state/LGA
        const params = new URLSearchParams()
        if (query.trim()) params.set('q', query.trim())
        params.set('lat', latitude.toString())
        params.set('lng', longitude.toString())
        params.set('radius_km', '10')
        
        router.push(`/public/search?${params.toString()}`)
        setGettingLocation(false)
      },
      (err) => {
        console.error('Location error:', err)
        let errorMsg = 'Unable to get your location'
        if (err.code === 1) errorMsg = 'Location permission denied'
        if (err.code === 2) errorMsg = 'Location unavailable'
        if (err.code === 3) errorMsg = 'Location request timeout'
        
        setLocationError(errorMsg)
        setGettingLocation(false)
        
        // Still allow search without location
        setTimeout(() => setLocationError(null), 3000)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    
    // Check if we have state and LGA selected
    if (!stateValue) {
      setError('Please select a state.')
      return
    }
    if (!lgaValue) {
      setError('Please select a local government area.')
      return
    }
    
    setError(null)
    
    // Note: Backend doesn't support state/LGA search directly
    // We'll use the LGA name as the search query
    const searchQuery = query.trim() || lgaValue
    const params = new URLSearchParams()
    params.set('q', searchQuery)
    // We can't filter by state/LGA on backend, so we just search by keyword
    // The backend will return all matching businesses across Nigeria
    
    router.push(`/public/search?${params.toString()}`)
  }

  function handleTagClick(tag: string) {
    setQuery(tag)
    
    // If we have location, use it for better results
    if (stateValue && lgaValue) {
      const params = new URLSearchParams()
      params.set('q', tag)
      router.push(`/public/search?${params.toString()}`)
    } else if (!stateValue || !lgaValue) {
      setError('Select state & LGA for better results, or use "Near Me"')
      setTimeout(() => setError(null), 3000)
    } else {
      const params = new URLSearchParams()
      params.set('q', tag)
      router.push(`/public/search?${params.toString()}`)
    }
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
              Search by name, category, or keyword. Use your location for the closest results, or browse by state and LGA.
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
              ) : locationError ? (
                <p className="text-xs font-semibold text-destructive">{locationError}</p>
              ) : (
                <p className="text-xs text-muted-foreground/60">
                  Search by keyword, or use <button type="button" onClick={getCurrentLocation} disabled={gettingLocation} className="text-primary hover:underline inline-flex items-center gap-1">Near Me <Navigation className="h-3 w-3" /></button> for location-based results.
                </p>
              )}
            </div>
          </form>

          {/* Near Me button alternative */}
          <div className="mt-4">
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={gettingLocation}
              className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary transition-all hover:bg-primary/10 disabled:opacity-50"
            >
              {gettingLocation ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Getting location...
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4" />
                  Use my current location
                </>
              )}
            </button>
          </div>

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