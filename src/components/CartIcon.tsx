'use client'
import { useEffect, useState } from 'react'
import { useCartStore } from '@/store/cartStore'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'

export default function CartIcon() {
  const totalItems = useCartStore((state) => state.totalItems)
  const [animate, setAnimate] = useState(false)

  // Triggers a one-shot bounce animation whenever the cart count changes —
  // genuinely reacting to an external change (the zustand store), not
  // synchronizing render output, so an effect is the right tool here.
  useEffect(() => {
    if (totalItems > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAnimate(true)
      const timer = setTimeout(() => setAnimate(false), 400)
      return () => clearTimeout(timer)
    }
  }, [totalItems])

  return (
    <Link href="/cart" className="relative hover:text-[var(--ind-color-accent)] transition-colors duration-200 group p-2 -m-2">
      <motion.div
        animate={animate ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        <ShoppingCart className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" strokeWidth={1.5} />
      </motion.div>
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.span
            key="badge"
            initial={{ scale: 0 }}
            animate={{ scale: animate ? [1, 1.4, 1] : 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute -top-2 -right-2 bg-[var(--ind-color-accent)] text-[var(--ind-color-bg)] text-xs h-4 w-4 flex items-center justify-center"
          >
            {totalItems}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  )
}
