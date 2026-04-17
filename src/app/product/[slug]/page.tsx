import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import AddToCartButton from '@/components/AddToCartButton'
import { motion } from 'framer-motion'
import type { Metadata } from 'next'
import Script from 'next/script'

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select('name, description, images')
    .eq('slug', params.slug)
    .single()

  if (!product) return {}

  return {
    title: `${product.name} | Luxury Furniture Nigeria`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: [product.images[0] || '/placeholder.jpg'],
      // 'product' type is not supported; omit or use 'website'
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/product/${params.slug}`,
    },
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!product) notFound()

  // Structured data for rich snippets
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images[0],
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'NGN',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/product/${product.slug}`,
    },
  }

  return (
    <>
      <Script
        id="product-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {product.images.map((img: string, idx: number) => (
              <div key={idx} className="relative h-96 w-full bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={img || '/placeholder.jpg'}
                  alt={product.name}
                  fill
                  priority={idx === 0}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h1 className="text-4xl font-serif text-gray-900">{product.name}</h1>
            <p className="text-3xl font-bold text-luxury-gold">₦{product.price.toLocaleString()}</p>
            <div className="prose prose-lg text-gray-600">{product.description}</div>
            <div className="pt-4">
              <AddToCartButton product={product} />
            </div>
          </motion.div>
        </div>
      </main>
    </>
  )
}