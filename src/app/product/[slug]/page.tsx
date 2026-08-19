import { notFound } from 'next/navigation'
import Image from 'next/image'
import AddToCartButton from '@/components/AddToCartButton'
import ReviewForm from '@/components/ReviewForm'
import ProductReviews from '@/components/ProductReviews'
import StarRating from '@/components/StarRating'
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
    categoryName: productData.categoryName ?? null,
    stock: productData.stock ?? 0,
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
    <main className="ind-scope max-w-7xl mx-auto px-6 py-12">
      <div className="grid md:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          {product.images.length > 0 ? (
            product.images.map((img: string, idx: number) => (
              <figure key={idx} className="ind-blueprint ind-duotone relative m-0">
                <i className="ind-corner tl" />
                <i className="ind-corner tr" />
                <i className="ind-corner bl" />
                <i className="ind-corner br" />
                <div className="relative h-96 w-full">
                  <Image
                    src={img}
                    alt={product.name}
                    fill
                    priority={idx === 0}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              </figure>
            ))
          ) : (
            <div className="ind-blueprint relative flex h-96 w-full items-center justify-center">
              <i className="ind-corner tl" />
              <i className="ind-corner tr" />
              <i className="ind-corner bl" />
              <i className="ind-corner br" />
              <span className="opacity-50">No image available</span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-4">
          {product.categoryName && <span className="ind-tag ind-tag-accent">{product.categoryName}</span>}
          <h1 className="uppercase text-4xl">{product.name}</h1>
          <p
            style={{ fontFamily: 'var(--ind-font-heading)', fontWeight: 600, fontSize: '30px' }}
            className="text-[var(--ind-color-accent-700)]"
          >
            ₦{product.price.toLocaleString()}
          </p>

          {avgRating && (
            <div className="flex items-center gap-2">
              <StarRating rating={parseFloat(avgRating)} size={18} />
              <span className="text-sm opacity-60">
                {avgRating} out of 5 ({reviews.length} review{reviews.length === 1 ? '' : 's'})
              </span>
            </div>
          )}

          <p className="max-w-[60ch] opacity-80 leading-relaxed">{product.description}</p>

          <div className="pt-2">
            <AddToCartButton product={product} />
          </div>

          <div className="ind-plate relative mt-4">
            <i className="ind-corner ind-plate-corner tl" />
            <i className="ind-corner ind-plate-corner tr" />
            <i className="ind-corner ind-plate-corner bl" />
            <i className="ind-corner ind-plate-corner br" />
            <table className="ind-table !m-0">
              <tbody>
                <tr>
                  <td className="opacity-60 w-2/5">Category</td>
                  <td>{product.categoryName || '—'}</td>
                </tr>
                <tr>
                  <td className="opacity-60 w-2/5">Availability</td>
                  <td>{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</td>
                </tr>
                <tr>
                  <td className="opacity-60 w-2/5">Reviews</td>
                  <td>{reviews.length} customer review{reviews.length === 1 ? '' : 's'}</td>
                </tr>
                <tr>
                  <td className="opacity-60 w-2/5">SKU</td>
                  <td>{product.slug}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16">
        <div className="flex items-center gap-4 mb-6">
          <span className="ind-card-kicker">Customer reviews</span>
          <div className="flex-1 border-t border-[var(--ind-color-divider)]" />
        </div>
        {user && <ReviewForm productId={product.slug} />}
        <ProductReviews reviews={reviews} />
      </div>
    </main>
  )
}
