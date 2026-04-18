'use client'
import dynamic from 'next/dynamic'

const ProductFilters = dynamic(() => import('@/components/ProductFilters'), {
  loading: () => <div className="h-32" />,
})

export default function LazyProductFilters() {
  return <ProductFilters />
}