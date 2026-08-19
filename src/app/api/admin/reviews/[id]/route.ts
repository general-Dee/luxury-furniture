import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { requireAdmin } from '@/lib/firebase/session'
import { deleteCloudinaryImage, extractCloudinaryPublicId } from '@/lib/cloudinary'

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const reviewRef = adminDb.collection('reviews').doc(id)

  let images: string[] = []

  try {
    await adminDb.runTransaction(async (tx) => {
      const reviewSnap = await tx.get(reviewRef)
      if (!reviewSnap.exists) {
        throw new Error('Review not found')
      }
      const review = reviewSnap.data()!
      images = (review.images as string[]) ?? []

      const productRef = adminDb.collection('products').doc(review.productId as string)
      const productSnap = await tx.get(productRef)

      if (productSnap.exists) {
        const data = productSnap.data()!
        const prevCount = data.reviewCount ?? 0
        const prevAvg = data.avgRating ?? 0
        const newCount = Math.max(prevCount - 1, 0)
        const newAvg = newCount > 0 ? (prevAvg * prevCount - review.rating) / newCount : 0
        tx.update(productRef, { avgRating: newAvg, reviewCount: newCount })
      }

      tx.delete(reviewRef)
    })
  } catch (error) {
    console.error('Review deletion error:', error)
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
  }

  const results = await Promise.allSettled(
    images.map((url) => {
      const publicId = extractCloudinaryPublicId(url)
      return publicId ? deleteCloudinaryImage(publicId) : Promise.resolve()
    })
  )
  results.forEach((result) => {
    if (result.status === 'rejected') {
      console.error('Failed to delete review image from Cloudinary:', result.reason)
    }
  })

  return NextResponse.json({ ok: true })
}
