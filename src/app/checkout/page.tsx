'use client'
import { useState, useEffect } from 'react'
import { useCartStore } from '@/store/cartStore'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const schema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
})

type CheckoutForm = z.infer<typeof schema>

export default function CheckoutPage() {
  const [mounted, setMounted] = useState(false)
  const { items, totalPrice, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(schema),
  })

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className="container-luxury py-20 text-center">Loading...</div>
  }

  if (items.length === 0) {
    return (
      <div className="container-luxury py-20 text-center">
        <h2 className="text-2xl font-serif mb-4">Your cart is empty</h2>
        <Link href="/" className="text-luxury-gold underline">Continue shopping</Link>
      </div>
    )
  }

  const onSubmit = async (data: CheckoutForm) => {
    setLoading(true)

    // 1. Create order in Supabase
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        total_amount: totalPrice,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      alert('Error creating order. Please try again.')
      setLoading(false)
      return
    }

    // 2. Create order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.name,
      quantity: item.quantity,
      price: item.price,
      image: item.image,
    }))
    await supabase.from('order_items').insert(orderItems)

    // 3. Initialize Paystack payment
    const res = await fetch('/api/paystack/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email,
        amount: totalPrice,
        orderId: order.id,
        metadata: { cart_items: items },
      }),
    })
    const paystackData = await res.json()

    if (paystackData.authorization_url) {
      // Clear cart after successful redirect? We'll clear after webhook confirmation.
      window.location.href = paystackData.authorization_url
    } else {
      alert('Payment initialization failed: ' + (paystackData.error || 'Unknown error'))
      setLoading(false)
    }
  }

  return (
    <main className="container-luxury py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-serif text-center mb-8">Checkout</h1>
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                {...register('email')}
                type="email"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                {...register('phone')}
                type="tel"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                placeholder="0803 123 4567"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                {...register('address')}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                placeholder="Street, building, etc."
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  {...register('city')}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                  placeholder="Lagos"
                />
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  {...register('state')}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                  placeholder="Lagos"
                />
                {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>}
              </div>
            </div>

            <div className="border-t pt-4 mt-6">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="text-luxury-gold">₦{totalPrice.toLocaleString()}</span>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-6 text-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Pay with Paystack'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}