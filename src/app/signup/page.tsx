'use client'
import { useState } from 'react'
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/client'
import { establishSession } from '@/lib/firebase/establish-session'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'

function firebaseAuthErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.'
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.'
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    default:
      return 'Something went wrong. Please try again.'
  }
}

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password)
      await setDoc(doc(db, 'users', credential.user.uid), {
        email: credential.user.email,
        displayName: null,
        phone: null,
        createdAt: serverTimestamp(),
      })
      await sendEmailVerification(credential.user)
      await establishSession(credential.user)
      router.push('/')
      router.refresh()
    } catch (err) {
      setError(firebaseAuthErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ind-scope min-h-[70vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[380px] w-full"
      >
        <h2 className="uppercase text-center text-3xl mb-6">
          Create your account
        </h2>
        <form onSubmit={handleSignup} className="ind-card ind-blueprint relative space-y-4">
          <i className="ind-corner tl" />
          <i className="ind-corner tr" />
          <i className="ind-corner bl" />
          <i className="ind-corner br" />
          <div className="ind-field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="ind-input"
              placeholder="you@example.com"
            />
          </div>
          <div className="ind-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="ind-input"
              placeholder="Min. 6 characters"
            />
          </div>

          {error && <div className="text-red-500 text-sm text-center">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="ind-btn ind-btn-primary ind-btn-block"
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>

          <div className="text-sm text-center opacity-80">
            <Link href="/login" className="text-[var(--ind-color-accent)] hover:underline">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
