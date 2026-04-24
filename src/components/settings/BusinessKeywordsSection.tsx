// src/components/settings/BusinessKeywordsSection.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Loader2, Plus, Tags, X } from 'lucide-react'
import { getMyBusinessKeywords, setMyBusinessKeywords } from '@/lib/api/keyword'
import { cn } from '@/lib/utils'
import Section from '@/components/settings/Section'

export default function BusinessKeywordsSection() {
  const qc = useQueryClient()

  const [keywordInput, setKeywordInput] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])
  const hasHydrated = useRef(false)
  const [isDirty, setIsDirty] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [suggestions, setSuggestions] = useState<string[]>([])
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1)
  const [isSuggesting, setIsSuggesting] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const { data: fetchedKeywords = [], isLoading, isSuccess } = useQuery({
    queryKey: ['business-keywords'],
    queryFn: getMyBusinessKeywords,
  })

  useEffect(() => {
    if (isSuccess && Array.isArray(fetchedKeywords) && (!hasHydrated.current || !isDirty)) {
      setKeywords(fetchedKeywords)
      hasHydrated.current = true
    }
  }, [fetchedKeywords, isSuccess, isDirty])

  function toTitleCase(value: string) {
    return value.trim().replace(/\s+/g, ' ').toLowerCase().split(' ').filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  function keywordExists(value: string) {
    return keywords.some((k) => k.toLowerCase() === value.toLowerCase())
  }

  async function loadSuggestions(query: string) {
    const trimmed = query.trim()
    if (!trimmed) {
      setSuggestions([]); setSuggestionsOpen(false); setActiveSuggestionIndex(-1)
      return
    }
    setIsSuggesting(true)
    try {
      const res = await fetch(`/api/public/keywords/suggestions?q=${encodeURIComponent(trimmed)}`, { cache: 'no-store' })
      const json = await res.json().catch(() => null)
      const raw: unknown = json?.data?.keywords ?? json?.data?.results ?? json?.data ?? json?.keywords ?? json?.results ?? json
      const list: string[] = Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string') : []
      const filtered = list.filter((item) => !keywordExists(item))
      setSuggestions(filtered)
      setSuggestionsOpen(filtered.length > 0)
      setActiveSuggestionIndex(filtered.length > 0 ? 0 : -1)
    } catch {
      setSuggestions([]); setSuggestionsOpen(false); setActiveSuggestionIndex(-1)
    } finally {
      setIsSuggesting(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => loadSuggestions(keywordInput), 250)
    return () => clearTimeout(timer)
  }, [keywordInput])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      if (!inputRef.current?.contains(target) && !suggestionsRef.current?.contains(target)) {
        setSuggestionsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function resetSuggestions() {
    setSuggestions([]); setSuggestionsOpen(false); setActiveSuggestionIndex(-1)
  }

  function addKeyword(raw?: string) {
    const value = toTitleCase(raw ?? keywordInput)
    if (!value) return
    if (value.length > 80) { setError('Each keyword must be 80 characters or less.'); return }
    if (keywordExists(value)) { setError('That keyword has already been added.'); return }
    if (keywords.length >= 15) { setError('You can add up to 15 keywords.'); return }
    setKeywords((prev) => [...prev, value])
    setKeywordInput('')
    setError('')
    setIsDirty(true)
    resetSuggestions()
  }

  function removeKeyword(value: string) {
    setKeywords((prev) => prev.filter((k) => k !== value))
    setError('')
    setIsDirty(true)
  }

  const saveMut = useMutation({
    mutationFn: () => setMyBusinessKeywords({ keywords }),
    onSuccess: (data) => {
      const next = Array.isArray(data) ? data : []
      setKeywords(next)
      setSaved(true); setError(''); setIsDirty(false)
      qc.invalidateQueries({ queryKey: ['business-keywords'] })
      setTimeout(() => setSaved(false), 3000)
    },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Failed to save keywords'),
  })

  const remaining = Math.max(0, 15 - keywords.length)

  if (isLoading && !hasHydrated.current) {
    return (
      <Section title="Business Keywords">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading keywords...
        </div>
      </Section>
    )
  }

  return (
    <Section title="Business Keywords">
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Tags className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Help customers discover your business</p>
            <p className="text-xs text-gray-400 mt-1">
              Add keywords that describe your business, products, or services. Maximum 15 keywords.
            </p>
          </div>
        </div>

        {/* Input + suggestions */}
        <div className="relative">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                value={keywordInput}
                onChange={(e) => { setKeywordInput(e.target.value); setError('') }}
                onFocus={() => { if (suggestions.length > 0) setSuggestionsOpen(true) }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault()
                    if (!suggestions.length) return
                    setSuggestionsOpen(true)
                    setActiveSuggestionIndex((prev) => prev < suggestions.length - 1 ? prev + 1 : 0)
                    return
                  }
                  if (e.key === 'ArrowUp') {
                    e.preventDefault()
                    if (!suggestions.length) return
                    setSuggestionsOpen(true)
                    setActiveSuggestionIndex((prev) => prev > 0 ? prev - 1 : suggestions.length - 1)
                    return
                  }
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    if (suggestionsOpen && activeSuggestionIndex >= 0 && suggestions[activeSuggestionIndex]) {
                      addKeyword(suggestions[activeSuggestionIndex])
                      return
                    }
                    addKeyword()
                    return
                  }
                  if (e.key === ',') { e.preventDefault(); addKeyword(); return }
                  if (e.key === 'Escape') setSuggestionsOpen(false)
                }}
                placeholder="e.g. Fashion, Tailoring, Cakes…"
                className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-3 pr-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/6 transition-all"
              />

              {isSuggesting && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
                </div>
              )}

              {suggestionsOpen && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-30 top-full mt-1.5 w-full rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.8)] overflow-hidden"
                  style={{ backgroundColor: '#0d1526' }}
                >
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/6">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">Suggestions</span>
                    <span className="text-[10px] text-gray-600">↑↓ to navigate · Enter to add</span>
                  </div>
                  <div className="max-h-52 overflow-y-auto overscroll-contain">
                    {suggestions.map((suggestion, index) => {
                      const active = index === activeSuggestionIndex
                      return (
                        <button
                          key={`${suggestion}-${index}`}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => addKeyword(suggestion)}
                          onMouseEnter={() => setActiveSuggestionIndex(index)}
                          className={cn(
                            'w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors border-b border-white/4 last:border-b-0',
                            active ? 'bg-primary/20 text-white' : 'text-gray-300 hover:bg-white/5 hover:text-white'
                          )}
                        >
                          <span className={cn('w-1.5 h-1.5 rounded-full shrink-0 transition-colors', active ? 'bg-primary' : 'bg-white/10')} />
                          {suggestion}
                          {active && <Plus className="w-3.5 h-3.5 ml-auto text-primary opacity-70" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => addKeyword()}
              disabled={!keywordInput.trim() || keywords.length >= 15}
              className="px-5 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-40 flex items-center justify-center gap-2 shrink-0 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">
              <span className="text-white font-medium">{keywords.length}</span> / 15 keywords
            </span>
            <span className={cn('font-medium', remaining <= 3 ? 'text-yellow-400' : 'text-gray-500')}>
              {remaining} remaining
            </span>
          </div>
          <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${(keywords.length / 15) * 100}%`, background: 'linear-gradient(90deg, #002b9d, #3f9af5)' }}
            />
          </div>
        </div>

        {/* Keywords box */}
        <div className="rounded-2xl border border-white/8 bg-white/2 p-4 min-h-25">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Added Keywords</p>
            {keywords.length > 0 && <span className="text-[11px] text-gray-600">click tag to remove</span>}
          </div>

          {keywords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-5 gap-1.5">
              <Tags className="w-6 h-6 text-gray-700" />
              <p className="text-sm text-gray-500">No keywords added yet</p>
              <p className="text-xs text-gray-600">Type above and press Enter or comma</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, index) => (
                <button
                  key={`${keyword}-${index}`}
                  type="button"
                  onClick={() => removeKeyword(keyword)}
                  className="group inline-flex items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/10 px-3 py-1.5 text-sm text-white hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300 transition-all"
                  aria-label={`Remove ${keyword}`}
                >
                  <span className="font-medium">{keyword}</span>
                  <X className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          )}
        </div>

        <p className="text-xs text-gray-600">
          Press{' '}
          <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400 font-mono text-[10px]">Enter</kbd>{' '}
          or{' '}
          <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400 font-mono text-[10px]">,</kbd>{' '}
          to add ·{' '}
          <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400 font-mono text-[10px]">↑↓</kbd>{' '}
          to navigate suggestions · click a tag to remove it
        </p>

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => saveMut.mutate()}
            disabled={saveMut.isPending}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}
          >
            {saveMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Save Keywords
          </button>

          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-400 font-medium">
              <Check className="w-4 h-4" />
              Saved!
            </span>
          )}
        </div>
      </div>
    </Section>
  )
}