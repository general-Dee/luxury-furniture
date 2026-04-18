import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/components/CartProvider'
import Navbar from '@/components/Navbar'
import NewsletterSignup from '@/components/NewsletterSignup'
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-luxury-cream`}>
        <CartProvider>
          <Navbar />
          <main className="min-h-screen pt-20">
            <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading...</div>}>
              {children}
            </Suspense>
          </main>
          {/* Global Newsletter Section */}
          <div className="container-luxury py-16">
            <div className="max-w-2xl mx-auto">
              <NewsletterSignup />
            </div>
          </div>
          <footer className="bg-luxury-charcoal text-white py-12">
            <div className="container-luxury text-center">
              <p className="text-sm">&copy; {new Date().getFullYear()} Luxury Furniture Nigeria. Timeless elegance for your home.</p>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  )
}