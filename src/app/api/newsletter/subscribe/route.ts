import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    const supabase = await createClient()
    
    // Check if email already exists
    const { data: existing } = await supabase
      .from('subscribers')
      .select('email')
      .eq('email', email)
      .single()

    if (existing) {
      // If exists but inactive, reactivate
      const { error: updateError } = await supabase
        .from('subscribers')
        .update({ is_active: true, subscribed_at: new Date().toISOString() })
        .eq('email', email)
      
      if (updateError) throw updateError
      return NextResponse.json({ message: 'Welcome back! You are now resubscribed.' })
    }

    // Insert new subscriber
    const { error } = await supabase
      .from('subscribers')
      .insert({ email })

    if (error) throw error

    return NextResponse.json({ message: 'Successfully subscribed!' })
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json({ error: 'Subscription failed' }, { status: 500 })
  }
}