import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerUser } from '@/lib/firebase/session'
import AddressManager from '@/components/AddressManager'

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const user = await getServerUser()
  if (!user) redirect('/login')

  return (
    <div className="ind-scope max-w-[900px] mx-auto px-6 py-12">
      <h1 className="uppercase text-3xl mb-8">My account</h1>
      <div className="ind-card ind-blueprint relative mb-8">
        <i className="ind-corner tl" />
        <i className="ind-corner tr" />
        <i className="ind-corner bl" />
        <i className="ind-corner br" />
        <h2 className="ind-card-title text-xl">Profile info</h2>
        <p className="opacity-80">Email: {user.email}</p>
        <div className="flex gap-3 mt-2">
          <Link href="/wishlist" className="ind-btn ind-btn-secondary">View wishlist</Link>
          <Link href="/orders" className="ind-btn ind-btn-secondary">View orders</Link>
        </div>
      </div>
      <AddressManager />
    </div>
  )
}
