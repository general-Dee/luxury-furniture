'use client'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useCartStore } from '@/store/cartStore'
import { useState } from 'react'
import WishlistButton from './WishlistButton'
import toast from 'react-hot-toast'
import type { ProductListItem } from '@/types/firestore'

const FALLBACK_IMAGE = 'https://placehold.co/600x400?text=Luxury+Furniture'

type Product = ProductListItem

export default function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const addToCart = useCartStore((state) => state.addItem)
  const [imgSrc, setImgSrc] = useState(product.images[0] || FALLBACK_IMAGE)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart({
      id: product.id,
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0] || FALLBACK_IMAGE,
    })
    toast.success(
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 overflow-hidden">
          <Image src={product.images[0] || FALLBACK_IMAGE} alt={product.name} width={40} height={40} className="object-cover" />
        </div>
        <div>
          <p className="font-semibold">{product.name}</p>
          <p className="text-sm text-[var(--ind-color-accent)]">Added to cart</p>
        </div>
      </div>,
      { duration: 3000 }
    )
  }

  const handleImageError = () => {
    setImgSrc(FALLBACK_IMAGE)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -8 }}
      className="ind-scope ind-card ind-blueprint relative !p-0 !gap-0"
    >
      <i className="ind-corner tl" />
      <i className="ind-corner tr" />
      <i className="ind-corner bl" />
      <i className="ind-corner br" />
      <Link href={`/product/${product.slug}`}>
        <div className="ind-duotone relative h-80 w-full overflow-hidden border-b border-[var(--ind-color-divider)]">
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
            <span className="ind-tag ind-tag-neutral absolute top-4 left-4 backdrop-blur-sm">
              {product.categories.name}
            </span>
          )}
        </div>
      </Link>
      <div className="absolute top-2 right-2 z-10">
        <WishlistButton product={product} />
      </div>
      <div className="p-4 flex flex-col gap-2">
        <Link href={`/product/${product.slug}`}>
          <h3 className="ind-card-title hover:text-[var(--ind-color-accent)] transition">
            {product.name}
          </h3>
        </Link>
        <p className="ind-card-body line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center mt-2">
          <span
            className="font-semibold text-xl"
            style={{ fontFamily: 'var(--ind-font-heading)', color: 'var(--ind-color-accent-700)' }}
          >
            ₦{product.price.toLocaleString()}
          </span>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            className="ind-btn ind-btn-primary"
          >
            Add
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
