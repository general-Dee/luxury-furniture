import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE_NAME } from '@/lib/firebase/constants'

// Edge middleware can't run firebase-admin (needs Node crypto), so this is a
// cheap presence check only — it just avoids an obviously-logged-out user
// loading a protected page. The pages/routes behind these paths each verify
// the session cookie for real via getServerUser()/requireAdmin(), so this is
// a UX shortcut, not the security boundary.
export function middleware(request: NextRequest) {
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE_NAME)?.value)

  const protectedPaths = ['/account', '/orders', '/checkout', '/admin']
  const isProtected = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  if (isProtected && !hasSession) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
