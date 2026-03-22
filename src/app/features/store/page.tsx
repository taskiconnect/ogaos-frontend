'use client'

export const dynamic = 'force-dynamic'

import { FeaturePageClient } from '@/components/landing/features/FeaturePageClient'

export default function DigitalStorePage() {
  return (
    <FeaturePageClient
      id="store"
      tag="Digital Store"
      title={'Sell online.\nGet paid in naira.'}
      subtitle="Launch your own storefront in minutes. No coding, no agency, no stress."
      description="OgaOS gives every business owner a personal digital storefront they can share anywhere. Sell online courses, digital guides, templates, or any product. Customers click your link, order, and pay — you get notified instantly."
      accent="#14b8a6"
      image="https://ik.imagekit.io/jwrqb9lqx/TaskiConnect%20Website/Image_fx%20(31).png"
      benefits={[
        'Your own storefront link: ogaos.store/your-business-name',
        'Sell digital products — courses, PDFs, templates, guides',
        'Sell physical products with stock tracking built in',
        'Customers pay directly via bank transfer or card',
        'Instant WhatsApp notification when an order comes in',
        'Automatic delivery of digital products after payment',
        'Order history and revenue dashboard always up to date',
        'Share your store link on WhatsApp, Instagram, and anywhere',
      ]}
      howItWorks={[
        { step: 1, title: 'Create your store in minutes', body: "Add your business name, logo, and products. Set prices in naira. Toggle each product live when you're ready to sell." },
        { step: 2, title: 'Share your store link', body: 'Copy your unique store URL and paste it anywhere — WhatsApp status, Instagram bio, Twitter, or a flyer. Customers click and shop.' },
        { step: 3, title: 'Get paid, get notified', body: 'When a customer orders, you get a WhatsApp notification. Payment is confirmed before fulfilment. Digital products are delivered automatically.' },
      ]}
      prevFeature={{ label: 'Staff Management', href: '/features/staff' }}
      nextFeature={{ label: 'Sales Record', href: '/features/sales' }}
    />
  )
}