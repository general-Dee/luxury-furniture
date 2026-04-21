'use client'
import { useEffect, useState } from 'react'
import { useCartStore } from '@/store/cartStore'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

export default function CartPage() {
  const [mounted, setMounted] = useState(false)
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCartStore()

  useEffect(() => setMounted(true), [])

  // Debug log
  console.log('Cart page render – totalPrice:', totalPrice, 'items:', items)

  if (!mounted) {
    return <div className="container-luxury py-20 text-center">Loading cart...</div>
  }

  if (items.length === 0) {
    return (
      <div className="container-luxury py-20 text-center">
        <h2 className="text-2xl font-serif mb-4">Your cart is empty</h2>
        <p className="text-gray-600 mb-6">Add some luxury furniture to get started.</p>
        <Link href="/" className="btn-primary inline-block">Continue Shopping</Link>
      </div>
    )
  }

  return (
    <main className="container-luxury py-12">
      <h1 className="text-3xl font-serif mb-8">Shopping Cart</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.product_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex gap-6 bg-white p-5 rounded-xl shadow-sm border border-gray-100"
              >
                <div className="relative w-28 h-28 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={item.image || '/placeholder.jpg'}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-serif text-lg">{item.name}</h3>
                  <p className="text-luxury-gold font-semibold mt-1">₦{item.price.toLocaleString()}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.product_id)}
                      className="ml-4 text-gray-400 hover:text-red-500 text-sm transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">₦{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 h-fit sticky top-24">
          <h2 className="text-xl font-serif mb-4">Order Summary</h2>
          <div className="space-y-3 border-b pb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₦{totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
          </div>
          <div className="flex justify-between font-bold text-xl mt-4">
            <span>Total</span>
            <span>₦{totalPrice.toLocaleString()}</span>
          </div>
          <Link href="/checkout" className="btn-primary w-full text-center mt-6 block">
            Proceed to Checkout
          </Link>
          <button
            onClick={clearCart}
            className="w-full text-center text-sm text-gray-400 hover:text-red-500 mt-4 transition"
          >
            Clear Cart
          </button>
        </div>
      </div>
    </main>
  )
}