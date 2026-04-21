'use client'
import { useEffect, useState } from 'react'
import { useCartStore } from '@/store/cartStore'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

export default function CartIcon() {
  const totalItems = useCartStore((state) => state.totalItems)
  const [animate, setAnimate] = useState(false)

  // Debug log
  console.log('CartIcon render – totalItems:', totalItems)

  useEffect(() => {
    if (totalItems > 0) {
      setAnimate(true)
      const timer = setTimeout(() => setAnimate(false), 400)
      return () => clearTimeout(timer)
    }
  }, [totalItems])

  return (
    <Link href="/cart" className="relative text-gray-600 hover:text-luxury-gold transition-colors duration-200 group p-2 -m-2">
      <motion.div
        animate={animate ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 transition-transform duration-200 group-hover:scale-110"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 21h6M12 21v-6"
          />
        </svg>
      </motion.div>
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.span
            key="badge"
            initial={{ scale: 0 }}
            animate={{ scale: animate ? [1, 1.4, 1] : 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
          >
            {totalItems}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  )
}