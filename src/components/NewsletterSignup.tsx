'use client'
import { useEffect } from 'react'

export default function NewsletterSignup() {
  useEffect(() => {
    // Load Kit's embed script only once
    if (!document.querySelector('script[src="https://luxury-furniture.kit.com/55f59cd259/index.js"]')) {
      const script = document.createElement('script')
      script.src = 'https://luxury-furniture.kit.com/55f59cd259/index.js'
      script.async = true
      script.setAttribute('data-uid', '55f59cd259')
      document.body.appendChild(script)
    }
  }, [])

  return (
    <div className="bg-luxury-cream rounded-lg p-6 border border-gray-200">
      <h3 className="text-xl font-serif mb-2">Stay Inspired</h3>
      <p className="text-gray-600 text-sm mb-4">
        Subscribe to our newsletter for exclusive offers, design tips, and new arrivals.
      </p>
      <div data-uid="55f59cd259"></div>
      <p className="text-xs text-gray-400 mt-3">No spam, unsubscribe anytime.</p>
    </div>
  )
}