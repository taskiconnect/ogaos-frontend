'use client'

import { useEffect, useMemo, useState } from 'react'
import { Grid3X3, Download, Package, Info, Image as ImageIcon } from 'lucide-react'
import type {
  PublicBusiness,
  DigitalProduct,
  PhysicalProduct,
} from '@/components/public/public-profile-shared'

interface Props {
  biz: PublicBusiness
  digital: DigitalProduct[]
  physical: PhysicalProduct[]
}

type SectionId = 'overview' | 'digital' | 'physical' | 'about' | 'gallery'

export function StickyNav({ biz, digital, physical }: Props) {
  const sections = useMemo(
    () =>
      [
        {
          id: 'overview' as SectionId,
          label: 'Overview',
          icon: Grid3X3,
          show: true,
        },
        {
          id: 'digital' as SectionId,
          label: 'Digital',
          icon: Download,
          show: digital.length > 0,
          badge: digital.length,
        },
        {
          id: 'physical' as SectionId,
          label: 'Products',
          icon: Package,
          show: physical.length > 0,
          badge: physical.length,
        },
        {
          id: 'about' as SectionId,
          label: 'About',
          icon: Info,
          show: Boolean(
            biz.description ||
              biz.phone_number ||
              biz.website_url ||
              biz.street ||
              biz.city_town ||
              biz.state
          ),
        },
        {
          id: 'gallery' as SectionId,
          label: 'Gallery',
          icon: ImageIcon,
          show: Boolean(biz.gallery_image_urls),
        },
      ].filter((item) => item.show),
    [biz, digital.length, physical.length]
  )

  const [active, setActive] = useState<SectionId>('overview')

  useEffect(() => {
    const ids = sections.map((section) => section.id)
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el))

    if (!elements.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        if (visible[0]?.target?.id) {
          setActive(visible[0].target.id as SectionId)
        }
      },
      {
        rootMargin: '-35% 0px -50% 0px',
        threshold: [0.15, 0.3, 0.5, 0.75],
      }
    )

    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [sections])

  const scrollToSection = (id: SectionId) => {
    const el = document.getElementById(id)
    if (!el) return

    const top = el.getBoundingClientRect().top + window.scrollY - 92
    window.scrollTo({
      top,
      behavior: 'smooth',
    })
  }

  if (!sections.length) return null

  return (
    <div className="sticky top-0 z-30 border-y border-white/10 bg-[#0b1020]/80 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto py-3">
          {sections.map(({ id, label, icon: Icon, badge }) => {
            const isActive = active === id

            return (
              <button
                key={id}
                type="button"
                onClick={() => scrollToSection(id)}
                className={[
                  'inline-flex shrink-0 items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-all duration-200',
                  isActive
                    ? 'border-brand-blue bg-brand-blue text-white shadow-[0_10px_30px_rgba(91,118,255,0.28)]'
                    : 'border-white/10 bg-white/5 text-white/75 hover:border-white/20 hover:bg-white/10 hover:text-white',
                ].join(' ')}
                aria-pressed={isActive}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>

                {typeof badge === 'number' && (
                  <span
                    className={[
                      'rounded-full px-2 py-0.5 text-[11px] font-bold',
                      isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-white/80',
                    ].join(' ')}
                  >
                    {badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}