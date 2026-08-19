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
        <h2 className="uppercase text-xl m-0">Products</h2>
        <Link href="/admin/products/new" className="ind-btn ind-btn-primary">
          + New product
        </Link>
      </div>
      {products.length === 0 ? (
        <div className="ind-plate relative text-center p-6">
          <i className="ind-corner ind-plate-corner tl" />
          <i className="ind-corner ind-plate-corner tr" />
          <i className="ind-corner ind-plate-corner bl" />
          <i className="ind-corner ind-plate-corner br" />
          <p className="opacity-60">No products yet.</p>
        </div>
      ) : (
        <table className="ind-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.slug}>
                <td>{product.name}</td>
                <td>
                  ₦{product.price.toLocaleString()}
                  {!product.isActive && <span className="text-[var(--ind-color-accent-700)]"> · Inactive</span>}
                </td>
                <td>{product.stock}</td>
                <td className="text-right">
                  <Link href={`/admin/products/${product.slug}/edit`} className="text-[var(--ind-color-accent)] hover:underline">Edit</Link>
                  <DeleteProductButton slug={product.slug} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
