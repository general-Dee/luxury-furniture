'use client'
import { useCartStore } from '@/store/cartStore'
import { motion } from 'framer-motion'

export default function AddToCartButton({ product }: { product: any }) {
  const addToCart = useCartStore((s) => s.addItem)

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() =>
        addToCart({
          id: product.id,
          product_id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.images[0],
        })
      }
      className="w-full bg-amber-800 text-white py-4 text-lg font-semibold rounded-sm hover:bg-amber-900 transition"
    >
      Add to Cart – ₦{product.price.toLocaleString()}
    </motion.button>
  )
}
