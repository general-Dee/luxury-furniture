import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Product ID required' }, { status: 400 })

  const supabase = await createClient()
  const { error } = await supabase.from('products').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}