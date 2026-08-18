import { notFound } from 'next/navigation'
import Image from 'next/image'
import AddToCartButton from '@/components/AddToCartButton'
import ReviewForm from '@/components/ReviewForm'
import ProductReviews from '@/components/ProductReviews'
import { Star } from 'lucide-react'
import { Metadata } from 'next'
import { adminDb } from '@/lib/firebase/admin'
import { getServerUser } from '@/lib/firebase/session'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const snap = await adminDb.collection('products').doc(slug).get()
  if (!snap.exists) return {}
  const product = snap.data()!
  return {
    title: `${product.name} | Luxury Furniture Nigeria`,
    description: product.description?.slice(0, 160),
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params

  const productSnap = await adminDb.collection('products').doc(slug).get()
  if (!productSnap.exists) notFound()
  const productData = productSnap.data()!
  const product = {
    id: productSnap.id,
    slug: productSnap.id,
    name: productData.name,
    description: productData.description ?? '',
    price: productData.price,
    images: productData.images ?? [],
  }

  const reviewsSnap = await adminDb
    .collection('reviews')
    .where('productId', '==', slug)
    .orderBy('createdAt', 'desc')
    .get()
  const reviews = reviewsSnap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      rating: data.rating,
      title: data.title || null,
      comment: data.comment,
      images: data.images ?? [],
      userName: data.userName,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
    }
  })

  const avgRating = productData.avgRating ? productData.avgRating.toFixed(1) : null
  const user = await getServerUser()

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          {product.images.length > 0 ? (
            product.images.map((img: string, idx: number) => (
              <div key={idx} className="relative h-96 w-full bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={img}
                  alt={product.name}
                  fill
                  priority={idx === 0}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            ))
          ) : (
            <div className="relative h-96 w-full bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">No image available</span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <h1 className="text-4xl font-serif text-gray-900">{product.name}</h1>
          <p className="text-3xl font-bold text-luxury-gold">₦{product.price.toLocaleString()}</p>

          {/* Average Rating */}
          {avgRating && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < parseFloat(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-sm text-gray-600">{avgRating} out of 5 ({reviews.length} reviews)</span>
            </div>
          )}

          <div className="prose prose-lg text-gray-600">{product.description}</div>
          <div className="pt-4">
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        {user && <ReviewForm productId={product.slug} />}
        <ProductReviews reviews={reviews} />
      </div>
    </main>
  )
}
