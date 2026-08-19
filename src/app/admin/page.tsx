import Link from 'next/link'
import { adminDb } from '@/lib/firebase/admin'

export default async function AdminDashboard() {
  const [productsCount, categoriesCount, pendingOrdersCount, reviewsCount] = await Promise.all([
    adminDb.collection('products').count().get().then((s) => s.data().count),
    adminDb.collection('categories').count().get().then((s) => s.data().count),
    adminDb.collection('orders').where('status', '==', 'pending').count().get().then((s) => s.data().count),
    adminDb.collection('reviews').count().get().then((s) => s.data().count),
  ])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
      <Link href="/admin/products" className="border rounded-lg p-6 hover:shadow-md transition">
        <p className="text-3xl font-serif">{productsCount}</p>
        <p className="text-gray-500 text-sm mt-1">Products</p>
      </Link>
      <Link href="/admin/categories" className="border rounded-lg p-6 hover:shadow-md transition">
        <p className="text-3xl font-serif">{categoriesCount}</p>
        <p className="text-gray-500 text-sm mt-1">Categories</p>
      </Link>
      <Link href="/admin/orders?status=pending" className="border rounded-lg p-6 hover:shadow-md transition">
        <p className="text-3xl font-serif">{pendingOrdersCount}</p>
        <p className="text-gray-500 text-sm mt-1">Pending Orders</p>
      </Link>
      <Link href="/admin/reviews" className="border rounded-lg p-6 hover:shadow-md transition">
        <p className="text-3xl font-serif">{reviewsCount}</p>
        <p className="text-gray-500 text-sm mt-1">Reviews</p>
      </Link>
    </div>
  )
}
