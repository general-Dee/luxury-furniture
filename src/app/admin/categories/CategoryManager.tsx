'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Category = { slug: string; name: string }

export default function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories)
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add category')
      setCategories((prev) => [...prev, { slug: data.slug, name }].sort((a, b) => a.name.localeCompare(b.name)))
      setName('')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add category')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (slug: string) => {
    if (!confirm('Delete this category?')) return
    const res = await fetch(`/api/admin/categories/${slug}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) {
      alert(data.error || 'Failed to delete category')
      return
    }
    setCategories((prev) => prev.filter((c) => c.slug !== slug))
    router.refresh()
  }

  return (
    <div className="max-w-md space-y-6">
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
          required
          className="flex-1 border rounded px-3 py-2"
        />
        <button type="submit" disabled={loading} className="bg-luxury-charcoal text-white px-4 py-2 rounded disabled:opacity-50">
          Add
        </button>
      </form>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <ul className="space-y-2">
        {categories.map((cat) => (
          <li key={cat.slug} className="flex justify-between items-center border rounded px-3 py-2">
            <span>{cat.name}</span>
            <button onClick={() => handleDelete(cat.slug)} className="text-xs text-red-600">Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
