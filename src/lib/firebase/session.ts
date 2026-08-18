import 'server-only'
import { cookies } from 'next/headers'
import { adminAuth } from './admin'
import { SESSION_COOKIE_NAME } from './constants'

export { SESSION_COOKIE_NAME, SESSION_EXPIRES_IN_MS } from './constants'

export type ServerUser = {
  uid: string
  email: string | null
  admin: boolean
}

/**
 * Verifies the session cookie against Firebase Admin (not just presence).
 * Use this in server components, layouts, and API routes that read/write
 * user-scoped data — middleware only checks the cookie is present.
 */
export async function getServerUser(): Promise<ServerUser | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (!sessionCookie) return null

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true)
    return {
      uid: decoded.uid,
      email: decoded.email ?? null,
      admin: decoded.admin === true,
    }
  } catch {
    return null
  }
}

export async function requireAdmin(): Promise<ServerUser> {
  const user = await getServerUser()
  if (!user || !user.admin) {
    throw new Error('Forbidden: admin access required')
  }
  return user
}
