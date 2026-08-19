import { redirect } from 'next/navigation'
import { getServerUser } from '@/lib/firebase/session'
import { adminDb } from '@/lib/firebase/admin'

export const dynamic = 'force-dynamic'

const STATUS_TAG: Record<string, string> = {
  pending: 'ind-tag-outline',
  paid: 'ind-tag-accent',
  failed: 'ind-tag-neutral',
  cancelled: 'ind-tag-neutral',
}

export default async function OrdersPage() {
  const user = await getServerUser()
  if (!user) redirect('/login')

  const snapshot = await adminDb
    .collection('orders')
    .where('userId', '==', user.uid)
    .orderBy('createdAt', 'desc')
    .get()

  const orders = snapshot.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
      totalAmount: data.totalAmount as number,
      status: data.status as string,
    }
  })

  return (
    <div className="ind-scope max-w-[960px] mx-auto px-6 py-12">
      <h1 className="uppercase text-3xl mb-8">My orders</h1>
      {orders.length === 0 ? (
        <div className="ind-plate relative text-center" style={{ padding: 'calc(3 * var(--ind-space-8)) var(--ind-space-6)' }}>
          <i className="ind-corner ind-plate-corner tl" />
          <i className="ind-corner ind-plate-corner tr" />
          <i className="ind-corner ind-plate-corner bl" />
          <i className="ind-corner ind-plate-corner br" />
          <p className="opacity-60">You haven&apos;t placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="ind-card ind-blueprint relative flex flex-row justify-between items-center">
              <i className="ind-corner tl" />
              <i className="ind-corner tr" />
              <i className="ind-corner bl" />
              <i className="ind-corner br" />
              <div>
                <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                <p className="text-sm opacity-60">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <p className="font-semibold text-lg">₦{order.totalAmount.toLocaleString()}</p>
                <span className={`ind-tag ${STATUS_TAG[order.status] ?? 'ind-tag-neutral'}`}>
                  {order.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
