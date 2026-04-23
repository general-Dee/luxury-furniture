'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import UserMenu from './UserMenu'
import CartIcon from './CartIcon'
import ThemeToggle from './ThemeToggle'
import { motion } from 'framer-motion'
import { Home } from 'lucide-react'

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
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-100 dark:border-gray-800'
          : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-100/50 dark:border-gray-800/50'
      }`}
    >
      <div className="container-luxury flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link href="/" className="group relative z-10 flex-shrink-0">
          <span className="text-xl md:text-2xl font-serif tracking-tight dark:text-white">
            <span className="text-luxury-charcoal dark:text-white">Luxury</span>
            <span className="text-luxury-gold transition-all duration-300 group-hover:tracking-wider">Furniture</span>
          </span>
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-luxury-gold transition-all duration-300 group-hover:w-full" />
        </Link>

        {/* Desktop Category Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/?category=living-room" className="text-gray-600 dark:text-gray-300 hover:text-luxury-gold text-sm font-medium">Living Room</Link>
          <Link href="/?category=bedroom" className="text-gray-600 dark:text-gray-300 hover:text-luxury-gold text-sm font-medium">Bedroom</Link>
          <Link href="/?category=office" className="text-gray-600 dark:text-gray-300 hover:text-luxury-gold text-sm font-medium">Office</Link>
          <Link href="/sale" className="text-gray-600 dark:text-gray-300 hover:text-luxury-gold text-sm font-medium">Sale</Link>
        </div>

        {/* Right side icons */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Home Icon (visible on all screen sizes) */}
          <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-luxury-gold transition-colors" aria-label="Home">
            <Home className="w-5 h-5" />
          </Link>

          <Link href="/blog" className="hidden md:inline-block text-gray-600 dark:text-gray-300 hover:text-luxury-gold text-sm font-medium">
            Blog
          </Link>
          <CartIcon />
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </motion.header>
  )
}