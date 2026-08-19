import { redirect } from 'next/navigation'
import { getServerUser } from '@/lib/firebase/session'
import { adminDb } from '@/lib/firebase/admin'

export const dynamic = 'force-dynamic'

const STATUS_COLOR: Record<string, string> = {
  pending: 'text-yellow-600',
  paid: 'text-green-600',
  failed: 'text-red-600',
  cancelled: 'text-gray-500',
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
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-serif mb-8">My Orders</h1>
      {orders.length === 0 ? (
        <p>You haven&apos;t placed any orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">₦{order.totalAmount.toLocaleString()}</p>
                <p className={`text-sm ${STATUS_COLOR[order.status] ?? 'text-gray-500'}`}>
                  {order.status.toUpperCase()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
