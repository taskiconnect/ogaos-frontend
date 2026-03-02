'use client'

import { motion } from 'framer-motion'
import LoginForm from './LoginForm'

export default function AnimatedLoginWrapper() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="w-full max-w-md"
    >
      <LoginForm />
    </motion.div>
  )
}