import { redirect } from 'next/navigation'
import { getServerUser } from '@/lib/firebase/session'
import AdminNav from '@/components/AdminNav'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser()
  if (!user) redirect('/login?redirectTo=/admin')
  if (!user.admin) redirect('/')

  return (
    <div className="ind-scope max-w-7xl mx-auto px-6 py-12">
      <AdminNav />
      {children}
    </div>
  )
}
