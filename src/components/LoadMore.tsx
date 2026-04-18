'use client'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LoadMore({ currentPage }: { currentPage: number }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const loadMore = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', (currentPage + 1).toString())
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="flex justify-center mt-12">
      <button
        onClick={loadMore}
        className="px-8 py-3 bg-luxury-charcoal text-white rounded-sm hover:bg-luxury-gold hover:text-luxury-charcoal transition-all duration-300"
      >
        Load More Products
      </button>
    </div>
  )
}