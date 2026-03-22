export const dynamic = 'force-dynamic'

import { FeaturePageClient } from '@/components/landing/features/FeaturePageClient'

export default function DebtTrackingPage() {
  return (
    <FeaturePageClient
      id="debt"
      tag="Debt Tracking"
      title={'Chase debtors without\nthe awkward calls.'}
      subtitle="Know exactly who owes you, how much, and for how long."
      description="OgaOS logs every customer debt automatically when a sale is made on credit. It tracks due dates, calculates overdue periods, and sends friendly WhatsApp reminders on your behalf — so you get paid without ruining any relationships."
      accent="#f59e0b"
      image="https://ik.imagekit.io/jwrqb9lqx/TaskiConnect%20Website/Image_fx%20(30).png"
      benefits={[
        'Debts are created automatically when a sale is made on credit',
        'Colour-coded urgency: yellow (3 days), orange (1 week), red (3 weeks+)',
        'WhatsApp reminders sent politely and automatically on due dates',
        'Track both customer debts and supplier amounts you owe',
        'Full debt history per customer with payment trail',
        'Mark debts as partially or fully paid in one tap',
        'Dashboard shows total outstanding at a glance',
        'Export overdue list as PDF or CSV for follow-up',
      ]}
      howItWorks={[
        { step: 1, title: 'Debt is logged automatically', body: "When you record a sale and the customer doesn't pay in full, OgaOS creates a debt record instantly. No double entry needed." },
        { step: 2, title: 'Reminders go out automatically', body: 'As the due date approaches, OgaOS sends a polite WhatsApp message to the customer. You can customise the message tone.' },
        { step: 3, title: 'Mark as paid when settled', body: 'When the customer pays, update the record in seconds. The debt disappears from your dashboard and the payment is recorded.' },
      ]}
      prevFeature={{ label: 'Sales Record', href: '/features/sales' }}
      nextFeature={{ label: 'Tax Calculation', href: '/features/tax' }}
    />
  )
}