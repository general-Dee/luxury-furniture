'use client'
import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '@/lib/firebase/client'
import { Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface WishlistProduct {
  slug: string
  name: string
  price: number
  images: string[]
}

interface WishlistButtonProps {
  product: WishlistProduct
  className?: string
}

export default function WishlistButton({ product, className = '' }: WishlistButtonProps) {
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uid, setUid] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUid(user?.uid ?? null)
      if (!user) {
        setLoading(false)
        return
      }
      try {
        const snap = await getDoc(doc(db, 'users', user.uid, 'wishlist', product.slug))
        setIsInWishlist(snap.exists())
      } catch (err) {
        console.warn('Wishlist check error:', err)
      } finally {
        setLoading(false)
      }
    })
    return () => unsubscribe()
  }, [product.slug])

  const toggleWishlist = async () => {
    if (!uid) {
      router.push('/login?redirectTo=' + encodeURIComponent(window.location.pathname))
      return
    }

    const ref = doc(db, 'users', uid, 'wishlist', product.slug)
    try {
      if (isInWishlist) {
        await deleteDoc(ref)
        setIsInWishlist(false)
      } else {
        await setDoc(ref, {
          productId: product.slug,
          name: product.name,
          slug: product.slug,
          price: product.price,
          image: product.images?.[0] || '',
          createdAt: serverTimestamp(),
        })
        setIsInWishlist(true)
      }
    } catch (err) {
      console.error('Wishlist toggle error:', err)
    }
  }

  if (loading) return <div className="w-6 h-6 animate-pulse bg-[var(--ind-color-surface)] rounded-full" />

  return (
    <button
      onClick={toggleWishlist}
      className={`${className} transition-transform hover:scale-110 focus:outline-none`}
      aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        className="w-6 h-6"
        style={{
          fill: isInWishlist ? 'var(--ind-color-accent)' : 'none',
          color: isInWishlist ? 'var(--ind-color-accent)' : 'var(--ind-color-neutral-500)',
        }}
      />
    </button>
  )
}
