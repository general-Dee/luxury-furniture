import Link from 'next/link'
import { adminDb } from '@/lib/firebase/admin'

const STATUS_FILTERS = ['pending', 'paid', 'failed', 'cancelled'] as const

const STATUS_COLOR: Record<string, string> = {
  pending: 'text-yellow-600',
  paid: 'text-green-600',
  failed: 'text-red-600',
  cancelled: 'text-gray-500',
}

const FULFILLMENT_LABEL: Record<string, string> = {
  unfulfilled: 'Unfulfilled',
  shipped: 'Shipped',
  delivered: 'Delivered',
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams

  let query = adminDb.collection('orders').orderBy('createdAt', 'desc').limit(100) as FirebaseFirestore.Query
  if (status && (STATUS_FILTERS as readonly string[]).includes(status)) {
    query = adminDb.collection('orders').where('status', '==', status).orderBy('createdAt', 'desc').limit(100)
  }

  const snapshot = await query.get()
  const orders = snapshot.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      email: data.email as string,
      itemCount: ((data.items as unknown[]) ?? []).length,
      totalAmount: data.totalAmount as number,
      status: data.status as string,
      fulfillmentStatus: (data.fulfillmentStatus as string) ?? 'unfulfilled',
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : null,
    }
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-serif">Orders</h2>
        <div className="flex gap-3 text-sm">
          <Link href="/admin/orders" className={!status ? 'font-medium text-luxury-gold' : 'text-gray-500'}>
            All
          </Link>
          {STATUS_FILTERS.map((s) => (
            <Link
              key={s}
              href={`/admin/orders?status=${s}`}
              className={status === s ? 'font-medium text-luxury-gold' : 'text-gray-500'}
            >
              {s[0].toUpperCase() + s.slice(1)}
            </Link>
          ))}
        </div>
      </div>
      <div className="border rounded-lg divide-y">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/admin/orders/${order.id}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
          >
            <div>
              <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
              <p className="text-sm text-gray-500">
                {order.email} · {order.itemCount} item{order.itemCount === 1 ? '' : 's'}
                {order.createdAt && ` · ${new Date(order.createdAt).toLocaleDateString()}`}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium">₦{order.totalAmount.toLocaleString()}</p>
              <p className={`text-sm ${STATUS_COLOR[order.status] ?? 'text-gray-500'}`}>
                {order.status.toUpperCase()}
                {order.status === 'paid' && ` · ${FULFILLMENT_LABEL[order.fulfillmentStatus]}`}
              </p>
            </div>
          </Link>
        ))}
        {orders.length === 0 && <p className="px-4 py-6 text-gray-500 text-sm">No orders yet.</p>}
      </div>
    </div>
  )
}
