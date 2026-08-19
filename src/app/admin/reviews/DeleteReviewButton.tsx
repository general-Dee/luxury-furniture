'use client'
import { useRouter } from 'next/navigation'

export default function DeleteReviewButton({ id }: { id: string }) {
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Delete this review? This cannot be undone.')) return
    const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      alert('Failed to delete review')
      return
    }
    router.refresh()
  }

  return (
    <button onClick={handleDelete} className="ind-btn ind-btn-ghost !text-red-600">
      Delete
    </button>
  )
}
