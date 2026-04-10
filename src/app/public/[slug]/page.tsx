import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { HeroBanner } from '@/components/public/HeroBanner'
import { StickyNav } from '@/components/public/StickyNav'
import { StatsBar } from '@/components/public/StatsBar'
import { ProfileContent } from '@/components/public/ProfileContent'

import { getPublicBusinessFull } from '@/lib/api/public'
import { parseGallery, slugAccent } from '@/types/public'

export const revalidate = 60

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params

  try {
    const page = await getPublicBusinessFull(slug)
    const biz = page.business
    const locationBits = [biz.city_town, biz.state].filter(Boolean).join(', ')

    const title = `${biz.name} • ${biz.category}${locationBits ? ` in ${locationBits}` : ''} | OgaOS`

    const description = biz.description
      ? `${biz.description.slice(0, 155)}${biz.description.length > 155 ? '…' : ''}`
      : `Explore ${biz.name} on OgaOS.`

    const canonicalUrl = `https://ogaos.com/public/${biz.slug}`
    const ogImage = biz.logo_url
      ? `${biz.logo_url}${biz.logo_url.includes('?') ? '&' : '?'}tr=w-1200,h-630,q-80,f-auto`
      : undefined

    return {
      title,
      description,
      keywords: [biz.name, biz.category, biz.city_town, biz.state, ...biz.keywords]
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
        siteName: 'OgaOS',
        ...(ogImage
          ? {
              images: [
                {
                  url: ogImage,
                  width: 1200,
                  height: 630,
                  alt: biz.name,
                },
              ],
            }
          : {}),
      },
      twitter: {
        card: ogImage ? 'summary_large_image' : 'summary',
        title,
        description,
        ...(ogImage ? { images: [ogImage] } : {}),
      },
    }
  } catch {
    return {
      title: 'Business Not Found | OgaOS',
    }
  }
}

export default async function PublicBusinessPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  let pageData
  try {
    pageData = await getPublicBusinessFull(slug)
  } catch {
    notFound()
  }

  if (!pageData?.business) {
    notFound()
  }

  const biz = pageData.business
  const digital = pageData.digital_products ?? []
  const physical = pageData.physical_products ?? []
  const services = pageData.services ?? []
  const keywords = biz.keywords ?? []
  const gallery = parseGallery(biz.gallery_image_urls)
  const accent = slugAccent(slug)

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: biz.name,
    description: biz.description ?? undefined,
    image: biz.logo_url ?? undefined,
    url: `https://ogaos.com/public/${biz.slug}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: biz.street || undefined,
      addressLocality: biz.city_town || undefined,
      addressRegion: biz.state || undefined,
      addressCountry: biz.country || 'NG',
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

        <StickyNav
          biz={biz}
          digital={digital}
          physical={physical}
          services={services}
          gallery={gallery}
        />

        <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <StatsBar
            stats={pageData.stats}
            business={biz}
          />

          <ProfileContent
            biz={biz}
            digital={digital}
            physical={physical}
            services={services}
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