'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  if (!user) return <div className="text-center py-20">Loading...</div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-serif mb-8">My Account</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <p className="mt-1">{user.email}</p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">User ID</label>
          <p className="mt-1 text-xs text-gray-500">{user.id}</p>
        </div>
        {/* You can add a form to update profile, change password, etc. */}
      </div>
    </div>
  )
}