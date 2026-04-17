'use client'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useCartStore } from '@/store/cartStore'
import { useState } from 'react'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  images: string[]
  description: string
  categories?: { name: string; slug: string }
}

export default function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const addToCart = useCartStore((state) => state.addItem)
  const [imgSrc, setImgSrc] = useState(product.images[0] || '/placeholder.jpg')

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addToCart({
      id: product.id,
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0] || '/placeholder.jpg',
    })
  }

  const handleImageError = () => {
    setImgSrc('/placeholder.jpg')
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -8 }}
      className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300"
    >
      <Link href={`/product/${product.slug}`}>
        <div className="relative h-80 w-full overflow-hidden bg-gray-100">
          <Image
            src={imgSrc}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            onError={handleImageError}
          />
          {product.categories && (
            <span className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-full text-luxury-charcoal">
              {product.categories.name}
            </span>
          )}
        </div>
      </Link>
      <div className="p-5">
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-xl font-serif text-gray-800 mb-2 hover:text-luxury-gold transition">
            {product.name}
          </h3>
        </Link>
        <p className="text-gray-500 text-sm mb-3 line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-2xl font-bold text-luxury-gold">
            ₦{product.price.toLocaleString()}
          </span>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            className="bg-luxury-charcoal text-white px-4 py-2 rounded-sm text-sm hover:bg-luxury-gold hover:text-luxury-charcoal transition-all duration-300"
          >
            Add to Cart
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}