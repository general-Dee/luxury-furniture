'use client'
import { useRouter } from 'next/navigation'

export default function DeleteButton({ productId }: { productId: string }) {
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Delete this product? This action cannot be undone.')) return
    const res = await fetch('/api/admin/products/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: productId })
    })
    if (res.ok) {
      router.refresh()
    } else {
      const data = await res.json()
      alert(data.error || 'Failed to delete product')
    }
  }

  return (
    <button onClick={handleDelete} className="text-red-600 hover:text-red-800 ml-2">
      Delete
    </button>
  )
}