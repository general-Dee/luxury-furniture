'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import UserMenu from './UserMenu'
import CartIcon from './CartIcon'
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
      className={`ind-scope fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[var(--ind-color-bg)]/95 backdrop-blur-md shadow-[var(--ind-shadow-sm)] border-b border-[var(--ind-color-divider)]'
          : 'bg-[var(--ind-color-bg)]/80 backdrop-blur-sm border-b border-[var(--ind-color-divider)]/50'
      }`}
    >
      <div className="ind-nav max-w-7xl mx-auto !py-0 h-16 md:h-20">
        {/* Logo */}
        <Link href="/" className="ind-nav-brand uppercase">
          Luxury Furniture
        </Link>

        {/* Desktop Category Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/?category=living-room" className="text-sm font-medium">Living Room</Link>
          <Link href="/?category=bedroom" className="text-sm font-medium">Bedroom</Link>
          <Link href="/?category=office" className="text-sm font-medium">Office</Link>
          <Link href="/sale" className="text-sm font-medium">Sale</Link>
        </div>

        {/* Right side icons */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Home Icon (visible on all screen sizes) */}
          <Link href="/" className="hover:text-[var(--ind-color-accent)] transition-colors" aria-label="Home">
            <Home className="w-5 h-5" strokeWidth={1.5} />
          </Link>

          <Link href="/blog" className="hidden md:inline-block text-sm font-medium">
            Blog
          </Link>
          <CartIcon />
          <UserMenu />
        </div>
      </div>
    </motion.header>
  )
}
