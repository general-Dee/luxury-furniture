'use client'
import { useState, useEffect } from 'react'
import { useCartStore } from '@/store/cartStore'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '@/lib/firebase/client'
import Link from 'next/link'

const schema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
})

type CheckoutForm = z.infer<typeof schema>

type SavedAddress = {
  id: string
  fullName: string
  phone: string
  address: string
  city: string
  state: string
  isDefault: boolean
}

export default function CheckoutPage() {
  const [mounted, setMounted] = useState(false)
  const { items, totalPrice } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(schema),
  })

  useEffect(() => setMounted(true), [])

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState('')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return
      if (user.email) setValue('email', user.email)

      const q = query(collection(db, 'users', user.uid, 'addresses'), orderBy('isDefault', 'desc'))
      const snapshot = await getDocs(q)
      const list = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<SavedAddress, 'id'>) }))
      setSavedAddresses(list)
      const defaultAddr = list.find((a) => a.isDefault)
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id)
        setValue('phone', defaultAddr.phone)
        setValue('address', defaultAddr.address)
        setValue('city', defaultAddr.city)
        setValue('state', defaultAddr.state)
      }
    })
    return () => unsubscribe()
  }, [setValue])

  const handleAddressSelect = (id: string) => {
    const addr = savedAddresses.find((a) => a.id === id)
    if (addr) {
      setValue('phone', addr.phone)
      setValue('address', addr.address)
      setValue('city', addr.city)
      setValue('state', addr.state)
      setSelectedAddressId(id)
    }
  }

  if (!mounted) return <div className="container-luxury py-20 text-center">Loading...</div>
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
    setError('')

    try {
      const res = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          items: items.map((item) => ({ productId: item.product_id, quantity: item.quantity })),
        }),
      })

      const result = await res.json()
      if (!res.ok) {
        throw new Error(result.error || 'Failed to start payment')
      }

      // Cart is cleared once payment is actually confirmed (see /checkout/verify),
      // not here — the customer hasn't paid yet at this point.
      window.location.href = result.authorizationUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <main className="container-luxury py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-serif text-center mb-8">Checkout</h1>
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 md:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {savedAddresses.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select saved address</label>
                <select
                  value={selectedAddressId}
                  onChange={(e) => handleAddressSelect(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 dark:bg-gray-800"
                >
                  <option value="">-- Choose saved address --</option>
                  {savedAddresses.map(addr => (
                    <option key={addr.id} value={addr.id}>
                      {addr.fullName} – {addr.address}, {addr.city}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                {...register('email')}
                type="email"
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 dark:bg-gray-800"
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
              <input
                {...register('phone')}
                type="tel"
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 dark:bg-gray-800"
                placeholder="0803 123 4567"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
              <input
                {...register('address')}
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 dark:bg-gray-800"
                placeholder="Street, building, etc."
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                <input
                  {...register('city')}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 dark:bg-gray-800"
                  placeholder="Lagos"
                />
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
                <input
                  {...register('state')}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 dark:bg-gray-800"
                  placeholder="Lagos"
                />
                {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>}
              </div>
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <div className="border-t pt-4 mt-6">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="text-luxury-gold">₦{totalPrice.toLocaleString()}</span>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-6 text-center disabled:opacity-50"
              >
                {loading ? 'Redirecting to payment...' : 'Pay with Paystack'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
