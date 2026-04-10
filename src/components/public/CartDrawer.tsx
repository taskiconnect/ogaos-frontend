'use client'

import Image from 'next/image'
import {
  X,
  ShoppingCart,
  Download,
  Package,
  Minus,
  Plus,
  MessageCircle,
  CreditCard,
  Shield,
  Truck,
  RefreshCw,
  BriefcaseBusiness,
} from 'lucide-react'
import type { PublicBusiness, CartItem } from '@/types/public'
import { formatCurrency } from '@/types/public'

interface Props {
  items: CartItem[]
  onUpdate: (id: string, qty: number) => void
  onClose: () => void
  biz: PublicBusiness
}

export function CartDrawer({ items, onUpdate, onClose, biz }: Props) {
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0)
  const count = items.reduce((sum, item) => sum + item.qty, 0)

  function handleWhatsAppOrder() {
    const lines = items
      .map((item) => `• ${item.name} ×${item.qty} — ${formatCurrency(item.price * item.qty)}`)
      .join('\n')

    const msg = `Hi ${biz.name}! I'd like to order:\n\n${lines}\n\nTotal: ${formatCurrency(total)}`
    const phone = ''
    const url = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`

    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex" onClick={onClose}>
        <div className="flex-1 bg-black/60 backdrop-blur-sm" />

        <div
          className="flex w-full max-w-md flex-col border-l border-white/8 bg-[#0e0e18] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          style={{ animation: 'slideInRight 0.3s cubic-bezier(0.16,1,0.3,1)' }}
        >
          <div className="flex items-center justify-between border-b border-white/8 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-blue/30 bg-brand-blue/20">
                <ShoppingCart className="h-4 w-4 text-brand-blue" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Your Cart</h2>
                <p className="text-xs text-gray-500">
                  {count} item{count !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/8 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-5">
            {items.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center gap-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/8 bg-white/4">
                  <ShoppingCart className="h-6 w-6 text-gray-600" />
                </div>
                <p className="text-sm text-gray-500">Your cart is empty</p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/3 p-3"
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white/5">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        {item.type === 'digital' ? (
                          <Download className="h-5 w-5 text-gray-600" />
                        ) : item.type === 'service' ? (
                          <BriefcaseBusiness className="h-5 w-5 text-gray-600" />
                        ) : (
                          <Package className="h-5 w-5 text-gray-600" />
                        )}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-semibold text-white">{item.name}</p>
                    <p className="text-xs capitalize text-gray-500">{item.type}</p>
                    <p className="mt-0.5 text-sm font-bold text-brand-blue">
                      {formatCurrency(item.price)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      onClick={() => onUpdate(item.id, item.qty - 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/8 text-white transition-colors hover:bg-white/15"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-bold text-white">{item.qty}</span>
                    <button
                      onClick={() => onUpdate(item.id, item.qty + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/8 text-white transition-colors hover:bg-white/15"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {items.length > 0 && (
            <div className="space-y-3 border-t border-white/8 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Subtotal</span>
                <span className="text-lg font-bold text-white">{formatCurrency(total)}</span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={handleWhatsAppOrder}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-sm font-bold text-white transition-colors hover:bg-[#20bd5a]"
                >
                  <MessageCircle className="h-4 w-4" />
                  Order via WhatsApp
                </button>

                <button className="flex items-center justify-center gap-2 rounded-xl bg-brand-blue py-3 text-sm font-bold text-white transition-colors hover:bg-[#1528d4]">
                  <CreditCard className="h-4 w-4" />
                  Checkout & Pay
                </button>
              </div>

              <div className="flex items-center justify-center gap-4 pt-1">
                <span className="flex items-center gap-1 text-[10px] text-gray-600">
                  <Shield className="h-3 w-3" /> Secure
                </span>
                <span className="flex items-center gap-1 text-[10px] text-gray-600">
                  <Truck className="h-3 w-3" /> Fast Delivery
                </span>
                <span className="flex items-center gap-1 text-[10px] text-gray-600">
                  <RefreshCw className="h-3 w-3" /> Easy Returns
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </>
  )
}