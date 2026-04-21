'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import UserMenu from './UserMenu'
import CartIcon from './CartIcon'
import { motion } from 'framer-motion'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100'
          : 'bg-white/80 backdrop-blur-sm border-b border-gray-100/50'
      }`}
    >
      <div className="container-luxury flex items-center justify-between h-16 md:h-20">
        <Link href="/" className="group relative z-10 flex-shrink-0">
          <span className="text-xl md:text-2xl font-serif tracking-tight">
            <span className="text-luxury-charcoal">Luxury</span>
            <span className="text-luxury-gold transition-all duration-300 group-hover:tracking-wider">
              Furniture
            </span>
          </span>
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-luxury-gold transition-all duration-300 group-hover:w-full" />
        </Link>

        <div className="flex items-center gap-4 md:gap-6">
          <Link href="/blog" className="hidden md:inline-block text-gray-600 hover:text-luxury-gold text-sm font-medium leading-none py-1">
            Blog
          </Link>
          <CartIcon />
          <UserMenu />
        </div>
      </div>
    </motion.header>
  )
}