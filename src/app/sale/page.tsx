'use client'
import { useEffect, useState } from 'react'
import ProductCard from '@/components/ProductCard'

export default function SalePage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/products?sale=true&limit=50')
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || [])
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="container-luxury py-20 text-center">Loading sale items...</div>

  return (
    <div className="container-luxury py-12">
      <h1 className="text-3xl font-serif mb-2">Sale</h1>
      <p className="text-gray-500 mb-8">Limited‑time offers on selected luxury pieces</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {products.length === 0 && (
        <p className="text-center text-gray-500">No sale items at the moment. Check back soon!</p>
      )}
    </div>
  )
}