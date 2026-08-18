import 'server-only'
import { cert, getApps, initializeApp, type App } from 'firebase-admin/app'
import { getAuth, type Auth } from 'firebase-admin/auth'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'

// Lazily initialized: Next.js imports route/page modules (to inspect their
// exports) during `next build`'s data-collection pass even for routes that
// are force-dynamic and never actually execute at build time. Eagerly
// calling cert()/initializeApp() at module scope would mean every build
// needs real Firebase Admin credentials just to compile; deferring the
// actual SDK setup until first use means it only ever runs at request time,
// when real env vars are guaranteed to be present.
let app: App | undefined
let dbInstance: Firestore | undefined
let authInstance: Auth | undefined

function getAdminApp(): App {
  if (app) return app

  const existing = getApps()
  if (existing.length) {
    app = existing[0]
    return app
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing Firebase Admin credentials: FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY'
    )
  }

  app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })
  return app
}

function getDb(): Firestore {
  if (!dbInstance) dbInstance = getFirestore(getAdminApp())
  return dbInstance
}

function getAdminAuthInstance(): Auth {
  if (!authInstance) authInstance = getAuth(getAdminApp())
  return authInstance
}

function lazyProxy<T extends object>(getInstance: () => T): T {
  return new Proxy({} as T, {
    get(_target, prop, receiver) {
      const instance = getInstance()
      const value = Reflect.get(instance as object, prop, receiver)
      return typeof value === 'function' ? value.bind(instance) : value
    },
  })
}

export const adminDb: Firestore = lazyProxy(getDb)
export const adminAuth: Auth = lazyProxy(getAdminAuthInstance)
