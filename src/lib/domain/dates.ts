export function lagosDay(date = new Date()): string {
  return date.toLocaleDateString('en-CA', { timeZone: 'Africa/Lagos' })
}
/** Original Go API requires RFC3339. Date-only UI ranges refer to Lagos. */
export function dateBounds<T extends { date_from?: string; date_to?: string }>(
  params?: T,
): T | undefined {
  if (!params) return params
  const out = { ...params }
  if (/^\d{4}-\d{2}-\d{2}$/.test(out.date_from ?? '')) out.date_from += 'T00:00:00+01:00'
  if (/^\d{4}-\d{2}-\d{2}$/.test(out.date_to ?? '')) out.date_to += 'T23:59:59.999999+01:00'
  return out
}
export function monthRange(year: number, month: number) {
  const mm = String(month).padStart(2, '0')
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate()
  return { date_from: `${year}-${mm}-01`, date_to: `${year}-${mm}-${last}` }
}
