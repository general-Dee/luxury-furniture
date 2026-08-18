import 'server-only'
import { Resend } from 'resend'

// Lazily initialized for the same reason as src/lib/firebase/admin.ts: Next
// builds this module during its data-collection pass even for force-dynamic
// routes, and Resend's constructor throws immediately if the API key is
// missing — so eagerly constructing it at module scope would require a real
// key just to compile.
let client: Resend | undefined

function getResendClient(): Resend {
  if (!client) client = new Resend(process.env.RESEND_API_KEY)
  return client
}

export const resend = {
  emails: {
    send: (...args: Parameters<Resend['emails']['send']>) => getResendClient().emails.send(...args),
  },
}

export const RESEND_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? 'Luxury Furniture <orders@example.com>'
