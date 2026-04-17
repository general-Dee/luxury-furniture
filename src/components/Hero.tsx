'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function Hero() {
  return (
    <section className="relative h-[70vh] min-h-[500px] w-full overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1600"
          alt="Luxury furniture showroom"
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>
      <div className="relative h-full flex items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl px-4"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white mb-4 drop-shadow-lg">
            Timeless Elegance
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8">
            Discover handcrafted luxury furniture for every room in your home.
          </p>
          <a
            href="#products"
            className="inline-block bg-luxury-gold text-luxury-charcoal px-8 py-3 rounded-sm font-medium hover:bg-amber-500 transition-all duration-300 shadow-lg"
          >
            Explore Collection
          </a>
        </motion.div>
      </div>
    </section>
  )
}