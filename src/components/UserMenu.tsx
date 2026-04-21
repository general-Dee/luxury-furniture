'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function UserMenu() {
  const [user, setUser] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const { data: listener } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null)
      router.refresh()
    })

    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [supabase, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setMenuOpen(false)
    router.push('/')
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login" className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-luxury-gold transition-colors">
          Login
        </Link>
        <Link href="/signup" className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium bg-luxury-charcoal text-white rounded-md hover:bg-luxury-gold hover:text-luxury-charcoal transition-all">
          Sign Up
        </Link>
      </div>
    )
  }

  return (
    <div className="relative flex items-center">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-2 focus:outline-none group"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-luxury-gold to-amber-600 flex items-center justify-center text-white font-semibold shadow-md transition-transform group-hover:scale-105">
          {user.email?.[0].toUpperCase()}
        </div>
        <span className="hidden md:inline-block text-sm text-gray-700">
          {user.email?.split('@')[0]}
        </span>
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-10 border border-gray-100">
          <Link href="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
            My Account
          </Link>
          <Link href="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
            My Orders
          </Link>
          <Link href="/wishlist" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
            My Wishlist
          </Link>
          <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
            Logout
          </button>
        </div>
      )}
    </div>
  )
}