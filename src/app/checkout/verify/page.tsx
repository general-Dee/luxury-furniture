'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import Link from 'next/link'

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyContent />
    </Suspense>
  )
}

function VerifyContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const clearCart = useCartStore((s) => s.clearCart)
  const reference = searchParams.get('reference') || searchParams.get('trxref')
  const [status, setStatus] = useState<'verifying' | 'success' | 'pending' | 'error'>(
    reference ? 'verifying' : 'error'
  )

  useEffect(() => {
    if (!reference) return

    let cancelled = false

    const verifyPayment = async () => {
      try {
        const res = await fetch(`/api/paystack/verify?reference=${encodeURIComponent(reference)}`)
        const data = await res.json()
        if (cancelled) return

        if (data.status === 'paid') {
          setStatus('success')
          clearCart()
          setTimeout(() => router.push('/orders'), 3000)
        } else if (data.status === 'pending') {
          setStatus('pending')
        } else {
          setStatus('error')
        }
      } catch {
        if (!cancelled) setStatus('error')
      }
    }

    verifyPayment()
    const interval = setInterval(verifyPayment, 2000)
    const timeout = setTimeout(() => clearInterval(interval), 10000)

    return () => {
      cancelled = true
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [reference, router, clearCart])

  return (
    <div className="min-h-screen flex items-center justify-center bg-luxury-cream px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 text-center">
        {status === 'verifying' && (
          <>
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold mb-4"></div>
            <h2 className="text-2xl font-serif mb-2">Verifying Payment</h2>
            <p className="text-gray-500">Please wait while we confirm your transaction...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h2 className="text-2xl font-serif mb-2">Payment Successful!</h2>
            <p className="text-gray-500 mb-4">Thank you for your purchase. You will receive a confirmation email shortly.</p>
            <p className="text-sm text-gray-400">Redirecting to your orders...</p>
          </>
        )}
        {status === 'pending' && (
          <>
            <div className="text-yellow-500 text-5xl mb-4">⏳</div>
            <h2 className="text-2xl font-serif mb-2">Payment Pending</h2>
            <p className="text-gray-500 mb-4">Your payment is being processed. Please check your email for confirmation.</p>
            <Link href="/orders" className="text-luxury-gold underline">View Orders</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-red-500 text-5xl mb-4">✗</div>
            <h2 className="text-2xl font-serif mb-2">Verification Failed</h2>
            <p className="text-gray-500 mb-4">We could not verify your payment. Please contact support.</p>
            <Link href="/" className="btn-primary inline-block">Return Home</Link>
          </>
        )}
      </div>
    </div>
  )
}
