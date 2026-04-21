'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function UserMenu() {
  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
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
      <div className="flex gap-4">
        <Link href="/login" className="text-amber-800 hover:text-luxury-gold transition">
          Login
        </Link>
        <Link
          href="/signup"
          className="bg-luxury-charcoal text-white px-4 py-2 rounded-sm hover:bg-luxury-gold hover:text-luxury-charcoal transition-all duration-300"
        >
          Sign Up
        </Link>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-2 focus:outline-none group"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-luxury-gold to-amber-600 flex items-center justify-center text-white font-semibold shadow-md transition-transform duration-200 group-hover:scale-105">
          {user.email?.[0].toUpperCase()}
        </div>
        <span className="hidden md:inline text-gray-700 text-sm">
          {user.email?.split('@')[0]}
        </span>
      </button>

      {menuOpen && (
        <div className="absolute right-0 mt-3 w-52 bg-white rounded-lg shadow-xl py-2 z-10 border border-gray-100 overflow-hidden">
          <Link
            href="/account"
            className="block px-5 py-2.5 text-sm text-gray-700 hover:bg-luxury-cream transition"
            onClick={() => setMenuOpen(false)}
          >
            My Account
          </Link>
          <Link
            href="/orders"
            className="block px-5 py-2.5 text-sm text-gray-700 hover:bg-luxury-cream transition"
            onClick={() => setMenuOpen(false)}
          >
            My Orders
          </Link>
          <button
            onClick={handleLogout}
            className="block w-full text-left px-5 py-2.5 text-sm text-red-500 hover:bg-luxury-cream transition"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}