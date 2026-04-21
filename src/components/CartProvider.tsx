'use client'
import { useEffect } from 'react'
import { useCartStore } from '@/store/cartStore'

export function CartProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Rehydrate persisted state
    useCartStore.persist.rehydrate()
    // Force recalculation of totals after rehydration
    const items = useCartStore.getState().items
    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
    const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    useCartStore.setState({ totalItems, totalPrice })
  }, [])
  return <>{children}</>
}