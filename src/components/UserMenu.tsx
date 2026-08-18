'use client'
import { useEffect, useState } from 'react'
import { onAuthStateChanged, signOut, type User } from 'firebase/auth'
import { auth } from '@/lib/firebase/client'
import { clearSession } from '@/lib/firebase/establish-session'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function UserMenu() {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        const tokenResult = await firebaseUser.getIdTokenResult()
        setIsAdmin(tokenResult.claims.admin === true)
      } else {
        setIsAdmin(false)
      }
      router.refresh()
    })
    return () => unsubscribe()
  }, [router])

  const handleLogout = async () => {
    await signOut(auth)
    await clearSession()
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
          {isAdmin && (
            <Link href="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
              Admin
            </Link>
          )}
          <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
