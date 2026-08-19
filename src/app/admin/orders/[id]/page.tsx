import { notFound } from 'next/navigation'
import Image from 'next/image'
import { adminDb } from '@/lib/firebase/admin'
import OrderStatusActions from './OrderStatusActions'

type OrderItemData = {
  productId: string
  productName: string
  quantity: number
  price: number
  image: string
}

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const snap = await adminDb.collection('orders').doc(id).get()
  if (!snap.exists) notFound()
  const data = snap.data()!

  const items = (data.items as OrderItemData[]) ?? []
  const status = data.status as string
  const fulfillmentStatus = (data.fulfillmentStatus as string) ?? 'unfulfilled'
  const createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toLocaleString() : null
  const updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate().toLocaleString() : null
  const paidAt = data.paidAt?.toDate ? data.paidAt.toDate().toLocaleString() : null

  return (
    <div className="max-w-3xl">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-serif">Order #{id.slice(0, 8)}</h2>
        <OrderStatusActions orderId={id} status={status} fulfillmentStatus={fulfillmentStatus} />
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">Customer</h3>
          <p className="text-sm text-gray-600">{data.email as string}</p>
          <p className="text-sm text-gray-600">{data.phone as string}</p>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">Shipping Address</h3>
          <p className="text-sm text-gray-600">{data.address as string}</p>
          <p className="text-sm text-gray-600">
            {data.city as string}, {data.state as string}
          </p>
        </div>
      </div>

      <div className="border rounded-lg divide-y mb-6">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.productName}
                  width={48}
                  height={48}
                  className="w-12 h-12 object-cover rounded"
                />
              )}
              <div>
                <p className="font-medium text-sm">{item.productName}</p>
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
              </div>
            </div>
            <p className="text-sm font-medium">₦{(item.price * item.quantity).toLocaleString()}</p>
          </div>
        ))}
        <div className="flex items-center justify-between px-4 py-3">
          <p className="font-medium">Total</p>
          <p className="font-bold">₦{(data.totalAmount as number).toLocaleString()}</p>
        </div>
      </div>

      <div className="border rounded-lg p-4 text-sm text-gray-600 space-y-1">
        <p>Paystack reference: {(data.paystackReference as string) ?? '—'}</p>
        <p>Created: {createdAt ?? '—'}</p>
        <p>Updated: {updatedAt ?? '—'}</p>
        <p>Paid: {paidAt ?? '—'}</p>
      </div>
    </div>
  )
}
