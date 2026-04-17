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
      <nav className="container-luxury">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="group relative">
            <span className="text-2xl md:text-3xl font-serif tracking-tight">
              <span className="text-luxury-charcoal">Luxury</span>
              <span className="text-luxury-gold transition-all duration-300 group-hover:tracking-wider">
                Furniture
              </span>
            </span>
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-luxury-gold transition-all duration-300 group-hover:w-full" />
          </Link>

          {/* Right side: Cart + UserMenu */}
          <div className="flex items-center gap-6 md:gap-8">
            {/* Cart Icon with subtle hover */}
            <Link
              href="/cart"
              className="relative text-gray-600 hover:text-luxury-gold transition-colors duration-200 group"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 transition-transform duration-200 group-hover:scale-110"
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
              {/* Optional badge for cart count – you can add later */}
            </Link>

            {/* User Menu (already elegant) */}
            <UserMenu />
          </div>
        </div>
      </nav>
    </motion.header>
  )
}