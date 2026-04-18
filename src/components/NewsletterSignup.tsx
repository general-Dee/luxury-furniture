'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      setStatus('error')
      setMessage('Please enter a valid email address.')
      return
    }

    setStatus('loading')
    setMessage('')

    const res = await fetch('/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    const data = await res.json()

    if (res.ok) {
      setStatus('success')
      setMessage(data.message || 'Thank you for subscribing!')
      setEmail('')
    } else {
      setStatus('error')
      setMessage(data.error || 'Something went wrong. Please try again.')
    }
  }

  return (
    <div className="bg-luxury-cream rounded-lg p-6 border border-gray-200">
      <h3 className="text-xl font-serif mb-2">Stay Inspired</h3>
      <p className="text-gray-600 text-sm mb-4">
        Subscribe to our newsletter for exclusive offers, design tips, and new arrivals.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-luxury-gold focus:border-luxury-gold"
          disabled={status === 'loading'}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full bg-luxury-charcoal text-white py-2 rounded-md hover:bg-luxury-gold hover:text-luxury-charcoal transition disabled:opacity-50"
        >
          {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
        </button>
        {message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-sm ${status === 'success' ? 'text-green-600' : 'text-red-500'}`}
          >
            {message}
          </motion.p>
        )}
      </form>
      <p className="text-xs text-gray-400 mt-3">No spam, unsubscribe anytime.</p>
    </div>
  )
}