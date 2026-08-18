// One-off local script: grants the `admin` custom claim to every email in
// ADMIN_EMAILS. Run with: node scripts/bootstrap-admins.mjs
//
// Users must sign out and back in (or wait for their ID token to refresh)
// before the new claim takes effect in getServerUser()/requireAdmin().
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { cert, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)))

function loadEnvLocal() {
  const envPath = path.join(rootDir, '.env.local')
  if (!existsSync(envPath)) return
  const content = readFileSync(envPath, 'utf-8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!(key in process.env)) process.env[key] = value
  }
}

loadEnvLocal()

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')
const adminEmails = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim())
  .filter(Boolean)

if (!projectId || !clientEmail || !privateKey) {
  console.error('Missing Firebase Admin credentials in .env.local')
  process.exit(1)
}
if (adminEmails.length === 0) {
  console.error('ADMIN_EMAILS is empty in .env.local — nothing to do')
  process.exit(1)
}

initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })
const auth = getAuth()

for (const email of adminEmails) {
  try {
    const user = await auth.getUserByEmail(email)
    await auth.setCustomUserClaims(user.uid, { ...user.customClaims, admin: true })
    console.log(`Granted admin claim to ${email} (${user.uid})`)
  } catch (err) {
    console.error(`Failed to grant admin claim to ${email}:`, err.message)
  }
}
