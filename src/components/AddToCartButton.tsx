'use client'
import { useCartStore } from '@/store/cartStore'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Image from 'next/image'

const FALLBACK_IMAGE = 'https://placehold.co/600x400?text=Luxury+Furniture'

export default function AddToCartButton({ product }: { product: any }) {
  const addToCart = useCartStore((s) => s.addItem)

  const handleAdd = () => {
    addToCart({
      id: product.id,
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images?.[0] || FALLBACK_IMAGE,
    })
    toast.success(
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 rounded overflow-hidden">
          <Image src={product.images?.[0] || FALLBACK_IMAGE} alt={product.name} width={40} height={40} className="object-cover" />
        </div>
        <div>
          <p className="font-semibold">{product.name}</p>
          <p className="text-sm text-luxury-gold">Added to cart</p>
        </div>
      </div>,
      { duration: 3000 }
    )
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleAdd}
      className="w-full bg-luxury-charcoal text-white py-4 text-lg font-semibold rounded-sm hover:bg-luxury-gold hover:text-luxury-charcoal transition-all duration-300"
    >
      Add to Cart – ₦{product.price.toLocaleString()}
    </motion.button>
  )
}