'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import ProductCard from '@/components/ProductCard'
import Hero from '@/components/Hero'
import CategoryNav from '@/components/CategoryNav'
import ProductFilters from '@/components/ProductFilters'

const PRODUCTS_PER_PAGE = 12

export default function Home() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  const fetchProducts = useCallback(async (pageNum: number, append = false) => {
    setLoading(true)
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', pageNum.toString())
    params.set('limit', PRODUCTS_PER_PAGE.toString())
    const res = await fetch(`/api/products?${params.toString()}`)
    const data = await res.json()
    if (append) {
      setProducts(prev => [...prev, ...(data.products || [])])
    } else {
      setProducts(data.products || [])
    }
    setHasMore(data.hasMore)
    setLoading(false)
  }, [searchParams])

  useEffect(() => {
    // Reset when filters change
    setPage(1)
    fetchProducts(1, false).finally(() => setInitialLoading(false))
  }, [searchParams, fetchProducts])

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchProducts(nextPage, true)
  }

  if (initialLoading) {
    return <div className="container-luxury py-12 text-center">Loading...</div>
  }

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
              <ProductCard key={product.id} product={product} priority={index < 4 && page === 1} />
            ))
          )}
        </div>
        {hasMore && (
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