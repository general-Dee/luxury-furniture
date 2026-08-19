import { adminDb } from '@/lib/firebase/admin'
import CategoryManager from './CategoryManager'

export default async function AdminCategoriesPage() {
  const snapshot = await adminDb.collection('categories').orderBy('name').get()
  const categories = snapshot.docs.map((d) => ({ slug: d.id, name: d.data().name as string }))

  return (
    <div>
      <h2 className="ind-scope uppercase text-xl mb-6">Categories</h2>
      <CategoryManager initialCategories={categories} />
    </div>
  )
}
