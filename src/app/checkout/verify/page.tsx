'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function VerifyPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'verifying' | 'success' | 'pending' | 'error'>('verifying')
  const supabase = createClient()

  useEffect(() => {
    const reference = searchParams.get('reference')
    const orderId = searchParams.get('order_id')

    if (!reference || !orderId) {
      setStatus('error')
      return
    }

    const verifyPayment = async () => {
      // Poll the order status (or call a webhook endpoint)
      // For simplicity, we check the database directly
      const { data: order, error } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single()

      if (order?.status === 'paid') {
        setStatus('success')
        // Clear local cart
        localStorage.removeItem('luxury-cart')
        // Redirect to orders page after 3 seconds
        setTimeout(() => router.push('/orders'), 3000)
      } else if (order?.status === 'pending') {
        setStatus('pending')
      } else {
        setStatus('error')
      }
    }

    // Check immediately, then every 2 seconds for a few times
    verifyPayment()
    const interval = setInterval(verifyPayment, 2000)
    setTimeout(() => clearInterval(interval), 10000)

    return () => clearInterval(interval)
  }, [searchParams, supabase, router])

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