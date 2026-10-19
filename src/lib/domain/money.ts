/** All API amounts are integer minor units. Convert only at input/output. */
export function money(amount: number, currency = 'NGN'): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format((Number.isFinite(amount) ? amount : 0) / 100)
}
export function toMinorUnits(value: string | number): number {
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount < 0) throw new Error('Enter a valid positive amount')
  return Math.round(amount * 100)
}
