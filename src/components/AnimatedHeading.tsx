'use client'
import { motion } from 'framer-motion'

export default function AnimatedHeading() {
  return (
    <motion.h1
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-4xl md:text-5xl font-serif text-amber-900 mb-4"
    >
      Luxury Furniture
    </motion.h1>
  )
}