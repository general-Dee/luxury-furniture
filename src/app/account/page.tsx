import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AddressManager from '@/components/AddressManager'

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="container-luxury py-12 max-w-4xl mx-auto">
      <h1 className="text-3xl font-serif mb-8">My Account</h1>
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-2">Profile Info</h2>
        <p>Email: {user.email}</p>
        {/* Add name update later */}
      </div>
      <AddressManager />
    </div>
  )
}