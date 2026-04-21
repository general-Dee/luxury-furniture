'use client'
import Link from 'next/link'
import UserMenu from './UserMenu'

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl md:text-2xl font-serif tracking-tight">
              <span className="text-luxury-charcoal">Luxury</span>
              <span className="text-luxury-gold">Furniture</span>
            </span>
          </Link>

          {/* Right side – Blog, Cart, UserMenu */}
          <div className="flex items-center gap-4 md:gap-6">
            <Link
              href="/blog"
              className="hidden md:inline-flex items-center text-gray-600 hover:text-luxury-gold text-sm font-medium transition-colors"
            >
              Blog
            </Link>

            <Link
              href="/cart"
              className="flex items-center text-gray-600 hover:text-luxury-gold transition-colors"
              aria-label="Cart"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
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
    </header>
  )
}