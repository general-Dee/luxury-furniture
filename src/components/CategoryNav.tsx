'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

type Category = { id: string; name: string; slug: string }

export default function CategoryNav() {
  const [categories, setCategories] = useState<Category[]>([])
  const [activeSlug, setActiveSlug] = useState<string>('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*')
      if (data) setCategories(data)
    }
    fetchCategories()
    const category = searchParams.get('category')
    if (category) setActiveSlug(category)
  }, [searchParams])

  const handleCategoryClick = (slug: string) => {
    setActiveSlug(slug)
    const params = new URLSearchParams(searchParams.toString())
    if (slug === 'all') {
      params.delete('category')
    } else {
      params.set('category', slug)
    }
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap justify-center gap-3 mb-12">
      <button
        onClick={() => handleCategoryClick('all')}
        className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
          activeSlug === '' || activeSlug === 'all'
            ? 'bg-luxury-gold text-white shadow-md'
            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
        }`}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => handleCategoryClick(cat.slug)}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            activeSlug === cat.slug
              ? 'bg-luxury-gold text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}