'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '@/lib/firebase/client'
import Link from 'next/link'
import Image from 'next/image'
import WishlistButton from '@/components/WishlistButton'

type WishlistItem = {
  productId: string
  slug: string
  name: string
  price: number
  image: string
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login')
        return
      }

      const q = query(collection(db, 'users', user.uid, 'wishlist'), orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      setItems(snapshot.docs.map((d) => d.data() as WishlistItem))
      setLoading(false)
    })
    return () => unsubscribe()
  }, [router])

  if (loading) {
    return <div className="ind-scope max-w-7xl mx-auto px-6 py-20 text-center">Loading...</div>
  }

  if (items.length === 0) {
    return (
      <div className="ind-scope max-w-7xl mx-auto px-6 py-12">
        <h1 className="uppercase text-3xl mb-8">Your wishlist</h1>
        <div className="ind-plate relative text-center" style={{ padding: 'calc(3 * var(--ind-space-8)) var(--ind-space-6)' }}>
          <i className="ind-corner ind-plate-corner tl" />
          <i className="ind-corner ind-plate-corner tr" />
          <i className="ind-corner ind-plate-corner bl" />
          <i className="ind-corner ind-plate-corner br" />
          <p className="opacity-60 mb-4">You haven&apos;t saved any products yet.</p>
          <Link href="/" className="ind-btn ind-btn-primary">Start shopping</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="ind-scope max-w-7xl mx-auto px-6 py-12">
      <h1 className="uppercase text-3xl mb-8">Your wishlist</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {items.map((item) => (
          <div key={item.productId} className="ind-card ind-blueprint relative !p-0 !gap-0">
            <i className="ind-corner tl" />
            <i className="ind-corner tr" />
            <i className="ind-corner bl" />
            <i className="ind-corner br" />
            <Link href={`/product/${item.slug}`}>
              <div className="ind-duotone relative h-64 w-full border-b border-[var(--ind-color-divider)]">
                <Image
                  src={item.image || '/placeholder.jpg'}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
            </Link>
            <div className="p-4">
              <Link href={`/product/${item.slug}`}>
                <h2 className="ind-card-title hover:text-[var(--ind-color-accent)] transition">{item.name}</h2>
              </Link>
              <p className="mt-1 text-[var(--ind-color-accent-700)]" style={{ fontFamily: 'var(--ind-font-heading)', fontWeight: 600 }}>
                ₦{item.price.toLocaleString()}
              </p>
            </div>
            <div className="absolute top-2 right-2">
              <WishlistButton product={{ slug: item.slug, name: item.name, price: item.price, images: [item.image] }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
