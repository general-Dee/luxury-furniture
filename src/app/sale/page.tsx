'use client'
import { useEffect, useState } from 'react'
import ProductCard from '@/components/ProductCard'
import type { ProductListItem } from '@/types/firestore'

export default function SalePage() {
  const [products, setProducts] = useState<ProductListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/products?sale=true&limit=50')
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || [])
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="ind-scope max-w-7xl mx-auto px-6 py-20 text-center">Loading sale items...</div>

  return (
    <div className="ind-scope max-w-7xl mx-auto px-6 py-12">
      <h1 className="uppercase text-3xl mb-2">Sale</h1>
      <p className="opacity-70 mb-8">Limited‑time offers on selected luxury pieces</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {products.length === 0 && (
        <p className="text-center opacity-60">No sale items at the moment. Check back soon!</p>
      )}
    </div>
  )
}