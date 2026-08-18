import { describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'
import { middleware } from './middleware'
import { SESSION_COOKIE_NAME } from '@/lib/firebase/constants'

function makeRequest(path: string, withSession: boolean) {
  const url = `https://example.com${path}`
  const headers = new Headers()
  if (withSession) headers.set('cookie', `${SESSION_COOKIE_NAME}=fake-session-cookie`)
  return new NextRequest(url, { headers })
}

describe('middleware', () => {
  it.each(['/account', '/orders', '/checkout', '/admin'])(
    'redirects unauthenticated requests to %s to /login',
    (path) => {
      const res = middleware(makeRequest(path, false))
      expect(res.status).toBe(307)
      const location = new URL(res.headers.get('location')!)
      expect(location.pathname).toBe('/login')
      expect(location.searchParams.get('redirectTo')).toBe(path)
    }
  )

  it.each(['/account', '/orders', '/checkout', '/admin'])(
    'lets requests with a session cookie through to %s',
    (path) => {
      const res = middleware(makeRequest(path, true))
      expect(res.status).toBe(200)
      expect(res.headers.get('location')).toBeNull()
    }
  )

  it('does not redirect unauthenticated requests to public paths', () => {
    const res = middleware(makeRequest('/', false))
    expect(res.status).toBe(200)
  })
})
