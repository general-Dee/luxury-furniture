'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'

type Category = { id: string; name: string }

export default function NewProductPage() {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [images, setImages] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('id, name')
      if (data) setCategories(data)
    }
    fetchCategories()
  }, [])

  const generateSlug = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setImages(value)
    // Extract first URL from comma-separated list for preview
    const firstUrl = value.split(',')[0]?.trim()
    setPreviewUrl(firstUrl || '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const finalSlug = slug || generateSlug(name)
    const imagesArray = images.split(',').map(img => img.trim()).filter(Boolean)

    const { error } = await supabase.from('products').insert({
      name,
      slug: finalSlug,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      images: imagesArray,
      category_id: categoryId || null,
    })

    if (error) {
      alert(error.message)
    } else {
      router.push('/admin/products')
    }
    setLoading(false)
  }

  return (
    <div className="container-luxury py-12 max-w-3xl mx-auto">
      <h1 className="text-3xl font-serif mb-8">Add New Product</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium mb-1">Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Slug (URL)</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="auto-generated from name"
            className="w-full border rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Price (₦) *</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Stock *</label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Images (comma-separated URLs)</label>
          <input
            type="text"
            value={images}
            onChange={handleImagesChange}
            placeholder="https://images.unsplash.com/..., https://..."
            className="w-full border rounded-md px-3 py-2"
          />
          {previewUrl && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1">Preview:</p>
              <div className="relative w-32 h-32 rounded border overflow-hidden bg-gray-50">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-4">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Saving...' : 'Save Product'}
          </button>
          <button type="button" onClick={() => router.push('/admin/products')} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}