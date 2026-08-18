import { NextResponse } from 'next/server'
import { markOrderPaid } from '@/lib/orders'
import { verifyPaystackSignature } from '@/lib/paystack'

export async function POST(request: Request) {
  const signature = request.headers.get('x-paystack-signature')

  // Must read the raw body — HMAC verification needs the exact bytes Paystack signed.
  const rawBody = await request.text()

  if (!verifyPaystackSignature(rawBody, signature, process.env.PAYSTACK_SECRET_KEY)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(rawBody)

  if (event.event === 'charge.success') {
    const reference: string | undefined = event.data?.reference
    if (reference) {
      try {
        await markOrderPaid(reference)
      } catch (error) {
        console.error('Failed to process Paystack webhook:', error)
        // Still ack with 200 below — Paystack will retry on non-2xx, and
        // whatever failed here isn't likely to succeed on a blind retry.
      }
    }
  }

  return NextResponse.json({ received: true })
}
