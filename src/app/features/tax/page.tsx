export const dynamic = 'force-dynamic'

import { FeaturePageClient } from '@/components/landing/features/FeaturePageClient'

export default function TaxCalculationPage() {
  return (
    <FeaturePageClient
      id="tax"
      tag="Tax Calculation"
      title={'Tax season without\nthe headache.'}
      subtitle="Auto-calculate VAT, WHT, and CIT as you trade."
      description="OgaOS computes your Nigerian tax obligations in real time based on your transactions. Whether it's 7.5% VAT, 5–10% withholding tax, or company income tax — the numbers are always ready when FIRS comes knocking."
      accent="#10b981"
      image="https://ik.imagekit.io/jwrqb9lqx/TaskiConnect%20Website/Image_fx%20(35).png"
      benefits={[
        'Auto-calculates VAT at 7.5% on every qualifying transaction',
        'WHT computed at 5% for goods and 10% for services',
        'CIT estimated at 0%, 20%, or 30% based on annual turnover',
        'Net-after-tax shown instantly for every transaction',
        'Monthly and annual tax summaries ready to export',
        'No accountant needed for day-to-day tax awareness',
        'Disclaimer prompts remind you to consult for filings',
        'Data is FIRS-ready — walk in prepared, not panicked',
      ]}
      howItWorks={[
        { step: 1, title: 'Enter the transaction amount', body: 'Type in the amount for any transaction — a sale, service fee, or supplier payment. Select Goods or Services to apply the correct WHT rate.' },
        { step: 2, title: 'Add your annual turnover', body: 'OgaOS uses your estimated annual turnover to determine your CIT band — 0% for small businesses under ₦25M, scaling up from there.' },
        { step: 3, title: 'Get your full breakdown instantly', body: 'VAT, WHT, CIT, and net-after-tax are computed live. Export the summary or use it as a reference for your accountant or FIRS filing.' },
      ]}
      prevFeature={{ label: 'Debt Tracking', href: '/features/debt' }}
      nextFeature={{ label: 'Recruitment', href: '/features/recruitment' }}
    />
  )
}