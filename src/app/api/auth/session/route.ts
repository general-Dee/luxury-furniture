import { NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase/admin'
import { SESSION_COOKIE_NAME, SESSION_EXPIRES_IN_MS } from '@/lib/firebase/session'

export async function POST(request: Request) {
  const { idToken } = await request.json()
  if (!idToken || typeof idToken !== 'string') {
    return NextResponse.json({ error: 'Missing idToken' }, { status: 400 })
  }

  try {
    // Confirms the token is genuinely fresh (not just well-formed) before
    // minting a longer-lived session cookie from it.
    await adminAuth.verifyIdToken(idToken)

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_EXPIRES_IN_MS,
    })

    const response = NextResponse.json({ ok: true })
    response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_EXPIRES_IN_MS / 1000,
    })
    return response
  } catch {
    return NextResponse.json({ error: 'Invalid ID token' }, { status: 401 })
  }
}
