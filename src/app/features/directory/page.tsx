'use client'

export const dynamic = 'force-dynamic'

import { FeaturePageClient } from '@/components/landing/features/FeaturePageClient'

export default function DirectoryPage() {
  return (
    <FeaturePageClient
      id="directory"
      tag="Business Directory"
      title={'Get found by customers\nnear you.'}
      subtitle="A hyper-local directory that puts your business on the map — literally."
      description="OgaOS includes a GPS-powered business directory that helps local customers find you based on where they are. Set up your profile once, and start getting discovered by people already looking for what you sell."
      accent="#6366f1"
      image="https://ik.imagekit.io/jwrqb9lqx/TaskiConnect%20Website/Image_fx%20(29).png"
      benefits={[
        'GPS-based listings — customers see you based on their location',
        'Category search — show up when someone searches your type of business',
        'Rich profile — add products, photos, opening hours, and a map pin',
        'WhatsApp Chat button — customers reach you in one tap',
        'Customer reviews & star ratings — build reputation over time',
        'Promotion updates — announce offers and deals to people nearby',
        'Photo uploads — showcase your shop, products, and services',
        'Free to list — your business appears in the directory at no extra cost',
      ]}
      howItWorks={[
        {
          step: 1,
          title: 'Set up your business profile',
          body: 'Add your business name, category, location, photos, and opening hours. Link your WhatsApp number so customers can reach you instantly.',
        },
        {
          step: 2,
          title: 'Get discovered nearby',
          body: 'When a customer searches for your category near your area — groceries, electronics, fashion, salon — your listing appears with your distance, rating, and a chat button.',
        },
        {
          step: 3,
          title: 'Build your reputation',
          body: 'Happy customers leave reviews and ratings on your profile. Post promotions and offers to keep locals engaged and coming back.',
        },
      ]}
      prevFeature={{ label: 'Digital Store', href: '/features/store' }}
      nextFeature={{ label: 'Sales Record', href: '/features/sales' }}
    />
  )
}