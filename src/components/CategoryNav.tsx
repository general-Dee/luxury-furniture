'use client'
import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'
import { useRouter, useSearchParams } from 'next/navigation'

type Category = { slug: string; name: string }

export default function CategoryNav() {
  const [categories, setCategories] = useState<Category[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()
  // Derived directly from the URL — no need to mirror it into local state.
  const activeSlug = searchParams.get('category') || 'all'

  useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = await getDocs(collection(db, 'categories'))
      setCategories(snapshot.docs.map((d) => ({ slug: d.id, name: d.data().name })))
    }
    fetchCategories()
  }, [])

  const handleCategoryClick = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (slug === 'all') params.delete('category')
    else params.set('category', slug)
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap justify-center gap-3 mb-12">
      <button
        onClick={() => handleCategoryClick('all')}
        className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
          activeSlug === 'all'
            ? 'bg-luxury-gold text-white shadow-md'
            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
        }`}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat.slug}
          onClick={() => handleCategoryClick(cat.slug)}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            activeSlug === cat.slug
              ? 'bg-luxury-gold text-white shadow-md'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}
