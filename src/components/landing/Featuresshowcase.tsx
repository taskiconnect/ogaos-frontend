'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  BarChart3, CreditCard, Calculator, UserPlus,
  Users, ShoppingBag, ArrowRight,
  ShoppingCart, AlertTriangle, Circle, Briefcase,
  Package, TrendingUp, Search, CheckCircle2,
  MapPin, Star, MessageCircle, Tag,
} from 'lucide-react'

/* ══════════════════════════════════════════════════════════════
   STATIC UI MOCKUPS  (right-side overlay cards)
   ══════════════════════════════════════════════════════════════ */

function SalesMockup() {
  return (
    <div className="w-full max-w-[320px] bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
        <div className="flex items-center gap-2"><ShoppingCart className="w-4 h-4 text-blue-400" /><span className="text-sm font-bold text-white">Record a Sale</span></div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">LIVE</span>
      </div>
      <div className="px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2 bg-white/8 rounded-xl px-3 py-2">
          <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-[9px] font-bold text-blue-400">AT</div>
          <p className="text-xs font-semibold text-white flex-1">Alhaji Tunde</p>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        </div>
      </div>
      <div className="px-4 py-3 space-y-1.5 border-b border-white/5">
        {[['Indomie Carton x5','₦12,500'],['Groundnut Oil 4L','₦8,200']].map(([n,p])=>(
          <div key={n} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
            <Package className="w-3 h-3 text-blue-400 shrink-0" />
            <span className="text-xs text-white flex-1">{n}</span>
            <span className="text-xs font-bold text-white">{p}</span>
          </div>
        ))}
      </div>
      <div className="px-4 py-3 flex items-center justify-between">
        <div><p className="text-[10px] text-gray-400">Total</p><p className="text-xl font-extrabold text-white">₦20,700</p></div>
        <button className="px-4 py-2 rounded-xl text-xs font-bold text-white" style={{background:'linear-gradient(135deg,#1C35EA,#5b79ff)'}}>Record Sale</button>
      </div>
    </div>
  )
}

function DebtMockup() {
  return (
    <div className="w-full max-w-[320px] bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
        <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-orange-400" /><span className="text-sm font-bold text-white">Outstanding Debts</span></div>
        <span className="text-sm font-extrabold text-red-400">₦70,700</span>
      </div>
      <div className="px-4 py-3 space-y-2">
        {[['CO','Chioma Okafor','₦45,000','21d','text-red-400 bg-red-500/10 border-red-500/20'],
          ['EN','Emeka Nwosu','₦18,500','9d','text-orange-400 bg-orange-500/10 border-orange-500/20'],
          ['BA','Bisi Adeyemi','₦7,200','3d','text-yellow-400 bg-yellow-500/10 border-yellow-500/20']
        ].map(([init,name,amt,days,cls])=>(
          <div key={name} className="flex items-center gap-2.5 bg-white/5 rounded-xl px-3 py-2.5">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold ${cls.split(' ')[0]} bg-white/10`}>{init}</div>
            <p className="text-xs font-semibold text-white flex-1">{name}</p>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${cls}`}>{days}</span>
            <span className="text-xs font-bold text-white">{amt}</span>
          </div>
        ))}
      </div>
      <div className="px-4 py-3 border-t border-white/5">
        <button className="w-full py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2" style={{background:'linear-gradient(135deg,#075e54,#25d366)'}}>
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/></svg>
          Send WhatsApp Reminders
        </button>
      </div>
    </div>
  )
}

function TaxMockup() {
  return (
    <div className="w-full max-w-[320px] bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8">
        <Calculator className="w-4 h-4 text-emerald-400" />
        <div><p className="text-sm font-bold text-white">Tax Calculator</p><p className="text-[10px] text-gray-500">VAT · WHT · CIT</p></div>
      </div>
      <div className="px-4 py-3 space-y-3">
        <div className="flex items-center gap-2 bg-white/8 border border-white/10 rounded-xl px-3 py-2.5">
          <span className="text-sm font-bold text-emerald-400">₦</span>
          <span className="text-sm font-bold text-white">500,000</span>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 py-2 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-400">Goods</button>
          <button className="flex-1 py-2 rounded-xl text-xs text-gray-500 bg-white/5">Services</button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[['VAT (7.5%)','₦37,500','text-blue-400'],['WHT (5%)','₦25,000','text-orange-400'],['CIT (20%)','₦100,000','text-purple-400'],['Total Tax','₦162,500','text-red-400']].map(([l,v,c])=>(
            <div key={l} className="bg-white/5 border border-white/8 rounded-xl p-2.5">
              <p className="text-[9px] text-gray-500 mb-1">{l}</p>
              <p className={`text-sm font-extrabold ${c}`}>{v}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between bg-emerald-500/8 border border-emerald-500/15 rounded-xl px-3 py-2.5">
          <p className="text-xs text-gray-400">Net after tax</p>
          <p className="text-base font-extrabold text-emerald-400">₦337,500</p>
        </div>
      </div>
    </div>
  )
}

function RecruitmentMockup() {
  return (
    <div className="w-full max-w-[320px] bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
        <div className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-purple-400" /><span className="text-sm font-bold text-white">Open Roles</span></div>
        <button className="text-[10px] px-2.5 py-1 rounded-lg font-bold text-white" style={{background:'linear-gradient(135deg,#1C35EA,#5b79ff)'}}>+ Post Job</button>
      </div>
      <div className="px-4 py-3 space-y-2.5">
        {[['Senior Sales Rep','Full-time',14,'Mar 30'],['Store Manager','Full-time',8,'Apr 5']].map(([title,type,n,due])=>(
          <div key={title} className="bg-white/5 border border-white/8 rounded-xl p-3.5">
            <div className="flex items-start justify-between mb-2">
              <div><p className="text-xs font-bold text-white">{title}</p><span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 font-semibold mt-1 inline-block">{type}</span></div>
              <span className="text-[9px] text-gray-500">Due {due}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex -space-x-1.5">{[...Array(4)].map((_,k)=><div key={k} className="w-5 h-5 rounded-full bg-purple-500/20 border border-black flex items-center justify-center text-[8px] font-bold text-purple-400">{String.fromCharCode(65+k)}</div>)}</div>
              <span className="text-[10px] text-gray-500">{n} applicants</span>
            </div>
          </div>
        ))}
        <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2"><Search className="w-3.5 h-3.5 text-gray-500" /><span className="text-xs text-gray-500">Search applicants…</span></div>
      </div>
    </div>
  )
}

function StaffMockup() {
  const staff: { init: string; name: string; role: string; active: boolean }[] = [
    { init: 'FA', name: 'Funmi Adeyemi',  role: 'Store Manager',   active: true  },
    { init: 'CO', name: 'Chidi Okonkwo',  role: 'Sales Executive',  active: true  },
    { init: 'NE', name: 'Ngozi Eze',      role: 'Cashier',          active: false },
    { init: 'TB', name: 'Taiwo Balogun',  role: 'Driver',           active: true  },
  ]
  return (
    <div className="w-full max-w-[320px] bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
        <div className="flex items-center gap-2"><Users className="w-4 h-4 text-rose-400" /><div><p className="text-sm font-bold text-white">Staff Overview</p><p className="text-[10px] text-gray-500">3 active members</p></div></div>
        <span className="text-xs font-bold text-blue-400">Manage</span>
      </div>
      <div className="px-4 py-3 space-y-2.5">
        {staff.map(({ init, name, role, active }) => (
          <div key={name} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-blue-400 shrink-0">{init}</div>
            <div className="flex-1 min-w-0"><p className="text-xs font-semibold text-white truncate">{name}</p><p className="text-[10px] text-gray-500">{role}</p></div>
            <div className="flex items-center gap-1.5">
              <Circle className={`w-2 h-2 fill-current ${active ? 'text-emerald-400' : 'text-gray-600'}`} />
              <span className={`text-[10px] font-semibold ${active ? 'text-emerald-400' : 'text-gray-500'}`}>{active ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between">
        <span className="text-[10px] text-gray-500">View all staff</span>
        <span className="text-xs font-bold text-blue-400">4 total</span>
      </div>
    </div>
  )
}

function StoreMockup() {
  const products: { icon: string; name: string; price: string; type: string; sales: number }[] = [
    { icon: '🎓', name: 'Business Growth Masterclass', price: '₦15,000', type: 'Online Course',  sales: 142 },
    { icon: '📊', name: 'Excel for SME Owners',        price: '₦8,500',  type: 'Digital Guide',  sales: 89  },
    { icon: '📱', name: 'Social Media Playbook',        price: '₦5,000',  type: 'PDF Template',   sales: 211 },
  ]
  return (
    <div className="w-full max-w-[320px] bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-teal-400" />
          <div><p className="text-sm font-bold text-white">Digital Store</p><p className="text-[10px] text-gray-500">ogaos.store/your-store</p></div>
        </div>
        <span className="text-[9px] px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-400 font-bold border border-teal-500/20">LIVE</span>
      </div>
      <div className="px-4 py-3 space-y-2">
        {products.map(({ icon, name, price, type, sales }) => (
          <div key={name} className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center shrink-0 text-base">{icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{name}</p>
              <p className="text-[10px] text-gray-500">{type} · {sales} sold</p>
            </div>
            <p className="text-xs font-bold text-white shrink-0">{price}</p>
          </div>
        ))}
      </div>
      <div className="px-4 py-3 border-t border-white/5">
        <div className="flex items-center gap-2 bg-teal-500/8 border border-teal-500/15 rounded-xl px-3 py-2">
          <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
          <span className="text-xs text-teal-400 font-semibold">₦312,000 earned this month</span>
        </div>
      </div>
    </div>
  )
}

function DirectoryMockup() {
  const businesses = [
    { name: 'Mama Aisha Provisions', category: 'Groceries',   dist: '120m', rating: 4.9, open: true  },
    { name: 'Emeka Electronics',      category: 'Electronics', dist: '450m', rating: 4.7, open: true  },
    { name: 'Chioma Hair Salon',      category: 'Beauty',      dist: '280m', rating: 4.8, open: false },
  ]
  return (
    <div className="w-full max-w-[320px] bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-indigo-400" />
          <div>
            <p className="text-sm font-bold text-white">Nearby Businesses</p>
            <p className="text-[10px] text-gray-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              Lagos Island · GPS active
            </p>
          </div>
        </div>
        <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 font-bold border border-indigo-500/20">LIVE</span>
      </div>
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-2 bg-white/8 border border-white/10 rounded-xl px-3 py-2">
          <Search className="w-3.5 h-3.5 text-gray-500 shrink-0" />
          <span className="text-xs text-gray-500">Search category or name…</span>
        </div>
      </div>
      <div className="px-4 pb-3 space-y-2">
        {businesses.map(({ name, category, dist, rating, open }) => (
          <div key={name} className="bg-white/5 border border-white/8 rounded-xl p-3">
            <div className="flex items-start justify-between mb-1.5">
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-xs font-bold text-white truncate">{name}</p>
                <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                  <Tag className="w-2.5 h-2.5" />{category}
                  <span className="mx-0.5 opacity-30">·</span>
                  <MapPin className="w-2.5 h-2.5" />{dist}
                </p>
              </div>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${open ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {open ? 'Open' : 'Closed'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="text-[10px] font-bold text-white">{rating}</span>
              </div>
              <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-bold text-white" style={{background:'linear-gradient(135deg,#075e54,#25d366)'}}>
                <MessageCircle className="w-2.5 h-2.5" /> Chat
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   FEATURE DATA
   ══════════════════════════════════════════════════════════════ */
const features = [
  {
    id: 'sales',        tag: 'Sales Record',
    title: 'Every sale.\nTracked automatically.',
    description: 'Record cash, transfers, and POS sales in seconds. Get daily summaries sent to your WhatsApp — no spreadsheet needed.',
    icon: BarChart3,    accent: '#3b82f6',
    image: 'https://ik.imagekit.io/jwrqb9lqx/TaskiConnect%20Website/Image_fx%20(29).png',
    mockup: <SalesMockup />,
  },
  {
    id: 'debt',         tag: 'Debt Tracking',
    title: 'Chase debtors without\nthe awkward calls.',
    description: 'Log who owes you, how much, and when. OgaOS sends polite WhatsApp reminders automatically so you get paid without drama.',
    icon: CreditCard,   accent: '#f59e0b',
    image: 'https://ik.imagekit.io/jwrqb9lqx/TaskiConnect%20Website/Image_fx%20(30).png',
    mockup: <DebtMockup />,
  },
  {
    id: 'tax',          tag: 'Tax Calculation',
    title: 'Tax season without\nthe headache.',
    description: 'OgaOS auto-calculates your VAT and income tax as you go. Walk into any FIRS office with clean, ready-to-submit records.',
    icon: Calculator,   accent: '#10b981',
    image: 'https://ik.imagekit.io/jwrqb9lqx/TaskiConnect%20Website/Image_fx%20(35).png',
    mockup: <TaxMockup />,
  },
  {
    id: 'recruitment',  tag: 'Recruitment',
    title: 'Hire better people,\nfaster.',
    description: 'Post roles, review applications, and onboard new hires — all within OgaOS. No HR department required.',
    icon: UserPlus,     accent: '#a855f7',
    image: 'https://ik.imagekit.io/jwrqb9lqx/TaskiConnect%20Website/Image_fx%20(33).png',
    mockup: <RecruitmentMockup />,
  },
  {
    id: 'staff',        tag: 'Staff Management',
    title: 'Your team.\nAll in one place.',
    description: "Track attendance, assign roles, manage salaries and performance. Know who showed up, who didn't, and who deserves a raise.",
    icon: Users,        accent: '#f43f5e',
    image: 'https://ik.imagekit.io/jwrqb9lqx/TaskiConnect%20Website/Image_fx%20(34).png',
    mockup: <StaffMockup />,
  },
  {
    id: 'store',        tag: 'Digital Store',
    title: 'Sell online.\nGet paid in naira.',
    description: 'Launch your own digital storefront in minutes. Share your link on WhatsApp, Instagram, or anywhere — customers order and pay directly.',
    icon: ShoppingBag,  accent: '#14b8a6',
    image: 'https://ik.imagekit.io/jwrqb9lqx/TaskiConnect%20Website/Image_fx%20(31).png',
    mockup: <StoreMockup />,
  },
  {
    id: 'directory',    tag: 'Business Directory',
    title: 'Get found by customers\nnear you.',
    description: 'A GPS-powered local directory puts your business on the map. Customers nearby search for your category and find you — with reviews, photos, hours, and a WhatsApp chat button.',
    icon: MapPin,       accent: '#6366f1',
    image: 'https://ik.imagekit.io/jwrqb9lqx/TaskiConnect%20Website/Image_fx%20(33).png',
    mockup: <DirectoryMockup />,
  },
]

/* ══════════════════════════════════════════════════════════════
   FEATURE PANEL
   ══════════════════════════════════════════════════════════════ */
function FeaturePanel({ feature, index }: { feature: (typeof features)[0]; index: number }) {
  const Icon = feature.icon
  return (
    <div className="sticky top-0 w-full" style={{ zIndex: 10 + index }}>
      <div className="relative w-full min-h-screen overflow-hidden flex items-center">

        {/* ── Full-bleed background image ── */}
        <img
          src={feature.image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
          aria-hidden
        />

        {/* ── Dark gradient overlays ── */}
        <div className="absolute inset-0 bg-linear-to-r from-black/92 via-black/70 to-black/40" />
        <div className="absolute inset-0 bg-linear-to-b from-black/50 via-transparent to-black/60" />
        <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(ellipse at 20% 50%, ${feature.accent}40, transparent 60%)` }} />

        {/* ── Content ── */}
        <div className="relative z-10 container mx-auto max-w-7xl px-6 sm:px-10 lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center py-28 lg:py-0 min-h-screen">

          {/* LEFT: Text */}
          <div className="flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, margin: '-100px' }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="mb-6 inline-flex w-fit items-center gap-2.5"
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${feature.accent}25` }}>
                <Icon className="w-3.5 h-3.5" style={{ color: feature.accent }} />
              </div>
              <span className="text-xs font-bold tracking-[0.18em] uppercase" style={{ color: feature.accent }}>
                {feature.tag}
              </span>
            </motion.div>

            <motion.h3
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: '-100px' }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
              className="text-4xl sm:text-5xl lg:text-[3.25rem] xl:text-[3.75rem] font-extrabold tracking-tight text-white leading-[1.08] mb-6 whitespace-pre-line"
            >
              {feature.title}
            </motion.h3>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: '-100px' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              className="text-base lg:text-lg text-white/60 leading-relaxed mb-10 max-w-md"
            >
              {feature.description}
            </motion.p>

            {/* ── Learn more → /features/[id] ── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: '-100px' }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.14 }}
            >
              <Link
                href={`/features/${feature.id}`}
                className="inline-flex items-center gap-2.5 text-sm font-bold group w-fit"
                style={{ color: feature.accent }}
              >
                Learn more
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1 duration-200"
                  style={{ background: `${feature.accent}20` }}
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </motion.div>
          </div>

          {/* RIGHT: UI mockup card */}
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, margin: '-80px' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
            className="flex items-center justify-center lg:justify-end relative"
          >
            <div
              className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 rounded-full blur-3xl opacity-30"
              style={{ background: feature.accent }}
              aria-hidden
            />
            {feature.mockup}
          </motion.div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-24 bg-linear-to-t from-black/50 to-transparent pointer-events-none" />
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   MAIN EXPORT
   ══════════════════════════════════════════════════════════════ */
export function FeaturesShowcase() {
  return (
    <section className="relative">
      {/* Section header */}
      <div className="bg-background py-20 lg:py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="container mx-auto max-w-3xl px-4"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-1.5 text-sm font-semibold text-primary mb-5">
            Everything your business needs
          </span>
          <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-4">
            One platform.{' '}
            <span className="bg-linear-to-r from-primary via-primary/80 to-emerald-500 bg-clip-text text-transparent">
              Every tool.
            </span>
          </h2>
          <p className="text-lg text-muted-foreground/90 leading-relaxed">
            Stop juggling five different apps. OgaOS puts sales, debt, staff, tax, and your
            store all in one place — built for how Nigerian businesses actually work.
          </p>
        </motion.div>
      </div>

      {/* Sticky scroll panels */}
      <div className="relative">
        {features.map((feature, index) => (
          <FeaturePanel key={feature.id} feature={feature} index={index} />
        ))}
      </div>
    </section>
  )
}