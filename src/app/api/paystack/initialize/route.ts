import { NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { adminDb } from '@/lib/firebase/admin'
import { getServerUser } from '@/lib/firebase/session'
import { computeOrderItems, type CartItemInput } from '@/lib/order-items'

const PAYSTACK_BASE_URL = 'https://api.paystack.co'

export async function POST(request: Request) {
  const user = await getServerUser()
  if (!user) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  }

  const body = await request.json()
  const { items, email, phone, address, city, state } = body as {
    items: CartItemInput[]
    email: string
    phone: string
    address: string
    city: string
    state: string
  }

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
  }
  if (!email || !phone || !address || !city || !state) {
    return NextResponse.json({ error: 'Missing shipping details' }, { status: 400 })
  }

  // Re-fetch authoritative prices/stock from Firestore — never trust client-supplied prices.
  const productSnaps = await Promise.all(
    items.map((item) => adminDb.collection('products').doc(item.productId).get())
  )
  const products = productSnaps.map((snap) => {
    if (!snap.exists) return null
    const data = snap.data()!
    return { id: snap.id, name: data.name, price: data.price, stock: data.stock ?? 0, images: data.images ?? [] }
  })

  const result = computeOrderItems(items, products)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  const { items: orderItems, totalAmount } = result

  const orderRef = adminDb.collection('orders').doc()
  await orderRef.set({
    userId: user.uid,
    email,
    phone,
    address,
    city,
    state,
    items: orderItems,
    totalAmount,
    status: 'pending',
    paystackReference: orderRef.id,
    paystackAccessCode: null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    paidAt: null,
  })

  try {
    const paystackRes = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: Math.round(totalAmount * 100), // Paystack expects kobo
        reference: orderRef.id,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/verify`,
      }),
    })
    const paystackData = await paystackRes.json()

    if (!paystackRes.ok || !paystackData.status) {
      await orderRef.update({ status: 'failed', updatedAt: FieldValue.serverTimestamp() })
      return NextResponse.json({ error: paystackData.message || 'Failed to initialize payment' }, { status: 502 })
    }

    await orderRef.update({ paystackAccessCode: paystackData.data.access_code })

    return NextResponse.json({
      authorizationUrl: paystackData.data.authorization_url,
      reference: orderRef.id,
    })
  } catch (error) {
    console.error('Paystack initialize error:', error)
    await orderRef.update({ status: 'failed', updatedAt: FieldValue.serverTimestamp() })
    return NextResponse.json({ error: 'Failed to initialize payment' }, { status: 502 })
  }
}
