import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zkuyedhavjlgsmthbjyt.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprdXllZGhhdmpsZ3NtdGhianl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MzMxMDUsImV4cCI6MjA4ODUwOTEwNX0.HAtOs2n06d5YygKWv2DXzpt8XDLyEHUaYMTh5EtKJ3U'

// Singleton instance
let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null

export function createClient() {
  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseInstance
}