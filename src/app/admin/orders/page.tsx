import Link from 'next/link'
import { adminDb } from '@/lib/firebase/admin'

const STATUS_FILTERS = ['pending', 'paid', 'failed', 'cancelled'] as const

const STATUS_TAG: Record<string, string> = {
  pending: 'ind-tag-outline',
  paid: 'ind-tag-accent',
  failed: 'ind-tag-neutral',
  cancelled: 'ind-tag-neutral',
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
        <h2 className="uppercase text-xl m-0">Orders</h2>
        <div className="ind-seg">
          <Link href="/admin/orders" className={`ind-seg-opt ${!status ? 'ind-seg-opt-active' : ''}`}>
            All
          </Link>
          {STATUS_FILTERS.map((s) => (
            <Link
              key={s}
              href={`/admin/orders?status=${s}`}
              className={`ind-seg-opt ${status === s ? 'ind-seg-opt-active' : ''}`}
            >
              {s[0].toUpperCase() + s.slice(1)}
            </Link>
          ))}
        </div>
      </div>
      {orders.length === 0 ? (
        <div className="ind-plate relative text-center p-6">
          <i className="ind-corner ind-plate-corner tl" />
          <i className="ind-corner ind-plate-corner tr" />
          <i className="ind-corner ind-plate-corner bl" />
          <i className="ind-corner ind-plate-corner br" />
          <p className="opacity-60">No orders yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/admin/orders/${order.id}`}
              className="ind-card ind-blueprint relative flex-row justify-between items-center hover:!border-[var(--ind-color-accent)] transition"
            >
              <i className="ind-corner tl" />
              <i className="ind-corner tr" />
              <i className="ind-corner bl" />
              <i className="ind-corner br" />
              <div>
                <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                <p className="text-sm opacity-60">
                  {order.email} · {order.itemCount} item{order.itemCount === 1 ? '' : 's'}
                  {order.createdAt && ` · ${new Date(order.createdAt).toLocaleDateString()}`}
                </p>
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <p className="font-semibold">₦{order.totalAmount.toLocaleString()}</p>
                <span className={`ind-tag ${STATUS_TAG[order.status] ?? 'ind-tag-neutral'}`}>
                  {order.status.toUpperCase()}
                  {order.status === 'paid' && ` · ${FULFILLMENT_LABEL[order.fulfillmentStatus]}`}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
