import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { getPublicBusinessFull } from '@/lib/api/public'
import { formatCurrency } from '@/types/public'
import { ProductDetailContent } from '@/components/public/ProductDetailContent'

export const revalidate = 60

type PageParams = { slug: string; productId: string }

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>
}): Promise<Metadata> {
  const { slug, productId } = await params

  try {
    const page = await getPublicBusinessFull(slug)
    const biz = page.business

    const allProducts = [
      ...page.digital_products.map((p) => ({ id: p.id, name: p.title, description: p.description, image: p.cover_image_url })),
      ...page.physical_products.map((p) => ({ id: p.id, name: p.name, description: p.description, image: p.image_url })),
      ...page.services.map((p) => ({ id: p.id, name: p.name, description: p.description, image: p.image_url })),
    ]

    const product = allProducts.find((p) => p.id === productId)
    if (!product) return { title: 'Product Not Found | OgaOS' }

    const title = `${product.name} — ${biz.name} | OgaOS`
    const description = product.description
      ? `${product.description.slice(0, 155)}${product.description.length > 155 ? '…' : ''}`
      : `View ${product.name} from ${biz.name} on OgaOS.`

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        ...(product.image ? { images: [{ url: product.image, width: 1200, height: 630, alt: product.name }] } : {}),
      },
    }
  } catch {
    return { title: 'Product Not Found | OgaOS' }
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<PageParams>
}) {
  const { slug, productId } = await params

  let pageData
  try {
    pageData = await getPublicBusinessFull(slug)
  } catch {
    notFound()
  }

  if (!pageData?.business) notFound()

  const biz = pageData.business

  // Find product across all three categories
  const digitalProduct = pageData.digital_products.find((p) => p.id === productId)
  const physicalProduct = pageData.physical_products.find((p) => p.id === productId)
  const serviceProduct = pageData.services.find((p) => p.id === productId)

  const product = digitalProduct ?? physicalProduct ?? serviceProduct
  if (!product) notFound()

  const itemKind = digitalProduct ? 'digital' : serviceProduct ? 'service' : 'physical'

  return (
    <div className="min-h-screen bg-dash-bg text-foreground">
      {/* Back nav */}
      <div className="sticky top-0 z-20 border-b border-dash-border bg-dash-bg/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link
            href={`/public/${slug}`}
            className="flex items-center gap-1.5 rounded-xl border border-dash-border bg-dash-surface px-3 py-1.5 text-xs font-bold text-muted-foreground transition-all hover:bg-dash-hover hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to {biz.name}
          </Link>
          <span className="text-xs text-muted-foreground/50">/</span>
          <span className="line-clamp-1 text-xs text-muted-foreground">
            {'title' in product ? product.title : product.name}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <ProductDetailContent
          product={product}
          itemKind={itemKind}
          biz={biz}
          slug={slug}
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
  )
}