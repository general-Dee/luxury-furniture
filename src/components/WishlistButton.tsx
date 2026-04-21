'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface WishlistButtonProps {
  productId: string
  className?: string
}

export default function WishlistButton({ productId, className = '' }: WishlistButtonProps) {
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const checkWishlist = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }
      setUserId(user.id)
      const { data } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle()
      setIsInWishlist(!!data)
      setLoading(false)
    }
    checkWishlist()
  }, [productId, supabase])

  const toggleWishlist = async () => {
    if (!userId) {
      router.push('/login?redirectTo=' + encodeURIComponent(window.location.pathname))
      return
    }

    if (isInWishlist) {
      await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId)
      setIsInWishlist(false)
    } else {
      // Cast insert object to any to bypass TypeScript inference
      await supabase
        .from('wishlist')
        .insert({ user_id: userId, product_id: productId } as any)
      setIsInWishlist(true)
    }
  }

  if (loading) return <div className="w-6 h-6 animate-pulse bg-gray-200 rounded-full" />

  return (
    <button
      onClick={toggleWishlist}
      className={`${className} transition-transform hover:scale-110 focus:outline-none`}
      aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        className={`w-6 h-6 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'}`}
      />
    </button>
  )
}