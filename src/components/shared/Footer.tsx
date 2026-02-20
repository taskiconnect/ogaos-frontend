'use client'

import Link from 'next/link'
import { Twitter, Instagram, Facebook, Linkedin, Youtube, MessageCircle } from 'lucide-react'

const footerColumns = [
  {
    title: 'Product',
    items: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Blog', href: '/blog' },
    ],
  },
  {
    title: 'Legal',
    items: [
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Reviews', href: '/reviews' },
      { label: 'FAQs', href: '/faqs' },
    ],
  },
  {
    title: 'Others',
    items: [
      { label: 'Contact', href: '/contact' },
      { label: '404', href: '/404' },
    ],
  },
]

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com/ogaosng', label: 'X (Twitter)' },
  { icon: Youtube, href: 'https://youtube.com/@ogaosng', label: 'YouTube' },
  { icon: Linkedin, href: 'https://linkedin.com/company/ogaosng', label: 'LinkedIn' },
  { icon: Instagram, href: 'https://instagram.com/ogaosng', label: 'Instagram' },
  { icon: MessageCircle, href: 'https://wa.me/234XXXXXXXXXX', label: 'WhatsApp' },
]

export function Footer() {
  return (
    <footer className="relative bg-black text-gray-400 overflow-hidden pt-16 pb-24">
      {/* Very subtle grid background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 43, 157, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 43, 157, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Large fading "OgaOS" text – blends into black */}
      <div className="absolute inset-x-0 bottom-0 h-96 flex items-end justify-center pointer-events-none overflow-hidden">
        <h1
          className="text-[min(40vw,600px)] font-black tracking-tighter text-transparent bg-clip-text bg-linear-to-t from-black via-gray-900/60 to-transparent select-none"
          style={{
            lineHeight: 0.65,
            transform: 'translateY(25%)',
          }}
        >
          OgaOS
        </h1>
      </div>

      <div className="relative z-10 container mx-auto px-6 lg:px-8">
        {/* Main content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-16 mb-16">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-xl shadow-md">
                O
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">OgaOS</span>
            </Link>

            <p className="text-gray-400 text-sm leading-relaxed max-w-xs mb-8">
              Your smart business assistant for better money tracking, debt recovery, staff management, and credibility building.
            </p>

            {/* Social icons with bottom-up primary blue hover */}
            <div className="flex gap-5">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center justify-center w-11 h-11 rounded-lg bg-gray-900/50 hover:bg-gray-800/70 transition-colors overflow-hidden"
                  aria-label={label}
                >
                  {/* Bottom-up blue fill on hover */}
                  <div className="absolute inset-x-0 bottom-0 h-0 bg-primary/70 group-hover:h-full transition-all duration-400 ease-out" />
                  <Icon className="w-5 h-5 text-gray-400 group-hover:text-white relative z-10 transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerColumns.map((column) => (
            <div key={column.title} className="space-y-4">
              <h4 className="text-white font-semibold text-base">{column.title}</h4>
              <ul className="space-y-3">
                {column.items.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom copyright */}
        <div className="pt-12 mt-8 border-t border-gray-800/50 text-center md:text-left text-sm text-gray-500">
          © {new Date().getFullYear()} OgaOS. All rights reserved.
        </div>
      </div>
    </footer>
  )
}