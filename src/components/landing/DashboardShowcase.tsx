'use client'

import { BarChart3, TrendingUp, Users, Wallet, MapPin, Star, MessageCircle, Bell, Settings } from 'lucide-react'
import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
}

const card = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
}

export function DashboardShowcase() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="w-full max-w-370 mx-auto rounded-3xl border border-border/40 bg-card shadow-2xl overflow-hidden"
    >
      {/* Browser Header – cleaner */}
      <div className="bg-muted/40 border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3.5 h-3.5 rounded-full bg-red-500/90" />
          <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/90" />
          <div className="w-3.5 h-3.5 rounded-full bg-green-500/90" />
        </div>
        <span className="text-sm font-medium text-muted-foreground/80">dashboard.ogaos.com</span>
        <div className="flex items-center gap-2.5">
          <div className="text-xs px-2.5 py-1 bg-primary/10 text-primary rounded-full font-medium">
            LIVE
          </div>
        </div>
      </div>

      {/* Main Dashboard – more breathing room */}
      <div className="p-6 lg:p-10 xl:p-12 space-y-10 xl:space-y-12 bg-linear-to-b from-background to-background/80">
        {/* Welcome + Quick Actions */}
        <motion.div variants={card} className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Good morning, Oga Tunde 👋</h2>
            <p className="text-muted-foreground mt-1.5">Tuesday, February 20, 2026 • Lagos</p>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-full text-sm">
              <MapPin className="w-4 h-4 text-primary" />
              <span>Lagos Island</span>
            </div>
            <button className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition">
              New Sale
            </button>
          </div>
        </motion.div>

        {/* Summary Cards – wider, cleaner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 xl:gap-6">
          {[
            {
              title: 'Today’s Revenue',
              value: '₦142,800',
              trend: '+18%',
              icon: Wallet,
              color: 'text-emerald-600 dark:text-emerald-400',
            },
            {
              title: 'Active Customers',
              value: '287',
              trend: '+24 this week',
              icon: Users,
              color: 'text-blue-600 dark:text-blue-400',
            },
            {
              title: 'Outstanding Debt',
              value: '₦89,400',
              trend: '12 customers',
              icon: BarChart3,
              color: 'text-amber-600 dark:text-amber-400',
            },
            {
              title: 'Staff Online',
              value: '8 / 12',
              trend: 'All present',
              icon: Users,
              color: 'text-purple-600 dark:text-purple-400',
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.title}
              custom={i}
              variants={card}
              className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${stat.color.replace('text-', 'bg-')}/10 flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <p className={`text-sm font-medium ${stat.trend.includes('+') ? 'text-green-600' : 'text-muted-foreground'}`}>
                {stat.trend}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Main Sections – wider layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 xl:gap-8">
          {/* Sales Trend – Recharts AreaChart */}
          <motion.div variants={card} className="xl:col-span-8 bg-card border border-border/60 rounded-3xl p-6 lg:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-foreground">Sales Trend • This Week</h3>
                <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-green-600 dark:text-green-400 font-medium">+18%</span> vs last week
                </p>
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-1 bg-secondary rounded-xl p-1">
                <button className="px-3 py-1.5 bg-card rounded-lg font-medium text-foreground shadow-sm transition">Week</button>
                <button className="px-3 py-1.5 hover:text-foreground transition rounded-lg">Month</button>
              </div>
            </div>
            <div className="h-72 lg:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={[
                    { day: 'Mon', revenue: 52000, expenses: 28000 },
                    { day: 'Tue', revenue: 87000, expenses: 34000 },
                    { day: 'Wed', revenue: 68000, expenses: 31000 },
                    { day: 'Thu', revenue: 112000, expenses: 42000 },
                    { day: 'Fri', revenue: 98000, expenses: 38000 },
                    { day: 'Sat', revenue: 142800, expenses: 51000 },
                    { day: 'Sun', revenue: 89000, expenses: 36000 },
                  ]}
                  margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expensesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v: number) => `₦${(v / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                    width={54}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                      fontSize: '13px',
                    }}
                    formatter={((value: number | undefined, name: string | undefined) => [
                      `₦${(value ?? 0).toLocaleString()}`,
                      name === 'revenue' ? 'Revenue' : 'Expenses',
                    ]) as never}
                    labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={1.5}
                    fill="url(#expensesGrad)"
                    strokeDasharray="4 3"
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    fill="url(#revenueGrad)"
                    dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: 'hsl(var(--card))' }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border/60">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-xs text-muted-foreground">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-muted-foreground/40 border border-dashed border-muted-foreground" />
                <span className="text-xs text-muted-foreground">Expenses</span>
              </div>
            </div>
          </motion.div>

          {/* Notifications & Quick Settings */}
          <motion.div variants={card} className="xl:col-span-4 bg-card border border-border/60 rounded-3xl p-6 lg:p-8 shadow-sm flex flex-col">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notifications
            </h3>

            <div className="space-y-4 flex-1">
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-4 rounded-2xl">
                <p className="font-medium text-sm">Daily Sales Summary sent</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">via WhatsApp • 8:32 AM</p>
              </div>

              <div className="bg-card border border-border p-4 rounded-2xl">
                <p className="font-medium text-sm">Weekly Report ready</p>
                <p className="text-xs text-muted-foreground mt-1">Sent to Owner & 2 Staff</p>
              </div>

              <div className="bg-card border border-border p-4 rounded-2xl">
                <p className="font-medium text-sm">Debt reminder sent to 3 customers</p>
                <p className="text-xs text-muted-foreground mt-1">Pending ₦24,500</p>
              </div>
            </div>

            <div className="pt-6 mt-auto border-t border-border">
              <p className="text-sm font-medium mb-3">Channels Active</p>
              <div className="flex gap-3">
                {['WhatsApp', 'SMS', 'Email'].map((ch) => (
                  <div
                    key={ch}
                    className="flex-1 bg-secondary hover:bg-primary/10 rounded-2xl py-3 text-center text-sm font-medium cursor-pointer transition"
                  >
                    {ch}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Directory Preview – added as requested */}
        <motion.div variants={card} className="bg-card border border-border/60 rounded-3xl p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Nearby Businesses
            </h3>
            <button className="text-sm text-primary hover:text-primary/80 transition flex items-center gap-1.5">
              <Settings className="w-4 h-4" /> Filter
            </button>
          </div>

          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search category, name or location..."
              className="w-full bg-secondary border border-border rounded-2xl py-3.5 px-5 pl-12 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition"
            />
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { name: "Mama Aisha Provisions", rating: 4.9, dist: "120m", category: "Groceries" },
              { name: "Emeka Electronics", rating: 4.7, dist: "450m", category: "Electronics" },
              { name: "Chioma Hair Salon", rating: 4.8, dist: "280m", category: "Beauty" },
            ].map((biz, i) => (
              <motion.div
                key={biz.name}
                custom={i}
                variants={card}
                className="bg-secondary/50 border border-border/40 rounded-2xl p-5 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-foreground group-hover:text-primary transition">{biz.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{biz.category} • {biz.dist}</p>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-medium">{biz.rating}</span>
                  </div>
                </div>

                <button className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-xl transition">
                  <MessageCircle className="w-4 h-4" />
                  Chat on WhatsApp
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}