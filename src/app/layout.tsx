import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/components/CartProvider'
import Link from 'next/link'
import UserMenu from '@/components/UserMenu'
import { Suspense } from 'react'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  title: 'Luxury Furniture Nigeria | Timeless Elegance',
  description: 'Discover premium handcrafted furniture for the discerning Nigerian home.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-luxury-cream`}>
        <CartProvider>
          <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
            <nav className="container-luxury">
              <div className="flex justify-between items-center h-20">
                <Link href="/" className="text-2xl md:text-3xl font-serif text-luxury-charcoal tracking-tight">
                  Luxury<span className="text-luxury-gold">Furniture</span>
                </Link>
                <div className="flex items-center gap-6">
                  <Link href="/cart" className="relative text-gray-600 hover:text-luxury-gold transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 21h6M12 21v-6" />
                    </svg>
                  </Link>
                  <UserMenu />
                </div>
              </div>
            </nav>
          </header>
          <main className="min-h-screen">
            <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading...</div>}>
              {children}
            </Suspense>
          </main>
          <footer className="bg-luxury-charcoal text-white py-12 mt-20">
            <div className="container-luxury text-center">
              <p className="text-sm">&copy; {new Date().getFullYear()} Luxury Furniture Nigeria. Timeless elegance for your home.</p>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  )
}