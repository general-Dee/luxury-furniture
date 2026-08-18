import { beforeEach, describe, expect, it } from 'vitest'
import { useCartStore, type CartItem } from './cartStore'

const item = (overrides: Partial<CartItem> = {}): CartItem => ({
  id: 'sofa',
  product_id: 'sofa',
  name: 'Velvet Sofa',
  price: 500000,
  quantity: 1,
  image: 'https://example.com/sofa.jpg',
  ...overrides,
})

beforeEach(() => {
  useCartStore.setState({ items: [], totalItems: 0, totalPrice: 0 })
})

describe('cartStore', () => {
  it('adds a new item and recalculates totals', () => {
    useCartStore.getState().addItem(item())
    const state = useCartStore.getState()
    expect(state.items).toHaveLength(1)
    expect(state.totalItems).toBe(1)
    expect(state.totalPrice).toBe(500000)
  })

  it('merges quantities when adding the same product twice', () => {
    useCartStore.getState().addItem(item({ quantity: 1 }))
    useCartStore.getState().addItem(item({ quantity: 2 }))
    const state = useCartStore.getState()
    expect(state.items).toHaveLength(1)
    expect(state.items[0].quantity).toBe(3)
    expect(state.totalItems).toBe(3)
    expect(state.totalPrice).toBe(1500000)
  })

  it('keeps distinct products separate', () => {
    useCartStore.getState().addItem(item({ product_id: 'sofa', price: 500000 }))
    useCartStore.getState().addItem(item({ product_id: 'chair', price: 100000 }))
    const state = useCartStore.getState()
    expect(state.items).toHaveLength(2)
    expect(state.totalPrice).toBe(600000)
  })

  it('removes an item and recalculates totals', () => {
    useCartStore.getState().addItem(item({ product_id: 'sofa' }))
    useCartStore.getState().addItem(item({ product_id: 'chair', price: 100000 }))
    useCartStore.getState().removeItem('sofa')
    const state = useCartStore.getState()
    expect(state.items).toHaveLength(1)
    expect(state.items[0].product_id).toBe('chair')
    expect(state.totalPrice).toBe(100000)
  })

  it('updates quantity in place', () => {
    useCartStore.getState().addItem(item({ price: 100000, quantity: 1 }))
    useCartStore.getState().updateQuantity('sofa', 4)
    const state = useCartStore.getState()
    expect(state.items[0].quantity).toBe(4)
    expect(state.totalPrice).toBe(400000)
  })

  it('removes the item when quantity is updated to zero or below', () => {
    useCartStore.getState().addItem(item())
    useCartStore.getState().updateQuantity('sofa', 0)
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('clears the cart', () => {
    useCartStore.getState().addItem(item())
    useCartStore.getState().clearCart()
    const state = useCartStore.getState()
    expect(state.items).toHaveLength(0)
    expect(state.totalItems).toBe(0)
    expect(state.totalPrice).toBe(0)
  })
})
