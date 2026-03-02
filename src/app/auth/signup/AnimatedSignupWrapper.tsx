// app/auth/signup/AnimatedSignupWrapper.tsx
'use client'

import { motion } from 'framer-motion'
import RegisterForm from './RegisterForm'   // your existing form component

export default function AnimatedSignupWrapper() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="w-full max-w-xl"
    >
      {/* Card */}
      <div
        className="rounded-2xl border border-white/10 p-8 md:p-10"
        style={{
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 0 0 1px rgba(0,43,157,0.08), 0 24px 64px rgba(0,0,0,0.5)',
        }}
      >
        <RegisterForm />
      </div>
    </motion.div>
  )
}