'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import ProductCard from '@/components/ProductCard'
import CategoryNav from '@/components/CategoryNav'
import ProductFilters from '@/components/ProductFilters'
import type { ProductListItem } from '@/types/firestore'

const PRODUCTS_PER_PAGE = 12

export default function Home() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<ProductListItem[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = useCallback(async (afterCursor: string | null, append = false) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams(searchParams.toString())
      params.set('limit', PRODUCTS_PER_PAGE.toString())
      if (afterCursor) params.set('cursor', afterCursor)
      const url = `/api/products?${params.toString()}`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (append) {
        setProducts(prev => [...prev, ...(data.products || [])])
      } else {
        setProducts(data.products || [])
      }
      setHasMore(data.hasMore)
      setCursor(data.nextCursor)
    } catch (err) {
      console.error('Fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load products')
    } finally {
      setLoading(false)
      setInitialLoading(false)
    }
  }, [searchParams])

  useEffect(() => {
    setCursor(null)
    fetchProducts(null, false)
  }, [searchParams, fetchProducts])

  const loadMore = () => {
    fetchProducts(cursor, true)
  }

  if (initialLoading) return <div className="ind-scope max-w-7xl mx-auto px-6 py-20 text-center">Loading products...</div>
  if (error) return <div className="ind-scope max-w-7xl mx-auto px-6 py-20 text-center text-red-500">Error: {error}</div>

  return (
    <div className="ind-scope">
      <section className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-6 py-24 md:py-32">
        <div>
          <span className="ind-tag ind-tag-outline">Est. drawing set 04</span>
          <h1
            className="uppercase mt-3 leading-[1.03] tracking-[0.01em]"
            style={{ fontSize: 'clamp(40px, 6vw, 68px)' }}
          >
            Furniture, specified<br />to the millimetre.
          </h1>
          <p className="max-w-[52ch] text-base opacity-80 mt-4">
            Every piece drawn before it&apos;s built: frame stock, joinery, upholstery weight and finish, all on
            record. Handcrafted, load-tested, delivered across Nigeria.
          </p>
          <div className="flex gap-3 mt-6">
            <a href="#products" className="ind-btn ind-btn-primary">Explore the catalog</a>
            <Link href="/signup" className="ind-btn ind-btn-ghost">Request the spec book</Link>
          </div>
        </div>
        <figure className="ind-blueprint ind-duotone relative m-0">
          <i className="ind-corner tl" />
          <i className="ind-corner tr" />
          <i className="ind-corner bl" />
          <i className="ind-corner br" />
          <div className="relative w-full aspect-[4/3]">
            <Image
              src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1600"
              alt="Luxury furniture showroom"
              fill
              priority
              fetchPriority="high"
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </figure>
      </section>

      <div className="max-w-7xl mx-auto px-6 pb-8" id="products">
        <ProductFilters />
        <CategoryNav />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.length === 0 ? (
            <p className="col-span-full text-center opacity-60 py-12">
              No products found. Try adjusting your filters.
            </p>
          ) : (
            products.map((product, index) => (
              <ProductCard key={product.id} product={product} priority={index < 4} />
            ))
          )}
        </div>
        {hasMore && products.length > 0 && (
          <div className="flex justify-center mt-12">
            <button onClick={loadMore} disabled={loading} className="ind-btn ind-btn-primary">
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
