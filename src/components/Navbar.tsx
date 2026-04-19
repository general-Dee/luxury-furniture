'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import UserMenu from './UserMenu'
import { motion } from 'framer-motion'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
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
      <div className="container-luxury">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="group relative z-10">
            <span className="text-xl md:text-2xl font-serif tracking-tight">
              <span className="text-luxury-charcoal">Luxury</span>
              <span className="text-luxury-gold transition-all duration-300 group-hover:tracking-wider">
                Furniture
              </span>
            </span>
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-luxury-gold transition-all duration-300 group-hover:w-full" />
          </Link>

          {/* Right side: Blog, Cart, UserMenu */}
          <div className="flex items-center gap-4 md:gap-6">
            <Link
              href="/blog"
              className="hidden md:inline-block text-gray-600 hover:text-luxury-gold transition-colors duration-200 text-sm font-medium leading-none"
            >
              Blog
            </Link>

            <Link
              href="/cart"
              className="relative text-gray-600 hover:text-luxury-gold transition-colors duration-200 group"
              aria-label="Shopping cart"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 transition-transform duration-200 group-hover:scale-110"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 21h6M12 21v-6"
                />
              </svg>
            </Link>

            <UserMenu />
          </div>
        </div>
      </div>
    </motion.header>
  )
}