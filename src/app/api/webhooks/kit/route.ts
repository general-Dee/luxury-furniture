import { NextRequest, NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { adminDb } from '@/lib/firebase/admin'

export async function POST(req: NextRequest) {
  try {
    const event = await req.json()

    if (event.type === 'subscriber.subscriber_activate') {
      const email: string | undefined = event.data?.email_address
      if (email) {
        const docId = email.toLowerCase()
        await adminDb.collection('subscribers').doc(docId).set(
          {
            email: docId,
            isActive: true,
            subscribedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        )
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
