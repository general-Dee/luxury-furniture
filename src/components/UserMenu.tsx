'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function UserMenu() {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single()
        setIsAdmin(!!profile?.is_admin)
      }
    }
    getUser()

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single()
        setIsAdmin(!!profile?.is_admin)
      } else {
        setIsAdmin(false)
      }
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
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="text-sm text-gray-600 hover:text-luxury-gold transition"
        >
          Login
        </Link>
        <Link
          href="/signup"
          className="text-sm bg-luxury-charcoal text-white px-4 py-1.5 rounded-md hover:bg-luxury-gold hover:text-luxury-charcoal transition"
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
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-luxury-gold to-amber-600 flex items-center justify-center text-white font-semibold shadow-md transition-transform duration-200 group-hover:scale-105 text-sm">
          {user.email?.[0].toUpperCase()}
        </div>
        <span className="hidden md:inline text-gray-700 text-sm">
          {user.email?.split('@')[0]}
        </span>
      </button>

      {menuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-10 border border-gray-100">
          <Link
            href="/account"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-luxury-cream"
            onClick={() => setMenuOpen(false)}
          >
            My Account
          </Link>
          <Link
            href="/orders"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-luxury-cream"
            onClick={() => setMenuOpen(false)}
          >
            My Orders
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-luxury-cream border-t border-gray-100 mt-1 pt-2"
              onClick={() => setMenuOpen(false)}
            >
              Admin Dashboard
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-luxury-cream"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}