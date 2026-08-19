import 'server-only'
import { FieldValue } from 'firebase-admin/firestore'
import { adminDb } from './firebase/admin'
import { resend, RESEND_FROM_EMAIL } from './resend'

type MarkPaidResult = 'marked_paid' | 'already_paid' | 'not_found'
type FulfillmentStatus = 'unfulfilled' | 'shipped' | 'delivered'
type UpdateFulfillmentResult = 'updated' | 'not_found' | 'not_paid'
type CancelOrderResult = 'cancelled' | 'already_cancelled' | 'not_found' | 'invalid_state'

/**
 * Idempotent: safe to call multiple times for the same order (Paystack
 * webhooks can double-deliver, and the verify route calls this too).
 */
export async function markOrderPaid(orderId: string): Promise<MarkPaidResult> {
  const orderRef = adminDb.collection('orders').doc(orderId)

  const result = await adminDb.runTransaction(async (tx) => {
    const orderSnap = await tx.get(orderRef)
    if (!orderSnap.exists) return { status: 'not_found' as const, order: null }

    const order = orderSnap.data()!
    if (order.status === 'paid') return { status: 'already_paid' as const, order }

    const items = (order.items ?? []) as { productId: string; quantity: number }[]
    const productRefs = items.map((item) => adminDb.collection('products').doc(item.productId))
    const productSnaps = await Promise.all(productRefs.map((ref) => tx.get(ref)))

    productSnaps.forEach((snap, idx) => {
      if (snap.exists) {
        const currentStock = (snap.data()!.stock as number) ?? 0
        tx.update(productRefs[idx], { stock: Math.max(currentStock - items[idx].quantity, 0) })
      }
    })

    tx.update(orderRef, {
      status: 'paid',
      paidAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })

    return { status: 'marked_paid' as const, order }
  })

  if (result.status === 'marked_paid' && result.order) {
    await sendOrderConfirmationEmail(orderId, result.order).catch((err) => {
      console.error('Failed to send order confirmation email:', err)
    })
  }

  return result.status
}

/** Admin-only. Rejects orders that aren't paid yet — can't ship an unpaid order. */
export async function updateOrderFulfillment(
  orderId: string,
  fulfillmentStatus: FulfillmentStatus
): Promise<UpdateFulfillmentResult> {
  const orderRef = adminDb.collection('orders').doc(orderId)
  const snap = await orderRef.get()
  if (!snap.exists) return 'not_found'
  if (snap.data()!.status !== 'paid') return 'not_paid'

  await orderRef.update({ fulfillmentStatus, updatedAt: FieldValue.serverTimestamp() })
  return 'updated'
}

/**
 * Admin-only, transactional (mirrors markOrderPaid). Cancelling a 'paid' order
 * restocks items (inverse of markOrderPaid's decrement) since stock was
 * already deducted at payment time; cancelling a 'pending' order just flips
 * status. Does not call Paystack (no refund API call) — out of scope.
 */
export async function cancelOrder(orderId: string): Promise<CancelOrderResult> {
  const orderRef = adminDb.collection('orders').doc(orderId)

  return adminDb.runTransaction(async (tx) => {
    const orderSnap = await tx.get(orderRef)
    if (!orderSnap.exists) return 'not_found'

    const order = orderSnap.data()!
    if (order.status === 'cancelled') return 'already_cancelled'
    if (order.status === 'failed') return 'invalid_state'

    if (order.status === 'paid') {
      const items = (order.items ?? []) as { productId: string; quantity: number }[]
      const productRefs = items.map((item) => adminDb.collection('products').doc(item.productId))
      const productSnaps = await Promise.all(productRefs.map((ref) => tx.get(ref)))

      productSnaps.forEach((snap, idx) => {
        if (snap.exists) {
          const currentStock = (snap.data()!.stock as number) ?? 0
          tx.update(productRefs[idx], { stock: currentStock + items[idx].quantity })
        }
      })
    }

    tx.update(orderRef, { status: 'cancelled', updatedAt: FieldValue.serverTimestamp() })
    return 'cancelled'
  })
}

async function sendOrderConfirmationEmail(orderId: string, order: FirebaseFirestore.DocumentData) {
  const items = (order.items ?? []) as { productName: string; quantity: number; price: number }[]
  const itemsHtml = items
    .map(
      (item) =>
        `<tr><td style="padding:4px 8px;">${item.productName} × ${item.quantity}</td><td style="padding:4px 8px;text-align:right;">₦${(item.price * item.quantity).toLocaleString()}</td></tr>`
    )
    .join('')

  await resend.emails.send({
    from: RESEND_FROM_EMAIL,
    to: order.email,
    subject: `Order Confirmed — #${orderId.slice(0, 8)}`,
    html: `
      <h1>Thank you for your order!</h1>
      <p>Order #${orderId.slice(0, 8)} has been confirmed and is being prepared.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">${itemsHtml}</table>
      <p style="font-weight:bold;">Total: ₦${(order.totalAmount as number).toLocaleString()}</p>
      <p>Shipping to: ${order.address}, ${order.city}, ${order.state}</p>
    `,
  })
}
