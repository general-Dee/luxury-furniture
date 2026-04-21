'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

type Address = {
  id: string
  full_name: string
  phone: string
  address: string
  city: string
  state: string
  is_default: boolean
}

export default function AddressManager() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
  })
  const supabase = createClient()

  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    // @ts-ignore
    const { data } = await supabase
      .from('addresses')
      .select('*')
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })
    setAddresses(data || [])
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (editingId) {
      // @ts-ignore
      await supabase
        .from('addresses')
        .update(formData)
        .eq('id', editingId)
    } else {
      const isFirst = addresses.length === 0
      // @ts-ignore
      await supabase
        .from('addresses')
        .insert({
          user_id: user.id,
          is_default: isFirst,
          ...formData,
        })
    }
    setShowForm(false)
    setEditingId(null)
    setFormData({ full_name: '', phone: '', address: '', city: '', state: '' })
    fetchAddresses()
  }

  const setDefault = async (id: string) => {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) return
    // @ts-ignore
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', userId)
    // @ts-ignore
    await supabase
      .from('addresses')
      .update({ is_default: true })
      .eq('id', id)
    fetchAddresses()
  }

  const deleteAddress = async (id: string) => {
    if (confirm('Delete this address?')) {
      // @ts-ignore
      await supabase.from('addresses').delete().eq('id', id)
      fetchAddresses()
    }
  }

  const editAddress = (addr: Address) => {
    setFormData({
      full_name: addr.full_name,
      phone: addr.phone,
      address: addr.address,
      city: addr.city,
      state: addr.state,
    })
    setEditingId(addr.id)
    setShowForm(true)
  }

  if (loading) return <div>Loading addresses...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-serif">Saved Addresses</h2>
        <button onClick={() => { setShowForm(true); setEditingId(null); setFormData({ full_name: '', phone: '', address: '', city: '', state: '' }) }} className="text-sm text-luxury-gold hover:underline">
          + Add New
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg space-y-3">
          <input type="text" placeholder="Full name" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} required className="w-full border rounded px-3 py-2" />
          <input type="tel" placeholder="Phone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required className="w-full border rounded px-3 py-2" />
          <input type="text" placeholder="Address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} required className="w-full border rounded px-3 py-2" />
          <input type="text" placeholder="City" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} required className="w-full border rounded px-3 py-2" />
          <input type="text" placeholder="State" value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} required className="w-full border rounded px-3 py-2" />
          <div className="flex gap-2">
            <button type="submit" className="bg-luxury-charcoal text-white px-4 py-2 rounded">Save</button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null) }} className="border px-4 py-2 rounded">Cancel</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {addresses.map(addr => (
          <div key={addr.id} className="border rounded-lg p-4 relative">
            {addr.is_default && <span className="absolute top-2 right-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Default</span>}
            <p className="font-medium">{addr.full_name}</p>
            <p className="text-sm text-gray-600">{addr.phone}</p>
            <p className="text-sm text-gray-600">{addr.address}, {addr.city}, {addr.state}</p>
            <div className="flex gap-3 mt-2">
              {!addr.is_default && <button onClick={() => setDefault(addr.id)} className="text-xs text-blue-600">Set as default</button>}
              <button onClick={() => editAddress(addr)} className="text-xs text-gray-600">Edit</button>
              <button onClick={() => deleteAddress(addr.id)} className="text-xs text-red-600">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}