export type CartItemInput = { productId: string; quantity: number }

export type ProductLookup = {
  id: string
  name: string
  price: number
  stock: number
  images: string[]
} | null

export type OrderItemComputed = {
  productId: string
  productName: string
  quantity: number
  price: number
  image: string
}

export type ComputeOrderItemsResult =
  | { ok: true; items: OrderItemComputed[]; totalAmount: number }
  | { ok: false; error: string }

/**
 * Turns client-submitted cart lines into authoritative order items using
 * server-fetched product data — never the client's own price/name. `products`
 * must be the same length and order as `items` (one lookup per cart line).
 */
export function computeOrderItems(items: CartItemInput[], products: ProductLookup[]): ComputeOrderItemsResult {
  const orderItems: OrderItemComputed[] = []
  let totalAmount = 0

  for (let i = 0; i < items.length; i++) {
    const product = products[i]
    const quantity = items[i].quantity

    if (!product) {
      return { ok: false, error: `Product not found: ${items[i].productId}` }
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      return { ok: false, error: 'Invalid item quantity' }
    }
    if (product.stock < quantity) {
      return { ok: false, error: `${product.name} does not have enough stock` }
    }

    orderItems.push({
      productId: product.id,
      productName: product.name,
      quantity,
      price: product.price,
      image: product.images[0] ?? '',
    })
    totalAmount += product.price * quantity
  }

  return { ok: true, items: orderItems, totalAmount }
}
