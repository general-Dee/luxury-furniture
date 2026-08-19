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
      <Link href="/admin/products" className="ind-card ind-blueprint relative hover:!border-[var(--ind-color-accent)] transition">
        <i className="ind-corner tl" />
        <i className="ind-corner tr" />
        <i className="ind-corner bl" />
        <i className="ind-corner br" />
        <p style={{ fontFamily: 'var(--ind-font-heading)', fontSize: '32px' }} className="m-0">{productsCount}</p>
        <p className="opacity-70 text-sm mt-1">Products</p>
      </Link>
      <Link href="/admin/categories" className="ind-card ind-blueprint relative hover:!border-[var(--ind-color-accent)] transition">
        <i className="ind-corner tl" />
        <i className="ind-corner tr" />
        <i className="ind-corner bl" />
        <i className="ind-corner br" />
        <p style={{ fontFamily: 'var(--ind-font-heading)', fontSize: '32px' }} className="m-0">{categoriesCount}</p>
        <p className="opacity-70 text-sm mt-1">Categories</p>
      </Link>
      <Link href="/admin/orders?status=pending" className="ind-card ind-blueprint relative hover:!border-[var(--ind-color-accent)] transition">
        <i className="ind-corner tl" />
        <i className="ind-corner tr" />
        <i className="ind-corner bl" />
        <i className="ind-corner br" />
        <p style={{ fontFamily: 'var(--ind-font-heading)', fontSize: '32px' }} className="m-0">{pendingOrdersCount}</p>
        <p className="opacity-70 text-sm mt-1">Pending orders</p>
      </Link>
      <Link href="/admin/reviews" className="ind-card ind-blueprint relative hover:!border-[var(--ind-color-accent)] transition">
        <i className="ind-corner tl" />
        <i className="ind-corner tr" />
        <i className="ind-corner bl" />
        <i className="ind-corner br" />
        <p style={{ fontFamily: 'var(--ind-font-heading)', fontSize: '32px' }} className="m-0">{reviewsCount}</p>
        <p className="opacity-70 text-sm mt-1">Reviews</p>
      </Link>
    </div>
  )
}
