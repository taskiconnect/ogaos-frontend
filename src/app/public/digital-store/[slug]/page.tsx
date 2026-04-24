import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag, Package, ArrowRight, Store } from 'lucide-react'
import { getPublicDigitalStore } from '@/lib/api/public'
import { formatCurrency } from '@/types/public'
import { LandingHeader } from '@/components/shared/LandingHeader'
import { Footer } from '@/components/shared/Footer'

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function DigitalStorePage({ params }: PageProps) {
  const { slug } = await params
  const store = await getPublicDigitalStore(slug)

  return (
    <main className="min-h-screen bg-background text-white">
      <LandingHeader />

      {/* ── STORE HERO ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-white/8 bg-dash-subtle">
        {/* Brand glow */}
        <div className="pointer-events-none absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute top-0 right-0 h-48 w-48 rounded-full bg-primary/10 blur-3xl" aria-hidden />

        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:py-16 sm:px-6 lg:px-8">
          <div className="flex items-start gap-6">
            {/* Logo */}
            {store.business.logo_url ? (
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-3xl border border-white/10 bg-dash-raised shadow-xl shadow-black/30">
                <Image
                  src={store.business.logo_url}
                  alt={store.business.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-primary/20 bg-primary/10 text-2xl font-black text-primary shadow-xl shadow-black/30">
                {store.business.name.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                  <Store className="h-3 w-3" />
                  Digital Store
                </span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                {store.business.name}
              </h1>
              <p className="mt-2 text-sm text-gray-400">
                {store.products.length === 0
                  ? 'No products published yet'
                  : `${store.products.length} digital product${store.products.length !== 1 ? 's' : ''} available`}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRODUCTS GRID ──────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-12 sm:px-6 lg:px-8">
        {store.products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-dash-surface p-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03]">
              <Package className="h-6 w-6 text-gray-500" />
            </div>
            <h2 className="text-base font-bold text-white">No products yet</h2>
            <p className="mt-1.5 text-sm text-gray-500">
              This store hasn&apos;t published any digital products yet.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between gap-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
                {store.products.length} product{store.products.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {store.products.map((product) => (
                <article
                  key={product.id}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-white/8 bg-dash-surface transition hover:border-white/14 hover:bg-dash-raised hover:shadow-xl hover:shadow-black/20"
                >
                  {/* Cover */}
                  <div className="relative h-52 w-full overflow-hidden bg-dash-subtle">
                    {product.cover_image_url ? (
                      <Image
                        src={product.cover_image_url}
                        alt={product.title}
                        fill
                        className="object-cover transition duration-300 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ShoppingBag className="h-10 w-10 text-white/10" />
                      </div>
                    )}
                    {/* Type badge overlaid on cover */}
                    <div className="absolute bottom-3 left-3">
                      <span className="rounded-full border border-primary/30 bg-black/50 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                        {product.type}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-2">
                      <span className="rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-0.5 text-[10px] font-semibold capitalize text-gray-500">
                        {product.fulfillment_mode.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <h2 className="line-clamp-2 text-base font-bold text-white leading-snug">
                      {product.title}
                    </h2>

                    <p className="mt-2 line-clamp-2 flex-1 text-xs leading-5 text-gray-500">
                      {product.description}
                    </p>

                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/6 pt-4">
                      <p className="text-xl font-black text-white tracking-tight">
                        {formatCurrency(product.price, product.currency)}
                      </p>

                      <Link
                        href={`/public/digital-store/product/${product.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/25 transition hover:opacity-90"
                      >
                        View
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      <Footer />
    </main>
  )
}