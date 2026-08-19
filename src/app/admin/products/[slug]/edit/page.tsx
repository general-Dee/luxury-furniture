import { notFound } from 'next/navigation'
import { adminDb } from '@/lib/firebase/admin'
import ProductForm from '../../ProductForm'

export default async function EditProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const snap = await adminDb.collection('products').doc(slug).get()
  if (!snap.exists) notFound()
  const data = snap.data()!

  return (
    <div>
      <h2 className="ind-scope uppercase text-xl mb-6">Edit product</h2>
      <ProductForm
        mode="edit"
        slug={slug}
        initialValues={{
          name: data.name,
          description: data.description ?? '',
          price: data.price,
          stock: data.stock,
          images: data.images ?? [],
          categorySlug: data.categorySlug,
          isSale: Boolean(data.isSale),
          isActive: data.isActive !== false,
        }}
      />
    </div>
  )
}
