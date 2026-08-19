'use client'
import { useState, useEffect } from 'react'
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '@/lib/firebase/client'

type Address = {
  id: string
  fullName: string
  phone: string
  address: string
  city: string
  state: string
  isDefault: boolean
}

const emptyForm = { fullName: '', phone: '', address: '', city: '', state: '' }

export default function AddressManager() {
  const [uid, setUid] = useState<string | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState(emptyForm)

  const fetchAddresses = async (userId: string) => {
    setLoading(true)
    const snapshot = await getDocs(collection(db, 'users', userId, 'addresses'))
    const list = snapshot.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<Address, 'id'>) }))
      .sort((a, b) => Number(b.isDefault) - Number(a.isDefault))
    setAddresses(list)
    setLoading(false)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid ?? null)
      if (user) fetchAddresses(user.uid)
      else setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uid) return

    if (editingId) {
      await updateDoc(doc(db, 'users', uid, 'addresses', editingId), formData)
    } else {
      const isFirst = addresses.length === 0
      await addDoc(collection(db, 'users', uid, 'addresses'), {
        ...formData,
        isDefault: isFirst,
        createdAt: serverTimestamp(),
      })
    }
    setShowForm(false)
    setEditingId(null)
    setFormData(emptyForm)
    fetchAddresses(uid)
  }

  const setDefault = async (id: string) => {
    if (!uid) return
    const batch = writeBatch(db)
    addresses.forEach((addr) => {
      batch.update(doc(db, 'users', uid, 'addresses', addr.id), { isDefault: addr.id === id })
    })
    await batch.commit()
    fetchAddresses(uid)
  }

  const deleteAddress = async (id: string) => {
    if (!uid) return
    if (confirm('Delete this address?')) {
      await deleteDoc(doc(db, 'users', uid, 'addresses', id))
      fetchAddresses(uid)
    }
  }

  const editAddress = (addr: Address) => {
    setFormData({
      fullName: addr.fullName,
      phone: addr.phone,
      address: addr.address,
      city: addr.city,
      state: addr.state,
    })
    setEditingId(addr.id)
    setShowForm(true)
  }

  if (loading) return <div className="ind-scope opacity-60">Loading addresses...</div>

  return (
    <div className="ind-scope ind-card ind-blueprint relative space-y-6">
      <i className="ind-corner tl" />
      <i className="ind-corner tr" />
      <i className="ind-corner bl" />
      <i className="ind-corner br" />
      <div className="flex justify-between items-center">
        <h2 className="ind-card-title text-xl">Saved addresses</h2>
        <button onClick={() => { setShowForm(true); setEditingId(null); setFormData(emptyForm) }} className="ind-btn ind-btn-secondary">
          + Add address
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="ind-plate relative space-y-3 !p-4">
          <i className="ind-corner ind-plate-corner tl" />
          <i className="ind-corner ind-plate-corner tr" />
          <i className="ind-corner ind-plate-corner bl" />
          <i className="ind-corner ind-plate-corner br" />
          <input type="text" placeholder="Full name" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} required className="ind-input" />
          <input type="tel" placeholder="Phone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required className="ind-input" />
          <input type="text" placeholder="Address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} required className="ind-input" />
          <input type="text" placeholder="City" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} required className="ind-input" />
          <input type="text" placeholder="State" value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} required className="ind-input" />
          <div className="flex gap-2">
            <button type="submit" className="ind-btn ind-btn-primary">Save</button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null) }} className="ind-btn ind-btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      {addresses.length === 0 && !showForm && (
        <p className="opacity-60">No addresses saved yet.</p>
      )}

      <div className="space-y-3">
        {addresses.map(addr => (
          <div key={addr.id} className="ind-blueprint relative !p-4">
            <i className="ind-corner tl" />
            <i className="ind-corner tr" />
            <i className="ind-corner bl" />
            <i className="ind-corner br" />
            {addr.isDefault && <span className="ind-tag ind-tag-accent absolute top-2 right-2">Default</span>}
            <p className="font-medium">{addr.fullName}</p>
            <p className="text-sm opacity-70">{addr.phone}</p>
            <p className="text-sm opacity-70">{addr.address}, {addr.city}, {addr.state}</p>
            <div className="flex gap-4 mt-3">
              {!addr.isDefault && <button onClick={() => setDefault(addr.id)} className="text-xs text-[var(--ind-color-accent)] hover:underline">Set as default</button>}
              <button onClick={() => editAddress(addr)} className="text-xs opacity-70 hover:opacity-100">Edit</button>
              <button onClick={() => deleteAddress(addr.id)} className="text-xs text-red-600 hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
