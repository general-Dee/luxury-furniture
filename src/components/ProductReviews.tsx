'use client'
import { useState } from 'react'
import Image from 'next/image'
import StarRating from './StarRating'

interface Review {
  id: string
  rating: number
  title: string | null
  comment: string
  images: string[]
  createdAt: string
  userName: string
}

export default function ProductReviews({ reviews }: { reviews: Review[] }) {
  const [visibleCount, setVisibleCount] = useState(5)

  if (!reviews.length) {
    return <p className="ind-scope opacity-60 mt-6">No reviews yet. Be the first to review!</p>
  }

  return (
    <div className="ind-scope mt-8">
      <div className="space-y-6">
        {reviews.slice(0, visibleCount).map((review) => (
          <div key={review.id} className="border-b border-[var(--ind-color-divider)] pb-4">
            <div className="flex items-center gap-2 mb-1">
              <StarRating rating={review.rating} size={14} />
              {review.title && <span className="font-medium">{review.title}</span>}
            </div>
            <p className="text-sm opacity-60 mb-2">
              {review.userName} · {new Date(review.createdAt).toLocaleDateString()}
            </p>
            <p className="opacity-80">{review.comment}</p>
            {review.images.length > 0 && (
              <div className="flex gap-2 mt-2">
                {review.images.map((img, idx) => (
                  <div key={idx} className="relative w-16 h-16 border border-[var(--ind-color-divider)] overflow-hidden">
                    <Image src={img} alt="Review" fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      {visibleCount < reviews.length && (
        <button onClick={() => setVisibleCount(prev => prev + 5)} className="ind-btn ind-btn-ghost mt-4">
          Load more reviews
        </button>
      )}
    </div>
  )
}