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
    return <div className="container-luxury py-20 text-center">Loading...</div>
  }

  if (items.length === 0) {
    return (
      <div className="container-luxury py-20 text-center">
        <h1 className="text-3xl font-serif mb-4">Your Wishlist</h1>
        <p className="text-gray-500 mb-8">You haven&apos;t saved any products yet.</p>
        <Link href="/" className="btn-primary">Start Shopping</Link>
      </div>
    )
  }

  return (
    <div className="container-luxury py-12">
      <h1 className="text-3xl font-serif mb-8">Your Wishlist</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {items.map((item) => (
          <div key={item.productId} className="bg-white rounded-lg shadow-md overflow-hidden relative group">
            <Link href={`/product/${item.slug}`}>
              <div className="relative h-64 w-full bg-gray-100">
                <Image
                  src={item.image || '/placeholder.jpg'}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-105 transition"
                />
              </div>
            </Link>
            <div className="p-4">
              <Link href={`/product/${item.slug}`}>
                <h2 className="font-serif text-lg mb-1 hover:text-luxury-gold">{item.name}</h2>
              </Link>
              <p className="text-luxury-gold font-bold">₦{item.price.toLocaleString()}</p>
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
