'use client'
import { useEffect, useState } from 'react'
import { useCartStore } from '@/store/cartStore'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

export default function CartPage() {
  const [mounted, setMounted] = useState(false)
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCartStore()

  // Standard hydration-safe "mounted" flag: zustand's persisted store reads
  // localStorage, which differs between the SSR pass and the client, so
  // rendering is deferred one tick until we're definitely on the client.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className="ind-scope max-w-7xl mx-auto px-6 py-20 text-center">Loading cart...</div>
  }

  if (items.length === 0) {
    return (
      <div className="ind-scope max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl mb-4">Your cart is empty</h2>
        <p className="opacity-70 mb-6">Add some luxury furniture to get started.</p>
        <Link href="/" className="ind-btn ind-btn-primary inline-block">Continue shopping</Link>
      </div>
    )
  }

  return (
    <main className="ind-scope max-w-7xl mx-auto px-6 py-12">
      <h1 className="uppercase text-3xl mb-8">Shopping cart</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.product_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="ind-card ind-blueprint relative flex flex-row items-center gap-6"
              >
                <i className="ind-corner tl" />
                <i className="ind-corner tr" />
                <i className="ind-corner bl" />
                <i className="ind-corner br" />
                <div className="ind-duotone relative w-24 h-24 flex-shrink-0 border border-[var(--ind-color-divider)]">
                  <Image
                    src={item.image || '/placeholder.jpg'}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="ind-card-title">{item.name}</h3>
                  <p className="mt-1 text-[var(--ind-color-accent-700)]" style={{ fontFamily: 'var(--ind-font-heading)', fontWeight: 600 }}>
                    ₦{item.price.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      className="ind-btn ind-btn-secondary ind-btn-icon"
                    >
                      –
                    </button>
                    <span className="w-7 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      className="ind-btn ind-btn-secondary ind-btn-icon"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.product_id)}
                      className="ind-btn ind-btn-ghost ml-3"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-lg">₦{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="ind-card ind-blueprint relative h-fit sticky top-24">
          <i className="ind-corner tl" />
          <i className="ind-corner tr" />
          <i className="ind-corner bl" />
          <i className="ind-corner br" />
          <h2 className="text-xl mb-2">Order summary</h2>
          <div className="space-y-3 border-b border-[var(--ind-color-divider)] pb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₦{totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm opacity-60">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
          </div>
          <div className="flex justify-between font-semibold text-xl mt-4">
            <span>Total</span>
            <span>₦{totalPrice.toLocaleString()}</span>
          </div>
          <Link href="/checkout" className="ind-btn ind-btn-primary ind-btn-block text-center mt-6">
            Proceed to checkout
          </Link>
          <Link href="/" className="ind-btn ind-btn-ghost ind-btn-block text-center mt-2">
            Continue shopping
          </Link>
          <button
            onClick={clearCart}
            className="w-full text-center text-sm opacity-50 hover:opacity-100 mt-4 transition"
          >
            Clear cart
          </button>
        </div>
      </div>
    </main>
  )
}
