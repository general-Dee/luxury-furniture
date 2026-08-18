import { NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { adminDb } from '@/lib/firebase/admin'
import { getServerUser } from '@/lib/firebase/session'

export async function POST(request: Request) {
  const user = await getServerUser()
  if (!user) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  }

  const body = await request.json()
  const { productId, rating, title, comment, images } = body as {
    productId?: string
    rating?: number
    title?: string
    comment?: string
    images?: string[]
  }

  if (!productId || typeof productId !== 'string') {
    return NextResponse.json({ error: 'Missing productId' }, { status: 400 })
  }
  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
  }
  if (!comment || !comment.trim()) {
    return NextResponse.json({ error: 'Review comment is required' }, { status: 400 })
  }

  const productRef = adminDb.collection('products').doc(productId)
  const reviewRef = adminDb.collection('reviews').doc()

  try {
    await adminDb.runTransaction(async (tx) => {
      const productSnap = await tx.get(productRef)
      if (!productSnap.exists) {
        throw new Error('Product not found')
      }
      const data = productSnap.data()!
      const prevCount = data.reviewCount ?? 0
      const prevAvg = data.avgRating ?? 0
      const newCount = prevCount + 1
      const newAvg = (prevAvg * prevCount + rating) / newCount

      tx.set(reviewRef, {
        productId,
        userId: user.uid,
        userName: user.email?.split('@')[0] ?? 'Customer',
        rating,
        title: title?.trim() || '',
        comment: comment.trim(),
        images: Array.isArray(images) ? images.slice(0, 3) : [],
        createdAt: FieldValue.serverTimestamp(),
      })
      tx.update(productRef, { avgRating: newAvg, reviewCount: newCount })
    })

    return NextResponse.json({ ok: true, id: reviewRef.id })
  } catch (error) {
    console.error('Review submission error:', error)
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
  }
}
