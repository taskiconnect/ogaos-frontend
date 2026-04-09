import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { HeroBanner } from '@/components/public/HeroBanner'
import { StickyNav } from '@/components/public/StickyNav'
import { StatsBar } from '@/components/public/StatsBar'
import { ProfileContent } from '@/components/public/ProfileContent'

import {
  type PublicBusiness,
  type DigitalProduct,
  type PhysicalProduct,
  slugAccent,
  parseGallery,
} from '@/components/public/public-profile-shared'

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080').replace(
  /\/api\/v1\/?$/,
  ''
)

export const revalidate = 60

async function fetchBusiness(slug: string): Promise<PublicBusiness | null> {
  try {
    const res = await fetch(`${API}/api/v1/public/business/${slug}`, {
      next: { revalidate: 60 },
    })

    if (!res.ok) return null

    const json = await res.json()
    return json?.data ?? json
  } catch {
    return null
  }
}

async function fetchDigitalProducts(slug: string): Promise<DigitalProduct[]> {
  try {
    const res = await fetch(`${API}/api/v1/public/business/${slug}/products`, {
      next: { revalidate: 60 },
    })

    if (!res.ok) return []

    const json = await res.json()
    return json?.data ?? []
  } catch {
    return []
  }
}

async function fetchPhysicalProducts(slug: string): Promise<PhysicalProduct[]> {
  try {
    const base = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXTAUTH_URL || 'http://localhost:3000'

    const res = await fetch(`${base}/api/public/business/${slug}/inventory`, {
      next: { revalidate: 60 },
    })

    if (!res.ok) return []

    const json = await res.json()
    return json?.data ?? []
  } catch {
    return []
  }
}

async function fetchKeywords(slug: string): Promise<string[]> {
  try {
    const res = await fetch(`${API}/api/v1/public/business/${slug}/keywords`, {
      next: { revalidate: 60 },
    })

    if (!res.ok) return []

    const json = await res.json()
    return Array.isArray(json?.data) ? json.data : []
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const biz = await fetchBusiness(slug)

  if (!biz) {
    return { title: 'Business Not Found | OgaOS' }
  }

  const locationBits = [biz.city_town, biz.state].filter(Boolean).join(', ')
  const title = `${biz.name} • ${biz.category}${locationBits ? ` in ${locationBits}` : ''} | OgaOS`

  const description = biz.description
    ? `${biz.description.slice(0, 155)}${biz.description.length > 155 ? '…' : ''}`
    : `Shop ${biz.name} — a ${biz.category} business in ${biz.city_town ?? biz.state ?? 'Nigeria'}. Find products, contact info, and more on OgaOS.`

  const ogImage =
    biz.logo_url ??
    'https://ik.imagekit.io/jwrqb9lqx/TaskiConnect%20Website/i%20love%20taking%20pictures%20of%20textures%20and%20turning%20them%20into%20cool%20backgrounds___.jpg?updatedAt=1775669147999'

  const canonicalUrl = `https://ogaos.com/public/${biz.slug}/profile`

  return {
    title,
    description,
    keywords: [
      biz.name,
      biz.category,
      biz.city_town ?? '',
      biz.state ?? '',
      'OgaOS',
      'Nigeria business',
    ]
      .filter(Boolean)
      .join(', '),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'website',
      url: canonicalUrl,
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: biz.name,
        },
      ],
      siteName: 'OgaOS',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function PublicBusinessProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const [biz, digital, physical, keywords] = await Promise.all([
    fetchBusiness(slug),
    fetchDigitalProducts(slug),
    fetchPhysicalProducts(slug),
    fetchKeywords(slug),
  ])

  if (!biz) {
    notFound()
  }

  const accent = slugAccent(slug)
  const gallery = parseGallery(biz.gallery_image_urls)

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: biz.name,
    description: biz.description ?? undefined,
    image: biz.logo_url ?? undefined,
    url: `https://ogaos.com/public/${biz.slug}/profile`,
    telephone: biz.phone_number ?? undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: biz.street ?? undefined,
      addressLocality: biz.city_town ?? undefined,
      addressRegion: biz.state ?? undefined,
      addressCountry: biz.country ?? 'NG',
    },
    ...(biz.website_url ? { sameAs: [biz.website_url] } : {}),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema),
        }}
      />

      <div className="min-h-screen bg-dash-bg text-foreground">
        <HeroBanner biz={biz} accent={accent} />

        <StickyNav biz={biz} digital={digital} physical={physical} />

        <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <StatsBar biz={biz} digital={digital} physical={physical} />

          <ProfileContent
            biz={biz}
            digital={digital}
            physical={physical}
            keywords={keywords}
            gallery={gallery}
            accent={accent}
          />
        </div>

        <div className="border-t border-dash-border py-8 text-center">
          <a
            href="/"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Powered by{' '}
            <span className="font-black text-foreground">
              Oga<span className="text-brand-blue">OS</span>
            </span>
          </a>
        </div>
      </div>
    </>
  )
}