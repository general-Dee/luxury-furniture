import type { User } from 'firebase/auth'

/**
 * After a client-side Firebase sign-in/sign-up, exchange the ID token for an
 * httpOnly session cookie so server components and middleware can see the
 * user too (the Firebase client SDK's own persistence is browser-local only).
 */
export async function establishSession(user: User) {
  const idToken = await user.getIdToken()
  const res = await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  })
  if (!res.ok) {
    throw new Error('Failed to establish session')
  }
}

export async function clearSession() {
  await fetch('/api/auth/logout', { method: 'POST' })
}
