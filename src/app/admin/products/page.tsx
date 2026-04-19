import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import DeleteButton from './DeleteButton'

export default async function AdminProductsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  
  const { data: products, error } = await supabase
    .from('products')
    .select('*, categories(name)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
    return <div className="text-red-500">Error loading products: {error.message}</div>
  }

  return (
    <div className="container-luxury py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif">Products</h1>
        <Link href="/admin/products/new" className="btn-primary">+ Add New Product</Link>
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price (₦)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No products found. Click "Add New Product" to create one.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4">
                    {product.images?.[0] ? (
                      <div className="relative w-12 h-12 rounded overflow-hidden bg-gray-100">
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
                        No img
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium">{product.name}</td>
                  <td className="px-6 py-4">{product.categories?.name || 'Uncategorized'}</td>
                  <td className="px-6 py-4">{product.price.toLocaleString()}</td>
                  <td className="px-6 py-4">{product.stock}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Link href={`/admin/products/edit/${product.id}`} className="text-blue-600 hover:text-blue-800">
                      Edit
                    </Link>
                    <DeleteButton productId={product.id} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}