import { NextRequest, NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { adminDb } from '@/lib/firebase/admin'
import { getServerUser } from '@/lib/firebase/session'

export async function POST(req: NextRequest) {
  const user = await getServerUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { items, totalPrice } = await req.json()

  try {
    await adminDb.collection('abandoned_carts').doc(user.uid).set({
      cartItems: items,
      totalPrice,
      lastUpdated: FieldValue.serverTimestamp(),
      notified: false,
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to sync cart:', error)
    return NextResponse.json({ error: 'Failed to sync cart' }, { status: 500 })
  }
}
