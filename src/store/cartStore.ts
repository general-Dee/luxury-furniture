import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  id: string
  product_id: string
  name: string
  price: number
  quantity: number
  image: string
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const recalc = (items: CartItem[]) => ({
  totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
  totalPrice: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
})

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) => {
        const current = get().items
        const existing = current.find(i => i.product_id === newItem.product_id)
        const newItems = existing
          ? current.map(i => i.product_id === newItem.product_id ? { ...i, quantity: i.quantity + newItem.quantity } : i)
          : [...current, newItem]
        const { totalItems, totalPrice } = recalc(newItems)
        set({ items: newItems, totalItems, totalPrice })
      },
      removeItem: (productId) => {
        const newItems = get().items.filter(i => i.product_id !== productId)
        const { totalItems, totalPrice } = recalc(newItems)
        set({ items: newItems, totalItems, totalPrice })
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        const newItems = get().items.map(i => i.product_id === productId ? { ...i, quantity } : i)
        const { totalItems, totalPrice } = recalc(newItems)
        set({ items: newItems, totalItems, totalPrice })
      },
      clearCart: () => set({ items: [], totalItems: 0, totalPrice: 0 }),
      totalItems: 0,
      totalPrice: 0,
    }),
    { name: 'luxury-cart' }
  )
)