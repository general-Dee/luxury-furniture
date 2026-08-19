import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { requireAdmin } from '@/lib/firebase/session'
import { cancelOrder, updateOrderFulfillment } from '@/lib/orders'

const FULFILLMENT_STATUSES = ['unfulfilled', 'shipped', 'delivered']

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const snap = await adminDb.collection('orders').doc(id).get()
  if (!snap.exists) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const data = snap.data()!
  return NextResponse.json({
    id: snap.id,
    userId: data.userId,
    email: data.email,
    phone: data.phone,
    address: data.address,
    city: data.city,
    state: data.state,
    items: data.items ?? [],
    totalAmount: data.totalAmount,
    status: data.status,
    fulfillmentStatus: data.fulfillmentStatus ?? 'unfulfilled',
    paystackReference: data.paystackReference ?? null,
    paystackAccessCode: data.paystackAccessCode ?? null,
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : null,
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : null,
    paidAt: data.paidAt?.toDate ? data.paidAt.toDate().toISOString() : null,
  })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()
  const { status, fulfillmentStatus } = body as { status?: string; fulfillmentStatus?: string }

  if (status !== undefined) {
    if (status !== 'cancelled') {
      return NextResponse.json(
        { error: "status can only be set to 'cancelled' via this endpoint — pending/paid/failed are payment-driven" },
        { status: 400 }
      )
    }

    const result = await cancelOrder(id)
    if (result === 'not_found') return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    if (result === 'already_cancelled' || result === 'invalid_state') {
      return NextResponse.json({ error: `Cannot cancel order: ${result}` }, { status: 409 })
    }
    return NextResponse.json({ ok: true })
  }

  if (fulfillmentStatus !== undefined) {
    if (!FULFILLMENT_STATUSES.includes(fulfillmentStatus)) {
      return NextResponse.json({ error: 'Invalid fulfillmentStatus' }, { status: 400 })
    }

    const result = await updateOrderFulfillment(id, fulfillmentStatus as 'unfulfilled' | 'shipped' | 'delivered')
    if (result === 'not_found') return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    if (result === 'not_paid') {
      return NextResponse.json({ error: 'Cannot set fulfillment status: order is not paid' }, { status: 409 })
    }
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 })
}
