'use client'
import dynamic from 'next/dynamic'

const CategoryNav = dynamic(() => import('@/components/CategoryNav'), {
  loading: () => <div className="h-12" />,
})

export default function LazyCategoryNav() {
  return <CategoryNav />
}