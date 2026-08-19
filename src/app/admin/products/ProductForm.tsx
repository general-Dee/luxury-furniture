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
    <form onSubmit={handleSubmit} className="ind-scope max-w-xl space-y-4">
      <div className="ind-field">
        <label>Name</label>
        <input
          type="text"
          value={values.name}
          onChange={(e) => setValues({ ...values, name: e.target.value })}
          required
          className="ind-input"
        />
        {mode === 'edit' && <p className="text-xs opacity-50 mt-1">Slug: {slug} (fixed)</p>}
      </div>
      <div className="ind-field">
        <label>Description</label>
        <textarea
          value={values.description}
          onChange={(e) => setValues({ ...values, description: e.target.value })}
          rows={4}
          className="ind-input"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="ind-field">
          <label>Price (₦)</label>
          <input
            type="number"
            min={0}
            value={values.price}
            onChange={(e) => setValues({ ...values, price: Number(e.target.value) })}
            required
            className="ind-input"
          />
        </div>
        <div className="ind-field">
          <label>Stock</label>
          <input
            type="number"
            min={0}
            value={values.stock}
            onChange={(e) => setValues({ ...values, stock: Number(e.target.value) })}
            required
            className="ind-input"
          />
        </div>
      </div>
      <div className="ind-field">
        <label>Category</label>
        <select
          value={values.categorySlug}
          onChange={(e) => setValues({ ...values, categorySlug: e.target.value })}
          required
          className="ind-input"
        >
          <option value="">-- Select category --</option>
          {categories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>{cat.name}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-6">
        <label className="ind-radio">
          <input
            type="checkbox"
            checked={values.isSale}
            onChange={(e) => setValues({ ...values, isSale: e.target.checked })}
          />
          <span className="ind-dot" />
          On sale
        </label>
        <label className="ind-radio">
          <input
            type="checkbox"
            checked={values.isActive}
            onChange={(e) => setValues({ ...values, isActive: e.target.checked })}
          />
          <span className="ind-dot" />
          Active (visible on storefront)
        </label>
      </div>
      <div className="ind-field">
        <label>Images</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {values.images.map((url, idx) => (
            <div key={idx} className="relative w-20 h-20 border border-[var(--ind-color-divider)] overflow-hidden">
              <Image src={url} alt="Product" fill className="object-cover" />
              <button type="button" onClick={() => removeImage(idx)} className="absolute top-0 right-0 bg-red-500 text-white p-0.5">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <label className="flex flex-col items-center justify-center w-20 h-20 border border-dashed border-[var(--ind-color-divider)] cursor-pointer hover:bg-[var(--ind-color-surface)]">
            {uploading ? (
              <div className="w-4 h-4 border-2 border-[var(--ind-color-divider)] border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="text-xs opacity-50">+ Add</span>
            )}
            <input type="file" multiple accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
          </label>
        </div>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button type="submit" disabled={saving} className="ind-btn ind-btn-primary">
        {saving ? 'Saving...' : mode === 'create' ? 'Create product' : 'Save changes'}
      </button>
    </form>
  )
}
