import { createServerClient } from '@supabase/ssr'
import { updateSession } from '@/utils/supabase/middleware'
import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // First, update the session (handles anonymous cart cookie)
  const res = await updateSession(request)

  // Create Supabase client for auth checks
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protected customer routes
  const customerProtectedPaths = ['/account', '/orders', '/checkout']
  const isCustomerProtected = customerProtectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (isCustomerProtected && !user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Admin route protection – only users with is_admin = true can access
  const isAdminPath = request.nextUrl.pathname.startsWith('/admin')
  if (isAdminPath) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Check if user has admin privileges
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (error || !profile?.is_admin) {
      // Not an admin – redirect to homepage
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}