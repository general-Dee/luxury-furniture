import Link from 'next/link'
import Image from 'next/image'
import { Star } from 'lucide-react'
import { adminDb } from '@/lib/firebase/admin'
import DeleteReviewButton from './DeleteReviewButton'

export const dynamic = 'force-dynamic'

export default async function AdminReviewsPage() {
  const snapshot = await adminDb.collection('reviews').orderBy('createdAt', 'desc').limit(100).get()

  const reviews = snapshot.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      productId: data.productId as string,
      userName: data.userName as string,
      rating: data.rating as number,
      title: (data.title as string) || '',
      comment: data.comment as string,
      images: (data.images as string[]) ?? [],
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toLocaleDateString() : null,
    }
  })

  const uniqueProductIds = [...new Set(reviews.map((r) => r.productId))]
  const productNames = new Map<string, string>()
  if (uniqueProductIds.length > 0) {
    const productRefs = uniqueProductIds.map((id) => adminDb.collection('products').doc(id))
    const productSnaps = await adminDb.getAll(...productRefs)
    productSnaps.forEach((snap) => {
      if (snap.exists) productNames.set(snap.id, snap.data()!.name as string)
    })
  }

  return (
    <div>
      <h2 className="text-xl font-serif mb-6">Reviews</h2>
      <div className="border rounded-lg divide-y">
        {reviews.map((review) => (
          <div key={review.id} className="px-4 py-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  {productNames.has(review.productId) ? (
                    <Link href={`/product/${review.productId}`} className="font-medium text-luxury-gold">
                      {productNames.get(review.productId)}
                    </Link>
                  ) : (
                    <span className="font-mono text-xs text-gray-400">{review.productId}</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-1">
                  {review.userName} {review.createdAt && `· ${review.createdAt}`}
                </p>
                {review.title && <p className="font-medium text-sm">{review.title}</p>}
                <p className="text-sm text-gray-700 line-clamp-2">{review.comment}</p>
                {review.images.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {review.images.map((img, idx) => (
                      <div key={idx} className="relative w-12 h-12 rounded border overflow-hidden">
                        <Image src={img} alt="Review" fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <DeleteReviewButton id={review.id} />
            </div>
          </div>
        ))}
        {reviews.length === 0 && <p className="px-4 py-6 text-gray-500 text-sm">No reviews yet.</p>}
      </div>
    </div>
  )
}
