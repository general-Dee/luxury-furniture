'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

type Order = {
  id: string
  created_at: string
  total_amount: number
  status: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const supabase = createClient()

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('id, created_at, total_amount, status')
        .order('created_at', { ascending: false })
      if (data) setOrders(data)
    }
    fetchOrders()
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-serif mb-8">My Orders</h1>
      {orders.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">₦{order.total_amount.toLocaleString()}</p>
                <p className={`text-sm ${order.status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
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