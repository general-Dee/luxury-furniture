'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, subscribers: 0 })

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient()
      const { count: products } = await supabase.from('products').select('*', { count: 'exact', head: true })
      const { count: orders } = await supabase.from('orders').select('*', { count: 'exact', head: true })
      const { count: subscribers } = await supabase.from('subscribers').select('*', { count: 'exact', head: true })
      setStats({ products: products || 0, orders: orders || 0, subscribers: subscribers || 0 })
    }
    fetchStats()
  }, [])

  return (
    <div className="container-luxury py-12">
      <h1 className="text-3xl font-serif mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold">Products</h2>
          <p className="text-3xl font-bold text-luxury-gold mt-2">{stats.products}</p>
          <Link href="/admin/products" className="text-sm text-luxury-charcoal hover:underline mt-2 inline-block">Manage →</Link>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold">Orders</h2>
          <p className="text-3xl font-bold text-luxury-gold mt-2">{stats.orders}</p>
          <Link href="/admin/orders" className="text-sm text-luxury-charcoal hover:underline mt-2 inline-block">View →</Link>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold">Subscribers</h2>
          <p className="text-3xl font-bold text-luxury-gold mt-2">{stats.subscribers}</p>
          <Link href="/admin/subscribers" className="text-sm text-luxury-charcoal hover:underline mt-2 inline-block">Export →</Link>
        </div>
      </div>
    </div>
  )
}