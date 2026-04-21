'use client'
import { useState } from 'react'
import { Star } from 'lucide-react'
import Image from 'next/image'

interface Review {
  id: string
  rating: number
  title: string | null
  comment: string
  images: string[]
  created_at: string
  profiles: { email: string }
}

export default function ProductReviews({ reviews }: { reviews: Review[] }) {
  const [visibleCount, setVisibleCount] = useState(5)

  if (!reviews.length) {
    return <p className="text-gray-500 mt-6">No reviews yet. Be the first to review!</p>
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-serif mb-4">Customer Reviews</h2>
      <div className="space-y-6">
        {reviews.slice(0, visibleCount).map((review) => (
          <div key={review.id} className="border-b pb-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                ))}
              </div>
              {review.title && <span className="font-medium">{review.title}</span>}
            </div>
            <p className="text-sm text-gray-500 mb-2">
              {review.profiles.email.split('@')[0]} · {new Date(review.created_at).toLocaleDateString()}
            </p>
            <p className="text-gray-700">{review.comment}</p>
            {review.images.length > 0 && (
              <div className="flex gap-2 mt-2">
                {review.images.map((img, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded border overflow-hidden">
                    <Image src={img} alt="Review" fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      {visibleCount < reviews.length && (
        <button onClick={() => setVisibleCount(prev => prev + 5)} className="text-luxury-gold mt-4 hover:underline">
          Load more reviews
        </button>
      )}
    </div>
  )
}