'use client'

import { useState, useMemo } from 'react'
import { Calculator, Info } from 'lucide-react'
import { cn, formatNaira } from '@/lib/utils'

const VAT_RATE          = 0.075
const WHT_RATE_SERVICES = 0.10
const WHT_RATE_GOODS    = 0.05

function citRate(annual: number): number {
  if (annual < 25_000_000)  return 0
  if (annual < 100_000_000) return 0.20
  return 0.30
}

type TxType = 'goods' | 'services'

export default function TaxCalculator() {
  const [amount,         setAmount]         = useState('')
  const [txType,         setTxType]         = useState<TxType>('goods')
  const [annualTurnover, setAnnualTurnover] = useState('')

  const calc = useMemo(() => {
    const base     = parseFloat(amount.replace(/,/g, ''))         || 0
    const turnover = parseFloat(annualTurnover.replace(/,/g, '')) || 0
    const vat      = base * VAT_RATE
    const wht      = base * (txType === 'services' ? WHT_RATE_SERVICES : WHT_RATE_GOODS)
    const cit      = base * citRate(turnover)
    const total    = vat + wht + cit
    return { base, vat, wht, cit, total, net: base - total, citPct: citRate(turnover) * 100 }
  }, [amount, txType, annualTurnover])

  const inputCls = 'w-full h-10 px-3 rounded-xl bg-dash-subtle border border-dash-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all'

  return (
    <div className="rounded-2xl border border-dash-border bg-dash-surface p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <Calculator className="w-4 h-4 text-blue-500 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-sm">Nigerian Tax Calculator</h3>
          <p className="text-[11px] text-muted-foreground">VAT · WHT · CIT estimator</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div>
          <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Transaction Amount (₦)
          </label>
          <input className={inputCls} placeholder="e.g. 500,000" value={amount} onChange={e => setAmount(e.target.value)} />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Transaction Type
          </label>
          <div className="flex gap-2">
            {(['goods', 'services'] as TxType[]).map(t => (
              <button
                key={t}
                onClick={() => setTxType(t)}
                className={cn(
                  'flex-1 h-10 rounded-xl text-sm font-medium capitalize transition-all',
                  txType === t
                    ? 'bg-primary text-white'
                    : 'bg-dash-subtle border border-dash-border text-muted-foreground hover:text-foreground'
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Annual Turnover (₦) <span className="text-muted-foreground/60 normal-case">for CIT</span>
          </label>
          <input className={inputCls} placeholder="e.g. 50,000,000" value={annualTurnover} onChange={e => setAnnualTurnover(e.target.value)} />
        </div>
      </div>

      {/* Results */}
      {calc.base > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            { label: 'VAT (7.5%)',                                value: calc.vat,   color: 'text-blue-500 dark:text-blue-400'     },
            { label: `WHT (${txType === 'services' ? '10' : '5'}%)`, value: calc.wht, color: 'text-orange-500 dark:text-orange-400' },
            { label: `CIT (${calc.citPct.toFixed(0)}%)`,           value: calc.cit,   color: 'text-purple-500 dark:text-purple-400' },
            { label: 'Total Tax',                                  value: calc.total, color: 'text-red-500 dark:text-red-400'       },
          ].map(row => (
            <div key={row.label} className="rounded-xl bg-dash-subtle border border-dash-border p-3">
              <p className="text-[10px] text-muted-foreground mb-1">{row.label}</p>
              <p className={cn('text-base font-bold', row.color)}>{formatNaira(row.value)}</p>
            </div>
          ))}
        </div>
      )}

      {calc.base > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-emerald-500/5 border border-emerald-500/15 px-4 py-3">
          <p className="text-sm text-muted-foreground">Net amount after tax</p>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatNaira(calc.net)}</p>
        </div>
      )}

      <div className="flex items-start gap-2 mt-4 p-3 rounded-xl bg-dash-subtle border border-dash-border">
        <Info className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Rates: VAT 7.5% (FIRS), WHT 5% goods / 10% services, CIT 0% (&lt;₦25M) · 20% (&lt;₦100M) · 30% (large). For guidance only — consult a certified tax adviser.
        </p>
      </div>
    </div>
  )
}
