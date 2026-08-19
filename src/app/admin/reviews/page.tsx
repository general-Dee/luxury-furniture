import Link from 'next/link'
import Image from 'next/image'
import { adminDb } from '@/lib/firebase/admin'
import StarRating from '@/components/StarRating'
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
      <h2 className="ind-scope uppercase text-xl mb-6">Reviews</h2>
      {reviews.length === 0 ? (
        <div className="ind-plate relative text-center p-6">
          <i className="ind-corner ind-plate-corner tl" />
          <i className="ind-corner ind-plate-corner tr" />
          <i className="ind-corner ind-plate-corner bl" />
          <i className="ind-corner ind-plate-corner br" />
          <p className="opacity-60">No reviews yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="ind-card ind-blueprint relative">
              <i className="ind-corner tl" />
              <i className="ind-corner tr" />
              <i className="ind-corner bl" />
              <i className="ind-corner br" />
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <StarRating rating={review.rating} size={14} />
                    {productNames.has(review.productId) ? (
                      <Link href={`/product/${review.productId}`} className="font-medium text-[var(--ind-color-accent)]">
                        {productNames.get(review.productId)}
                      </Link>
                    ) : (
                      <span className="font-mono text-xs opacity-50">{review.productId}</span>
                    )}
                  </div>
                  <p className="text-sm opacity-60 mb-1">
                    {review.userName} {review.createdAt && `· ${review.createdAt}`}
                  </p>
                  {review.title && <p className="font-medium text-sm">{review.title}</p>}
                  <p className="text-sm opacity-80 line-clamp-2">{review.comment}</p>
                  {review.images.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {review.images.map((img, idx) => (
                        <div key={idx} className="relative w-12 h-12 border border-[var(--ind-color-divider)] overflow-hidden">
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
        </div>
      )}
    </div>
  )
}
