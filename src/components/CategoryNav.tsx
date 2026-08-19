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
    <div className="ind-scope flex flex-wrap gap-3 mb-6">
      <span
        onClick={() => handleCategoryClick('all')}
        className={`ind-tag cursor-pointer !px-4 !py-1.5 !text-[13px] ${
          activeSlug === 'all' ? 'ind-tag-accent' : 'ind-tag-outline'
        }`}
      >
        All
      </span>
      {categories.map((cat) => (
        <span
          key={cat.slug}
          onClick={() => handleCategoryClick(cat.slug)}
          className={`ind-tag cursor-pointer !px-4 !py-1.5 !text-[13px] ${
            activeSlug === cat.slug ? 'ind-tag-accent' : 'ind-tag-outline'
          }`}
        >
          {cat.name}
        </span>
      ))}
    </div>
  )
}
