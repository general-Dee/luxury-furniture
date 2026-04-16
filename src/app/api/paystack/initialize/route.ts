import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { email, amount, orderId, metadata } = await req.json()

    // Validate required fields
    if (!email || !amount || !orderId) {
      return NextResponse.json(
        { error: 'Missing required fields: email, amount, or orderId' },
        { status: 400 }
      )
    }

    // Get current user if logged in (optional)
    const { data: { user } } = await supabase.auth.getUser()

    // Initialize payment with Paystack
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: Math.round(amount * 100), // Convert to kobo and ensure integer
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/verify?order_id=${orderId}`,
        metadata: {
          ...metadata,
          order_id: orderId,
          user_id: user?.id || null,
        },
      }),
    })

    const data = await response.json()

    if (!data.status) {
      console.error('Paystack initialization failed:', data.message)
      return NextResponse.json(
        { error: data.message || 'Payment initialization failed' },
        { status: 400 }
      )
    }

    // Update order with Paystack reference
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        paystack_reference: data.data.reference,
        paystack_access_code: data.data.access_code,
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('Failed to update order with Paystack reference:', updateError)
      // Still return the authorization URL – the order can be updated later
    }

    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      reference: data.data.reference,
    })
  } catch (error) {
    console.error('Unexpected error in /api/paystack/initialize:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}