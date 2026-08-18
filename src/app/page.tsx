'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import ProductCard from '@/components/ProductCard'
import Hero from '@/components/Hero'
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

  if (initialLoading) return <div className="container-luxury py-20 text-center">Loading products...</div>
  if (error) return <div className="container-luxury py-20 text-center text-red-500">Error: {error}</div>

  return (
    <>
      <Hero />
      <div className="container-luxury py-12" id="products">
        <CategoryNav />
        <ProductFilters />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-8">
          {products.length === 0 ? (
            <p className="col-span-full text-center text-gray-500 py-12">
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
            <button
              onClick={loadMore}
              disabled={loading}
              className="px-8 py-3 bg-luxury-charcoal text-white rounded-sm hover:bg-luxury-gold hover:text-luxury-charcoal transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </>
  )
}