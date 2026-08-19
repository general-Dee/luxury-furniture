import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerUser } from '@/lib/firebase/session'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser()
  if (!user) redirect('/login?redirectTo=/admin')
  if (!user.admin) redirect('/')

  return (
    <div className="container-luxury py-12">
      <div className="flex items-center gap-6 mb-8 border-b pb-4">
        <h1 className="text-2xl font-serif">Admin</h1>
        <nav className="flex gap-4 text-sm">
          <Link href="/admin" className="text-gray-600 hover:text-luxury-gold">Dashboard</Link>
          <Link href="/admin/products" className="text-gray-600 hover:text-luxury-gold">Products</Link>
          <Link href="/admin/categories" className="text-gray-600 hover:text-luxury-gold">Categories</Link>
          <Link href="/admin/orders" className="text-gray-600 hover:text-luxury-gold">Orders</Link>
          <Link href="/admin/reviews" className="text-gray-600 hover:text-luxury-gold">Reviews</Link>
        </nav>
      </div>
      {children}
    </div>
  )
}
