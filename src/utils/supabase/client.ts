import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = 'https://zkuyedhavjlgsmthbjyt.supabase.co'
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprdXllZGhhdmpsZ3NtdGhianl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MzMxMDUsImV4cCI6MjA4ODUwOTEwNX0.HAtOs2n06d5YygKWv2DXzpt8XDLyEHUaYMTh5EtKJ3U'

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}