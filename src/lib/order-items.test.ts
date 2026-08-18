import { describe, expect, it } from 'vitest'
import { computeOrderItems, type ProductLookup } from './order-items'

const sofa: ProductLookup = { id: 'sofa', name: 'Velvet Sofa', price: 500000, stock: 5, images: ['sofa.jpg'] }
const chair: ProductLookup = { id: 'chair', name: 'Oak Chair', price: 100000, stock: 0, images: [] }

describe('computeOrderItems', () => {
  it('computes authoritative totals from server-side product data', () => {
    const result = computeOrderItems([{ productId: 'sofa', quantity: 2 }], [sofa])
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.totalAmount).toBe(1000000)
      expect(result.items[0]).toEqual({
        productId: 'sofa',
        productName: 'Velvet Sofa',
        quantity: 2,
        price: 500000,
        image: 'sofa.jpg',
      })
    }
  })

  it('ignores any price the client might submit — only productId/quantity are read', () => {
    const items = [{ productId: 'sofa', quantity: 1, price: 1 } as unknown as { productId: string; quantity: number }]
    const result = computeOrderItems(items, [sofa])
    expect(result.ok && result.totalAmount).toBe(500000)
  })

  it('rejects an out-of-stock product', () => {
    const result = computeOrderItems([{ productId: 'chair', quantity: 1 }], [chair])
    expect(result).toEqual({ ok: false, error: 'Oak Chair does not have enough stock' })
  })

  it('rejects a quantity greater than available stock', () => {
    const result = computeOrderItems([{ productId: 'sofa', quantity: 10 }], [sofa])
    expect(result.ok).toBe(false)
  })

  it('rejects a missing product', () => {
    const result = computeOrderItems([{ productId: 'missing', quantity: 1 }], [null])
    expect(result).toEqual({ ok: false, error: 'Product not found: missing' })
  })

  it('rejects a zero or negative quantity', () => {
    expect(computeOrderItems([{ productId: 'sofa', quantity: 0 }], [sofa]).ok).toBe(false)
    expect(computeOrderItems([{ productId: 'sofa', quantity: -1 }], [sofa]).ok).toBe(false)
  })

  it('rejects a non-integer quantity', () => {
    expect(computeOrderItems([{ productId: 'sofa', quantity: 1.5 }], [sofa]).ok).toBe(false)
  })

  it('sums multiple line items correctly', () => {
    const result = computeOrderItems(
      [{ productId: 'sofa', quantity: 1 }, { productId: 'chair', quantity: 2 }],
      [sofa, { ...chair, stock: 3 }]
    )
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.totalAmount).toBe(500000 + 100000 * 2)
      expect(result.items).toHaveLength(2)
    }
  })
})
