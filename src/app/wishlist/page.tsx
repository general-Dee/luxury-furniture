'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import WishlistButton from '@/components/WishlistButton'

export default function WishlistPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchWishlist = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Cast the entire query to any to bypass TypeScript inference
      const { data: wishlistItems } = await supabase
        .from('wishlist')
        .select('products(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }) as any

      setProducts(wishlistItems?.map((item: any) => item.products) || [])
      setLoading(false)
    }

    fetchWishlist()
  }, [supabase, router])

  if (loading) {
    return <div className="container-luxury py-20 text-center">Loading...</div>
  }

  if (products.length === 0) {
    return (
      <div className="container-luxury py-20 text-center">
        <h1 className="text-3xl font-serif mb-4">Your Wishlist</h1>
        <p className="text-gray-500 mb-8">You haven't saved any products yet.</p>
        <Link href="/" className="btn-primary">Start Shopping</Link>
      </div>
    )
  }

  return (
    <div className="container-luxury py-12">
      <h1 className="text-3xl font-serif mb-8">Your Wishlist</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {products.map((product: any) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden relative group">
            <Link href={`/product/${product.slug}`}>
              <div className="relative h-64 w-full bg-gray-100">
                <Image
                  src={product.images?.[0] || '/placeholder.jpg'}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition"
                />
              </div>
            </Link>
            <div className="p-4">
              <Link href={`/product/${product.slug}`}>
                <h2 className="font-serif text-lg mb-1 hover:text-luxury-gold">{product.name}</h2>
              </Link>
              <p className="text-luxury-gold font-bold">₦{product.price.toLocaleString()}</p>
            </div>
            <div className="absolute top-2 right-2">
              <WishlistButton productId={product.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}