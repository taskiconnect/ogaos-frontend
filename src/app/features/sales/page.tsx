import { FeaturePageClient } from '@/components/landing/features/FeaturePageClient'

export default function SalesRecordPage() {
  return (
    <FeaturePageClient
      id="sales"
      tag="Sales Record"
      title={'Every sale.\nTracked automatically.'}
      subtitle="Stop losing track of what you sold, to who, and for how much."
      description="OgaOS records every cash, transfer, and POS sale in seconds. Items, customers, payment method — all captured. Daily summaries land in your WhatsApp every evening so you always know where you stand."
      accent="#3b82f6"
      image="https://ik.imagekit.io/jwrqb9lqx/TaskiConnect%20Website/Image_fx%20(29).png"
      benefits={[
        'Record cash, POS, transfer & card sales in under 10 seconds',
        'Attach items, quantities, and discounts to every transaction',
        'Automatic daily sales summary sent to your WhatsApp',
        'Link each sale to a customer for full purchase history',
        'Balance unpaid amounts get automatically added to debt records',
        'Email receipt sent to customer after every sale',
        'Filter and export sales reports by day, week, or month',
        'Works offline — syncs when you reconnect',
      ]}
      howItWorks={[
        { step: 1, title: 'Add your items', body: 'Search your product catalogue or type a quick item name and price. Add as many line items as needed to a single sale.' },
        { step: 2, title: 'Select payment method', body: 'Choose Cash, Transfer, POS, Card, Cheque, or Credit. If the customer pays partially, the balance is automatically logged as a debt.' },
        { step: 3, title: 'Record & relax', body: "Hit Record Sale. The transaction is saved, the customer gets a receipt, and your daily summary updates. That's it." },
      ]}
      prevFeature={{ label: 'Digital Store', href: '/features/store' }}
      nextFeature={{ label: 'Debt Tracking', href: '/features/debt' }}
    />
  )
}