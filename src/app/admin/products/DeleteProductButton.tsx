'use client'
import { useRouter } from 'next/navigation'

export default function DeleteProductButton({ slug }: { slug: string }) {
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Delete this product? This cannot be undone.')) return
    const res = await fetch(`/api/admin/products/${slug}`, { method: 'DELETE' })
    if (!res.ok) {
      alert('Failed to delete product')
      return
    }
    router.refresh()
  }

  return (
    <button onClick={handleDelete} className="text-red-600">
      Delete
    </button>
  )
}
