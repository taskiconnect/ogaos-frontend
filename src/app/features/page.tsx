'use client'

export const dynamic = 'force-dynamic'

// src/app/features/page.tsx
'use client'

import { LandingHeader } from '@/components/shared/LandingHeader'
import { Footer } from '@/components/shared/Footer'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import {
  Wallet,
  Bell,
  Receipt,
  ShieldCheck,
  Users,
  MapPin,
  CreditCard,
  BarChart3,
  MessageCircle,
  Calendar,
  FileText,
  DollarSign,
  Smartphone,
  Lock,
  Check,
} from 'lucide-react'

const featureGroups = [
  {
    title: 'Smart Ledger & Financial Management',
    icon: Wallet,
    color: 'text-emerald-500',
    features: [
      'Income & Expense Recording – Log transactions in real-time',
      'Daily Sales Summary – Auto reports via WhatsApp/Email/SMS',
      'Profit/Loss Overview – Real-time business performance',
      'Bank Reconciliation – Auto-match with bank statements',
      'Expense Categorization – Track stock, rent, salaries, etc.',
      'Cash Flow Forecasting – Predict future cash position',
      'Weekly / Monthly / Annual Reports – Automated summaries',
      'Custom Date Range Reports – Analyze any period',
      'Export as PDF or Excel – Easy sharing & backups',
    ],
  },
  {
    title: 'Debt & Credit Management',
    icon: DollarSign,
    color: 'text-amber-500',
    features: [
      'Credit Sale Tagging – Mark transactions as credit instantly',
      'Customer Balance Tracking – See who owes what',
      'Due Date & Overdue Reminders – Never miss a payment',
      'Partial Payment Recording – Track installments',
      'Automated WhatsApp Reminders – Professional messages',
      'Custom Reminder Templates – Personalize your tone',
      'Bulk Messaging – Update multiple debtors at once',
      'Payment Links – Send instant pay links via WhatsApp',
      'Auto Payment Confirmation – When debts are cleared',
    ],
  },
  {
    title: 'Professional Identity & Trust Building',
    icon: ShieldCheck,
    color: 'text-blue-500',
    features: [
      'Custom Invoices & Receipts – Branded with your logo',
      'Digital Business Card – Share via WhatsApp instantly',
      'Estimate / Quotation Builder – Professional quotes',
      'Public Business Profile – Listed in OgaOS directory',
      'Verified Badge – Build instant trust',
      'BVN/NIN Verification (optional) – Enhanced credibility',
      'Customer Reviews & Ratings – Grow social proof',
      'Respond to Reviews – Engage directly with customers',
    ],
  },
  {
    title: 'Payment Gateway Integration',
    icon: CreditCard,
    color: 'text-purple-500',
    features: [
      'Paystack & Monnify – Secure card & bank payments',
      'Virtual Accounts – Dedicated per business',
      'Payment Links & Invoice Payments – Easy collection',
      'Automatic Reconciliation – Match transactions',
      'Transaction History – Full logs with customer details',
      'Settlement Tracking – See when funds arrive',
      'POS Integration – Connect terminals (coming soon)',
    ],
  },
  {
    title: 'Hyper-Local Business Directory',
    icon: MapPin,
    color: 'text-teal-500',
    features: [
      'GPS-Based Listings – Get discovered nearby',
      'Category Search – Customers find your type of business',
      'Rich Profiles – Products, photos, hours, map',
      'WhatsApp Chat Button – Instant customer contact',
      'Customer Reviews & Ratings – Build reputation',
      'Promotion Updates – Announce offers to locals',
      'Photo Uploads – Showcase your shop/products',
    ],
  },
  {
    title: 'Staff Manager (HR & Payroll)',
    icon: Users,
    color: 'text-pink-500',
    features: [
      'Digital Clock-In/Out – Via web or WhatsApp',
      'Attendance Reports – Daily/weekly/monthly logs',
      'Photo & Location Verification – Ensure staff are present',
      'Late Arrival Alerts – Instant notifications',
      'Leave & Task Management – Assign & approve',
      'Automated Payroll – Based on attendance/tasks',
      'Salary Disbursement Tracking – Record payments',
    ],
  },
  {
    title: 'Hire-Right Recruitment',
    icon: FileText,
    color: 'text-cyan-500',
    features: [
      'Create Job Listings – Post vacancies quickly',
      'Category-Based Matching – Find the right talent',
      'Application Tracking – Manage candidates',
      'Automated Screening – Pre-qualify applicants',
      'Shortlisting & Interview Tools – Save top candidates',
      'Candidate Messaging – Via WhatsApp/email',
    ],
  },
  {
    title: 'Global Notification System',
    icon: Bell,
    color: 'text-red-500',
    features: [
      'Daily Sales, Weekly, Monthly Summaries – Auto-sent',
      'Overdue Debt & Low Stock Alerts – Instant',
      'Delivery Channels: WhatsApp, SMS, Email, In-App',
      'Role-Based Preferences – Owner vs Staff',
      'Custom Frequency & Rules – You control alerts',
    ],
  },
  {
    title: 'Security & Access Control',
    icon: Lock,
    color: 'text-indigo-500',
    features: [
      'Secure Login & Role-Based Permissions',
      'Data Encryption & Regular Backups',
      'Audit Logs – Track every action',
      'Multi-Platform Access – Web + WhatsApp',
    ],
  },
]

export default function FeaturesPage() {
  return (
    <div className="relative min-h-screen bg-black text-white">
      <LandingHeader />

      {/* Hero */}
      <section className="relative py-20 md:py-32 bg-linear-to-br from-black via-gray-950 to-black">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0, 43, 157, 0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 43, 157, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: '64px 64px',
          }}
        />

        <div className="relative z-10 container mx-auto px-5 sm:px-6 lg:px-8 text-center pt-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
              Everything your business needs,<br />
              <span className="text-primary">in one place</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-12">
              From money tracking to debt recovery, staff management, customer trust, and local discovery — OgaOS is built for Nigerian SMEs.
            </p>

            <Button
              size="lg"
              className="min-w-65 h-14 text-lg font-semibold rounded-full bg-primary hover:bg-primary/90 text-white shadow-xl shadow-blue-950/30 transition-all hover:scale-105"
            >
              Get Started – It's free
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 md:py-32 bg-black">
        <div className="container mx-auto px-5 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {featureGroups.map((group, index) => (
              <motion.div
                key={group.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.7 }}
                className="bg-gray-900/40 border border-gray-800 rounded-2xl p-8 hover:border-primary/50 transition-all group"
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform bg-white/5`}>
                  <group.icon className={`w-7 h-7 ${group.color}`} />
                </div>

                <h3 className="text-2xl font-bold text-white mb-4">{group.title}</h3>

                <ul className="space-y-3 text-gray-300">
                  {group.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 md:py-32 bg-linear-to-br from-black to-gray-950 text-center">
        <div className="container mx-auto px-5 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Start running your business like an{' '}
            <span className="text-primary">Oga</span>
          </h2>

          <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
            Join thousands of Nigerian SMEs already using OgaOS to track money, recover debts, manage staff, and build trust.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              className="min-w-65 h-14 text-lg font-semibold rounded-full bg-primary hover:bg-primary/90 text-white shadow-xl shadow-blue-950/30 transition-all hover:scale-105"
            >
              Sign Up Now – It's free
            </Button>

            <Button
              size="lg"
              className="min-w-65 h-14 text-lg font-semibold rounded-full text-white transition-all hover:scale-105"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.20)',
              }}
            >
              View Pricing
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}