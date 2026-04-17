import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  // HARDCODED FOR LOCAL DEVELOPMENT – REPLACE WITH YOUR ACTUAL KEYS
  const supabaseUrl = 'https://zkuyedhavjlgsmthbjyt.supabase.co'
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprdXllZGhhdmpsZ3NtdGhianl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MzMxMDUsImV4cCI6MjA4ODUwOTEwNX0.HAtOs2n06d5YygKWv2DXzpt8XDLyEHUaYMTh5EtKJ3U'

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        // set and remove intentionally omitted (handled by middleware)
      },
    }
  )
}