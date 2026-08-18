import { NextResponse } from 'next/server'
import { Timestamp } from 'firebase-admin/firestore'
import { adminDb, adminAuth } from '@/lib/firebase/admin'
import { resend, RESEND_FROM_EMAIL } from '@/lib/resend'

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const twentyFourHoursAgo = Timestamp.fromMillis(Date.now() - 24 * 60 * 60 * 1000)

  const snapshot = await adminDb
    .collection('abandoned_carts')
    .where('lastUpdated', '<', twentyFourHoursAgo)
    .where('notified', '==', false)
    .get()

  let sent = 0

  for (const doc of snapshot.docs) {
    const cart = doc.data()
    const userId = doc.id

    try {
      const user = await adminAuth.getUser(userId)
      if (!user.email) continue

      const itemsList = (cart.cartItems ?? [])
        .map((item: { productName: string; quantity: number }) => `${item.productName} x${item.quantity}`)
        .join(', ')
      const total = (cart.totalPrice as number).toLocaleString()

      await resend.emails.send({
        from: RESEND_FROM_EMAIL,
        to: [user.email],
        subject: 'You left something behind — complete your order!',
        html: `
          <h2>Your cart is waiting for you!</h2>
          <p>We noticed you didn't complete your purchase. Here's what you left in your cart:</p>
          <ul><li>${itemsList}</li></ul>
          <p><strong>Total: ₦${total}</strong></p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/cart" style="background:#2C2C2C; color:#fff; padding:10px 20px; text-decoration:none;">Return to Cart</a>
        `,
      })

      await doc.ref.update({ notified: true })
      sent++
    } catch (error) {
      console.error(`Failed to send abandoned cart reminder for ${userId}:`, error)
    }
  }

  return NextResponse.json({ sent })
}
