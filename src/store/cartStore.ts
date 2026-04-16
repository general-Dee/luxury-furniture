import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

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

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) => {
        const existing = get().items.find(i => i.product_id === newItem.product_id)
        if (existing) {
          set({
            items: get().items.map(i =>
              i.product_id === newItem.product_id
                ? { ...i, quantity: i.quantity + newItem.quantity }
                : i
            )
          })
        } else {
          set({ items: [...get().items, newItem] })
        }
      },
      removeItem: (productId) => {
        set({ items: get().items.filter(i => i.product_id !== productId) })
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set({
          items: get().items.map(i =>
            i.product_id === productId ? { ...i, quantity } : i
          )
        })
      },
      clearCart: () => set({ items: [] }),
      get totalItems() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0)
      },
      get totalPrice() {
        return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0)
      },
    }),
    {
      name: 'luxury-cart',
      storage: createJSONStorage(() => localStorage), // explicitly use localStorage
      skipHydration: false,
    }
  )
)