import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { getServerUser } from '@/lib/firebase/session'
import { markOrderPaid } from '@/lib/orders'

export async function GET(request: Request) {
  const user = await getServerUser()
  if (!user) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const reference = searchParams.get('reference')
  if (!reference) {
    return NextResponse.json({ error: 'Missing reference' }, { status: 400 })
  }

  const orderRef = adminDb.collection('orders').doc(reference)
  const orderSnap = await orderRef.get()
  if (!orderSnap.exists) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }
  const order = orderSnap.data()!
  if (order.userId !== user.uid && !user.admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (order.status === 'paid') {
    return NextResponse.json({ status: 'paid' })
  }

  // Self-healing fallback in case the webhook hasn't landed yet (or was missed).
  try {
    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    })
    const paystackData = await paystackRes.json()

    if (paystackRes.ok && paystackData.data?.status === 'success') {
      await markOrderPaid(reference)
      return NextResponse.json({ status: 'paid' })
    }
  } catch (error) {
    console.error('Paystack verify error:', error)
  }

  return NextResponse.json({ status: order.status })
}
