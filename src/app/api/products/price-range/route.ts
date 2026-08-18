import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'

export async function GET() {
  const base = adminDb.collection('products').where('isActive', '==', true)
  const [minSnap, maxSnap] = await Promise.all([
    base.orderBy('price', 'asc').limit(1).get(),
    base.orderBy('price', 'desc').limit(1).get(),
  ])

  const minPrice = minSnap.empty ? 0 : minSnap.docs[0].data().price
  const maxPrice = maxSnap.empty ? 0 : maxSnap.docs[0].data().price

  return NextResponse.json({ minPrice, maxPrice })
}
