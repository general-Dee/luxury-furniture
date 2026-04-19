import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  try {
    // 1. Get the event data from Kit
    const event = await req.json();

    // 2. Check if it's a subscriber activation event
    if (event.type === 'subscriber.subscriber_activate') {
      const subscriber = event.data;
      const email = subscriber.email_address;

      // 3. Add the confirmed subscriber to your Supabase 'subscribers' table
      const supabase = await createClient();
      const { error } = await supabase
        .from('subscribers')
        .upsert({ email, is_active: true, subscribed_at: new Date().toISOString() }, { onConflict: 'email' });

      if (error) {
        console.error('Failed to sync subscriber to DB:', error);
        return NextResponse.json({ error: 'Database sync failed' }, { status: 500 });
      }
    }

    // 4. Always acknowledge receipt of the webhook
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
