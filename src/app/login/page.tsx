'use client'
import { Suspense, useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase/client'
import { establishSession } from '@/lib/firebase/establish-session'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'

function firebaseAuthErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.'
    default:
      return 'Something went wrong. Please try again.'
  }
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password)
      await establishSession(credential.user)
      const redirectTo = searchParams.get('redirectTo')
      router.push(redirectTo || '/')
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
          Sign in to your account
        </h2>
        <form onSubmit={handleLogin} className="ind-card ind-blueprint relative space-y-4">
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
              placeholder="••••••••"
            />
          </div>

          {error && <div className="text-red-500 text-sm text-center">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="ind-btn ind-btn-primary ind-btn-block"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="text-sm text-center opacity-80">
            <Link href="/signup" className="text-[var(--ind-color-accent)] hover:underline">
              Don&apos;t have an account? Sign up
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  )
}