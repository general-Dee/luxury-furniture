'use client'
import { useEffect, useRef } from 'react'
import { useCartStore } from '@/store/cartStore'
import { auth } from '@/lib/firebase/client'

export default function CartSync() {
  const items = useCartStore((state) => state.items)
  const totalPrice = useCartStore((state) => state.totalPrice)
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    const syncCart = async () => {
      if (!auth.currentUser) return

      await fetch('/api/cart/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, totalPrice }),
      })
    }

    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(syncCart, 1000)

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [items, totalPrice])

  return null
}
