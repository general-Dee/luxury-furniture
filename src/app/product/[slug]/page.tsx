import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import AddToCartButton from '@/components/AddToCartButton'
import ReviewForm from '@/components/ReviewForm'
import ProductReviews from '@/components/ProductReviews'
import { Star } from 'lucide-react'
import { Metadata } from 'next'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select('name, description')
    .eq('slug', slug)
    .single()
  if (!product) return {}
  return {
    title: `${product.name} | Luxury Furniture Nigeria`,
    description: product.description?.slice(0, 160),
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch product
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !product) notFound()

  // Fetch reviews with profiles (email)
  const { data: reviewsData } = await supabase
    .from('reviews')
    .select('*, profiles!user_id(email)')
    .eq('product_id', product.id)
    .order('created_at', { ascending: false }) as any

  const reviews = reviewsData || []
  const avgRating = reviews.length
    ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          {product.images && product.images.length > 0 ? (
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
        {user && (
          <ReviewForm productId={product.id} userId={user.id} onReviewSubmitted={() => {}} />
        )}
        <ProductReviews reviews={reviews} />
      </div>
    </main>
  )
}