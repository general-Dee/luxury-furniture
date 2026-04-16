import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    // Verify Paystack signature
    const signature = req.headers.get('x-paystack-signature')
    const body = await req.text()

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest('hex')

    if (signature !== hash) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(body)
    const supabase = await createClient()

    // Handle successful charge event
    if (event.event === 'charge.success') {
      const reference = event.data.reference
      const orderId = event.data.metadata?.order_id

      if (!orderId) {
        console.error('Webhook missing order_id in metadata')
        return NextResponse.json({ error: 'Missing order_id' }, { status: 400 })
      }

      // Update order status to 'paid'
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'paid' })
        .eq('id', orderId)
        .eq('paystack_reference', reference)

      if (updateError) {
        console.error('Failed to update order status:', updateError)
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
      }

      // Optional: Reduce product stock, clear cart, send email, etc.
      // You can add logic here for inventory management
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}