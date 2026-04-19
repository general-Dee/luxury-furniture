import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !product) notFound()

  const { data: categories } = await supabase.from('categories').select('id, name')

  const updateProduct = async (formData: FormData) => {
    'use server'
    const supabase = await createClient()
    const name = formData.get('name') as string
    const slug = formData.get('slug') as string || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string)
    const stock = parseInt(formData.get('stock') as string)
    const images = (formData.get('images') as string).split(',').map(s => s.trim()).filter(Boolean)
    const categoryId = formData.get('categoryId') as string || null

    const { error } = await supabase
      .from('products')
      .update({ name, slug, description, price, stock, images, category_id: categoryId })
      .eq('id', id)

    if (error) throw new Error(error.message)
    redirect('/admin/products')
  }

  return (
    <div className="container-luxury py-12 max-w-3xl mx-auto">
      <h1 className="text-3xl font-serif mb-8">Edit Product</h1>
      <form action={updateProduct} className="space-y-6 bg-white p-6 rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium mb-1">Name *</label>
          <input type="text" name="name" defaultValue={product.name} required className="w-full border rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Slug (URL)</label>
          <input type="text" name="slug" defaultValue={product.slug || ''} className="w-full border rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea name="description" rows={4} defaultValue={product.description || ''} className="w-full border rounded-md px-3 py-2" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Price (?) *</label>
            <input type="number" name="price" defaultValue={product.price} required className="w-full border rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Stock *</label>
            <input type="number" name="stock" defaultValue={product.stock} required className="w-full border rounded-md px-3 py-2" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Images (comma-separated URLs)</label>
          <input type="text" name="images" defaultValue={product.images?.join(', ') || ''} className="w-full border rounded-md px-3 py-2" />
          {product.images?.[0] && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1">Preview:</p>
              <div className="relative w-32 h-32 rounded border overflow-hidden bg-gray-50">
                <Image src={product.images[0]} alt="Preview" fill className="object-cover" unoptimized />
              </div>
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select name="categoryId" defaultValue={product.category_id || ''} className="w-full border rounded-md px-3 py-2">
            <option value="">Select category</option>
            {categories?.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-4">
          <button type="submit" className="btn-primary">Update Product</button>
          <Link href="/admin/products" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
