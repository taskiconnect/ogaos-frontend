import { notFound } from 'next/navigation'
import { getPublicDigitalProduct } from '@/lib/api/public'
import ProductExperience from './ProductExperience'

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function DigitalProductPage({ params }: PageProps) {
  const { slug } = await params

  let product: Awaited<ReturnType<typeof getPublicDigitalProduct>> | null = null

  try {
    product = await getPublicDigitalProduct(slug)
  } catch (error) {
    const message =
      error instanceof Error ? error.message.toLowerCase() : 'failed to fetch digital product'

    if (message.includes('product not found') || message.includes('failed to fetch digital product')) {
      notFound()
    }

    throw error
  }

  if (!product) notFound()

  return <ProductExperience product={product} />
}