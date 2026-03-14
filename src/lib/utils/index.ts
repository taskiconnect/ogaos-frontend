// src/lib/utils/index.ts
export * from './Utils'

// ─── Money ────────────────────────────────────────────────────────────────────

/** Kobo → naira integer (100 kobo = ₦1) */
export function fromKobo(kobo: number): number {
  return Math.round(kobo / 100)
}

/** Naira → kobo integer */
export function toKobo(naira: number): number {
  return Math.round(naira * 100)
}

export function formatNaira(amount: number, isKobo = false): string {
  const n = isKobo ? amount / 100 : amount
  if (n >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000)     return `₦${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)         return `₦${(n / 1_000).toFixed(0)}k`
  return new Intl.NumberFormat('en-NG', {
    style: 'currency', currency: 'NGN',
    minimumFractionDigits: 0, maximumFractionDigits: 2,
  }).format(n)
}

// ─── Strings ──────────────────────────────────────────────────────────────────

export function getInitials(name: string): string {
  return name.trim().split(/\s+/).filter(Boolean)
    .map((w) => w[0].toUpperCase()).slice(0, 2).join('')
}

// ─── Dates ────────────────────────────────────────────────────────────────────

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(iso))
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso))
}

export function timeAgo(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime()
  const secs  = Math.floor(diff / 1_000)
  const mins  = Math.floor(secs / 60)
  const hours = Math.floor(mins / 60)
  const days  = Math.floor(hours / 24)
  if (secs  < 60) return 'just now'
  if (mins  < 60) return `${mins} min${mins  === 1 ? '' : 's'} ago`
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`
  if (days  <  7) return `${days} day${days  === 1 ? '' : 's'} ago`
  return formatDate(iso)
}

/** Days overdue — returns 0 if not yet due */
export function daysOverdue(dueDateIso: string | null): number {
  if (!dueDateIso) return 0
  return Math.max(0, Math.floor((Date.now() - new Date(dueDateIso).getTime()) / 86_400_000))
}

/** Today's date as yyyy-mm-dd in Africa/Lagos timezone */
export function todayNg(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Lagos' })
}