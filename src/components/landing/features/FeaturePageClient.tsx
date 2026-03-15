'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft, ArrowRight, CheckCircle2,
  BarChart3, CreditCard, Calculator, UserPlus, Users, ShoppingBag,
  ShoppingCart, AlertTriangle, Circle, Briefcase, Package, TrendingUp, Search,
  MapPin, Star, MessageCircle, Camera, Clock, Tag,
} from 'lucide-react'
import { LandingHeader } from '@/components/shared/LandingHeader'
import { Footer } from '@/components/shared/Footer'
import { Button } from '@/components/ui/button'

/* ── Serialisable props only — no components, no JSX ──────────── */
export interface FeaturePageClientProps {
  id: 'sales' | 'debt' | 'tax' | 'recruitment' | 'staff' | 'store' | 'directory'
  tag: string
  title: string
  subtitle: string
  description: string
  accent: string
  image: string
  benefits: string[]
  howItWorks: { step: number; title: string; body: string }[]
  nextFeature: { label: string; href: string }
  prevFeature: { label: string; href: string }
}

/* ══════════════════════════════════════════════════════════════
   ICON MAP  — resolved client-side by id
   ══════════════════════════════════════════════════════════════ */
const ICON_MAP = {
  sales:       BarChart3,
  debt:        CreditCard,
  tax:         Calculator,
  recruitment: UserPlus,
  staff:       Users,
  store:       ShoppingBag,
  directory:   MapPin,
} as const

/* ══════════════════════════════════════════════════════════════
   MOCKUP MAP  — resolved client-side by id
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
        {[
          {init:'CO',name:'Chioma Okafor',amt:'₦45,000',days:'21d',cls:'text-red-400 bg-red-500/10 border-red-500/20'},
          {init:'EN',name:'Emeka Nwosu',  amt:'₦18,500',days:'9d', cls:'text-orange-400 bg-orange-500/10 border-orange-500/20'},
          {init:'BA',name:'Bisi Adeyemi', amt:'₦7,200', days:'3d', cls:'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'},
        ].map(({init,name,amt,days,cls})=>(
          <div key={name} className="flex items-center gap-2.5 bg-white/5 rounded-xl px-3 py-2.5">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold bg-white/10 ${cls.split(' ')[0]}`}>{init}</div>
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
        {[{title:'Senior Sales Rep',type:'Full-time',n:14,due:'Mar 30'},{title:'Store Manager',type:'Full-time',n:8,due:'Apr 5'}].map(({title,type,n,due})=>(
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
  const staff = [
    {init:'FA',name:'Funmi Adeyemi', role:'Store Manager',  active:true },
    {init:'CO',name:'Chidi Okonkwo', role:'Sales Executive', active:true },
    {init:'NE',name:'Ngozi Eze',     role:'Cashier',         active:false},
    {init:'TB',name:'Taiwo Balogun', role:'Driver',          active:true },
  ]
  return (
    <div className="w-full max-w-[320px] bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
        <div className="flex items-center gap-2"><Users className="w-4 h-4 text-rose-400" /><div><p className="text-sm font-bold text-white">Staff Overview</p><p className="text-[10px] text-gray-500">3 active members</p></div></div>
        <span className="text-xs font-bold text-blue-400">Manage</span>
      </div>
      <div className="px-4 py-3 space-y-2.5">
        {staff.map(({init,name,role,active})=>(
          <div key={name} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[10px] font-bold text-blue-400 shrink-0">{init}</div>
            <div className="flex-1 min-w-0"><p className="text-xs font-semibold text-white truncate">{name}</p><p className="text-[10px] text-gray-500">{role}</p></div>
            <div className="flex items-center gap-1.5">
              <Circle className={`w-2 h-2 fill-current ${active?'text-emerald-400':'text-gray-600'}`} />
              <span className={`text-[10px] font-semibold ${active?'text-emerald-400':'text-gray-500'}`}>{active?'Active':'Inactive'}</span>
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
  const products = [
    {icon:'🎓',name:'Business Growth Masterclass',price:'₦15,000',type:'Online Course', sales:142},
    {icon:'📊',name:'Excel for SME Owners',       price:'₦8,500', type:'Digital Guide', sales:89 },
    {icon:'📱',name:'Social Media Playbook',       price:'₦5,000', type:'PDF Template',  sales:211},
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
        {products.map(({icon,name,price,type,sales})=>(
          <div key={name} className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center shrink-0 text-base">{icon}</div>
            <div className="flex-1 min-w-0"><p className="text-xs font-semibold text-white truncate">{name}</p><p className="text-[10px] text-gray-500">{type} · {sales} sold</p></div>
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
    { name: 'Mama Aisha Provisions', category: 'Groceries',    dist: '120m', rating: 4.9, reviews: 38, open: true  },
    { name: 'Emeka Electronics',      category: 'Electronics',  dist: '450m', rating: 4.7, reviews: 21, open: true  },
    { name: 'Chioma Hair Salon',      category: 'Beauty',       dist: '280m', rating: 4.8, reviews: 55, open: false },
  ]
  return (
    <div className="w-full max-w-[320px] bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
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

      {/* Search bar */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-2 bg-white/8 border border-white/10 rounded-xl px-3 py-2">
          <Search className="w-3.5 h-3.5 text-gray-500 shrink-0" />
          <span className="text-xs text-gray-500">Search category or name…</span>
          <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-md bg-indigo-500/15 text-indigo-400 font-semibold">Filter</span>
        </div>
      </div>

      {/* Listings */}
      <div className="px-4 pb-3 space-y-2.5">
        {businesses.map(({ name, category, dist, rating, reviews, open }) => (
          <div key={name} className="bg-white/5 border border-white/8 rounded-xl p-3">
            <div className="flex items-start justify-between mb-1.5">
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-xs font-bold text-white truncate">{name}</p>
                <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                  <Tag className="w-2.5 h-2.5" />{category}
                  <span className="mx-1 opacity-30">·</span>
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
                <span className="text-[9px] text-gray-500">({reviews})</span>
              </div>
              <button
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#075e54,#25d366)' }}
              >
                <MessageCircle className="w-2.5 h-2.5" /> Chat
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom promo pill */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 bg-indigo-500/8 border border-indigo-500/15 rounded-xl px-3 py-2">
          <Camera className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="text-[10px] text-indigo-300 font-semibold">Your business appears here — free</span>
        </div>
      </div>
    </div>
  )
}

const MOCKUP_MAP = {
  sales:       <SalesMockup />,
  debt:        <DebtMockup />,
  tax:         <TaxMockup />,
  recruitment: <RecruitmentMockup />,
  staff:       <StaffMockup />,
  store:       <StoreMockup />,
  directory:   <DirectoryMockup />,
} as const

/* ══════════════════════════════════════════════════════════════
   ANIMATION VARIANTS
   ══════════════════════════════════════════════════════════════ */
const fadeUp = {
  hidden:  { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
}
const stagger = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
}

/* ══════════════════════════════════════════════════════════════
   MAIN CLIENT COMPONENT
   ══════════════════════════════════════════════════════════════ */
export function FeaturePageClient({
  id, tag, title, subtitle, description, accent, image,
  benefits, howItWorks, nextFeature, prevFeature,
}: FeaturePageClientProps) {
  const Icon   = ICON_MAP[id]
  const mockup = MOCKUP_MAP[id]

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <LandingHeader />

      {/* ── HERO ── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover object-center" aria-hidden />
        <div className="absolute inset-0 bg-linear-to-r from-black/92 via-black/70 to-black/35" />
        <div className="absolute inset-0 bg-linear-to-b from-black/50 via-transparent to-black/70" />
        <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(ellipse at 15% 50%, ${accent}50, transparent 60%)` }} />

        <div className="relative z-10 container mx-auto max-w-7xl px-6 sm:px-10 lg:px-16 pt-28 pb-20">
          <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors mb-10 group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Back to features
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: copy */}
            <motion.div variants={stagger} initial="hidden" animate="visible">
              <motion.div variants={fadeUp} className="mb-6 inline-flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${accent}25` }}>
                  <Icon className="w-4 h-4" style={{ color: accent }} />
                </div>
                <span className="text-xs font-bold tracking-[0.18em] uppercase" style={{ color: accent }}>{tag}</span>
              </motion.div>

              <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-white leading-[1.06] mb-5 whitespace-pre-line">
                {title}
              </motion.h1>

              <motion.p variants={fadeUp} className="text-lg lg:text-xl text-white/55 leading-relaxed mb-4 max-w-lg">
                {subtitle}
              </motion.p>

              <motion.p variants={fadeUp} className="text-base text-white/40 leading-relaxed mb-10 max-w-md">
                {description}
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" className="h-13 px-8 text-base font-semibold rounded-full text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${accent}cc, ${accent})` }}>
                  Get started — it's free
                </Button>
                <Button size="lg" variant="outline" className="h-13 px-8 text-base font-semibold rounded-full border-white/20 text-white hover:bg-white/10">
                  See a demo <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </motion.div>
            </motion.div>

            {/* Right: mockup */}
            <motion.div
              initial={{ opacity: 0, y: 32, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              className="flex justify-center lg:justify-end relative"
            >
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-24 rounded-full blur-3xl opacity-25" style={{ background: accent }} aria-hidden />
              {mockup}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto max-w-5xl px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.65 }} className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground mb-3">
              Why it works for{' '}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${accent}, ${accent}aa)` }}>
                Nigerian SMEs
              </span>
            </h2>
            <p className="text-muted-foreground/80 text-lg max-w-xl mx-auto">
              Built around how business actually happens here — cash, credit, WhatsApp, and hustle.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {benefits.map((benefit, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.55, delay: i * 0.07 }} className="flex items-start gap-3 p-5 rounded-2xl border border-border/60 bg-card">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: accent }} />
                <p className="text-sm font-medium text-foreground leading-relaxed">{benefit}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 lg:py-28 bg-muted/30">
        <div className="container mx-auto max-w-4xl px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.65 }} className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground mb-3">How it works</h2>
            <p className="text-muted-foreground/80 text-lg">Three steps. No wahala.</p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-6 top-8 bottom-8 w-px bg-border/60 hidden sm:block" aria-hidden />
            <div className="space-y-8">
              {howItWorks.map((step, i) => (
                <motion.div key={step.step} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.6, delay: i * 0.1 }} className="flex gap-6 items-start">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-base font-extrabold text-white shrink-0 relative z-10" style={{ background: `linear-gradient(135deg, ${accent}cc, ${accent})` }}>
                    {step.step}
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="text-lg font-bold text-foreground mb-1">{step.title}</h3>
                    <p className="text-muted-foreground/80 leading-relaxed">{step.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="relative py-24 overflow-hidden">
        <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover object-center opacity-30" aria-hidden />
        <div className="absolute inset-0 bg-linear-to-r from-black/90 via-black/80 to-black/90" />
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="relative z-10 container mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4">Ready to try {tag}?</h2>
          <p className="text-white/55 text-lg mb-8">Join thousands of Nigerian business owners already using OgaOS. Free to start, no credit card needed.</p>
          <Button size="lg" className="h-14 px-10 text-base font-semibold rounded-full text-white shadow-xl" style={{ background: `linear-gradient(135deg, ${accent}cc, ${accent})` }}>
            Start for free today
          </Button>
        </motion.div>
      </section>

      {/* ── PREV / NEXT ── */}
      <div className="bg-background border-t border-border/50 py-8">
        <div className="container mx-auto max-w-5xl px-6 flex items-center justify-between gap-4">
          <Link href={prevFeature.href} className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>{prevFeature.label}</span>
          </Link>
          <Link href="/" className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors">All features</Link>
          <Link href={nextFeature.href} className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group">
            <span>{nextFeature.label}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}