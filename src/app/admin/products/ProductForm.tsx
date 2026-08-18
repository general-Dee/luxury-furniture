'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { X } from 'lucide-react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'
import { uploadToCloudinary } from '@/lib/cloudinary-upload'

type Category = { slug: string; name: string }

export type ProductFormValues = {
  name: string
  description: string
  price: number
  stock: number
  images: string[]
  categorySlug: string
  isSale: boolean
  isActive: boolean
}

const emptyValues: ProductFormValues = {
  name: '',
  description: '',
  price: 0,
  stock: 0,
  images: [],
  categorySlug: '',
  isSale: false,
  isActive: true,
}

export default function ProductForm({
  mode,
  slug,
  initialValues,
}: {
  mode: 'create' | 'edit'
  slug?: string
  initialValues?: ProductFormValues
}) {
  const [values, setValues] = useState<ProductFormValues>(initialValues ?? emptyValues)
  const [categories, setCategories] = useState<Category[]>([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    getDocs(collection(db, 'categories')).then((snap) => {
      setCategories(snap.docs.map((d) => ({ slug: d.id, name: d.data().name })))
    })
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    try {
      const urls = await Promise.all(files.map((file) => uploadToCloudinary(file, '/api/admin/cloudinary-sign')))
      setValues((v) => ({ ...v, images: [...v.images, ...urls] }))
    } catch {
      setError('Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    setValues((v) => ({ ...v, images: v.images.filter((_, i) => i !== index) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const url = mode === 'create' ? '/api/admin/products' : `/api/admin/products/${slug}`
      const method = mode === 'create' ? 'POST' : 'PATCH'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save product')
      router.push('/admin/products')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          type="text"
          value={values.name}
          onChange={(e) => setValues({ ...values, name: e.target.value })}
          required
          className="w-full border rounded px-3 py-2"
        />
        {mode === 'edit' && <p className="text-xs text-gray-400 mt-1">Slug: {slug} (fixed)</p>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={values.description}
          onChange={(e) => setValues({ ...values, description: e.target.value })}
          rows={4}
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Price (₦)</label>
          <input
            type="number"
            min={0}
            value={values.price}
            onChange={(e) => setValues({ ...values, price: Number(e.target.value) })}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Stock</label>
          <input
            type="number"
            min={0}
            value={values.stock}
            onChange={(e) => setValues({ ...values, stock: Number(e.target.value) })}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <select
          value={values.categorySlug}
          onChange={(e) => setValues({ ...values, categorySlug: e.target.value })}
          required
          className="w-full border rounded px-3 py-2"
        >
          <option value="">-- Select category --</option>
          {categories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>{cat.name}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.isSale}
            onChange={(e) => setValues({ ...values, isSale: e.target.checked })}
          />
          On Sale
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.isActive}
            onChange={(e) => setValues({ ...values, isActive: e.target.checked })}
          />
          Active (visible on storefront)
        </label>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Images</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {values.images.map((url, idx) => (
            <div key={idx} className="relative w-20 h-20 rounded border overflow-hidden">
              <Image src={url} alt="Product" fill className="object-cover" />
              <button type="button" onClick={() => removeImage(idx)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <label className="flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed rounded cursor-pointer hover:bg-gray-50">
            {uploading ? (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="text-xs text-gray-400">+ Add</span>
            )}
            <input type="file" multiple accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
          </label>
        </div>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button type="submit" disabled={saving} className="bg-luxury-charcoal text-white px-6 py-2 rounded disabled:opacity-50">
        {saving ? 'Saving...' : mode === 'create' ? 'Create Product' : 'Save Changes'}
      </button>
    </form>
  )
}
