'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('subscribers').select('*').order('subscribed_at', { ascending: false })
      setSubscribers(data || [])
    }
    fetch()
  }, [])

  const exportCSV = () => {
    const headers = ['Email', 'Subscribed At', 'Status']
    const rows = subscribers.map(s => [s.email, new Date(s.subscribed_at).toLocaleString(), s.is_active ? 'Active' : 'Inactive'])
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `subscribers-${new Date().toISOString()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container-luxury py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif">Newsletter Subscribers</h1>
        <button onClick={exportCSV} className="btn-secondary">Export CSV</button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subscribed At</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map(sub => (
              <tr key={sub.id}>
                <td className="px-6 py-4">{sub.email}</td>
                <td className="px-6 py-4">{new Date(sub.subscribed_at).toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${sub.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {sub.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}