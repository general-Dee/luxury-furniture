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
    router.push('/')
  }

  if (!user) {
    return (
      <div className="flex gap-4">
        <Link href="/login" className="text-amber-800 hover:text-amber-900">Login</Link>
        <Link href="/signup" className="bg-amber-800 text-white px-4 py-2 rounded-sm hover:bg-amber-900">Sign Up</Link>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-2 focus:outline-none"
      >
        <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 font-semibold">
          {user.email?.[0].toUpperCase()}
        </div>
        <span className="hidden md:inline text-gray-700">{user.email?.split('@')[0]}</span>
      </button>

      {menuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border">
          <Link href="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            My Account
          </Link>
          <Link href="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            My Orders
          </Link>
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}