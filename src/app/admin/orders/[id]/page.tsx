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
        <h2 className="uppercase text-xl m-0">Order #{id.slice(0, 8)}</h2>
        <OrderStatusActions orderId={id} status={status} fulfillmentStatus={fulfillmentStatus} />
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="ind-card ind-blueprint relative">
          <i className="ind-corner tl" />
          <i className="ind-corner tr" />
          <i className="ind-corner bl" />
          <i className="ind-corner br" />
          <h3 className="ind-card-title text-base">Customer</h3>
          <p className="text-sm opacity-70">{data.email as string}</p>
          <p className="text-sm opacity-70">{data.phone as string}</p>
        </div>
        <div className="ind-card ind-blueprint relative">
          <i className="ind-corner tl" />
          <i className="ind-corner tr" />
          <i className="ind-corner bl" />
          <i className="ind-corner br" />
          <h3 className="ind-card-title text-base">Shipping address</h3>
          <p className="text-sm opacity-70">{data.address as string}</p>
          <p className="text-sm opacity-70">
            {data.city as string}, {data.state as string}
          </p>
        </div>
      </div>

      <div className="ind-plate relative mb-6">
        <i className="ind-corner ind-plate-corner tl" />
        <i className="ind-corner ind-plate-corner tr" />
        <i className="ind-corner ind-plate-corner bl" />
        <i className="ind-corner ind-plate-corner br" />
        <table className="ind-table !m-0">
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx}>
                <td>
                  <div className="flex items-center gap-3">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.productName}
                        width={48}
                        height={48}
                        className="w-12 h-12 object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium text-sm m-0">{item.productName}</p>
                      <p className="text-sm opacity-60 m-0">Qty: {item.quantity}</p>
                    </div>
                  </div>
                </td>
                <td className="text-right font-medium text-sm">₦{(item.price * item.quantity).toLocaleString()}</td>
              </tr>
            ))}
            <tr>
              <td className="font-semibold">Total</td>
              <td className="text-right font-semibold">₦{(data.totalAmount as number).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="ind-card ind-blueprint relative text-sm opacity-70 space-y-1">
        <i className="ind-corner tl" />
        <i className="ind-corner tr" />
        <i className="ind-corner bl" />
        <i className="ind-corner br" />
        <p>Paystack reference: {(data.paystackReference as string) ?? '—'}</p>
        <p>Created: {createdAt ?? '—'}</p>
        <p>Updated: {updatedAt ?? '—'}</p>
        <p>Paid: {paidAt ?? '—'}</p>
      </div>
    </div>
  )
}
