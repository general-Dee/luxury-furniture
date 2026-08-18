import Link from 'next/link'
import { adminDb } from '@/lib/firebase/admin'
import DeleteProductButton from './DeleteProductButton'

export default async function AdminProductsPage() {
  const snapshot = await adminDb.collection('products').orderBy('createdAt', 'desc').get()
  const products = snapshot.docs.map((d) => {
    const data = d.data()
    return {
      slug: d.id,
      name: data.name as string,
      price: data.price as number,
      stock: data.stock as number,
      isActive: Boolean(data.isActive),
    }
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-serif">Products</h2>
        <Link href="/admin/products/new" className="bg-luxury-charcoal text-white px-4 py-2 rounded text-sm">
          + New Product
        </Link>
      </div>
      <div className="border rounded-lg divide-y">
        {products.map((product) => (
          <div key={product.slug} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="font-medium">{product.name}</p>
              <p className="text-sm text-gray-500">
                ₦{product.price.toLocaleString()} · Stock: {product.stock}
                {!product.isActive && <span className="text-red-500"> · Inactive</span>}
              </p>
            </div>
            <div className="flex gap-3 text-sm">
              <Link href={`/admin/products/${product.slug}/edit`} className="text-luxury-gold">Edit</Link>
              <DeleteProductButton slug={product.slug} />
            </div>
          </div>
        ))}
        {products.length === 0 && <p className="px-4 py-6 text-gray-500 text-sm">No products yet.</p>}
      </div>
    </div>
  )
}
