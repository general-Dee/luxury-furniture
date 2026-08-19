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
    <div className="ind-scope space-y-6" style={{ maxWidth: '420px' }}>
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
          required
          className="ind-input flex-1"
        />
        <button type="submit" disabled={loading} className="ind-btn ind-btn-primary">
          Add
        </button>
      </form>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <ul className="space-y-2 list-none m-0 p-0">
        {categories.map((cat) => (
          <li key={cat.slug} className="ind-card flex-row justify-between items-center">
            <span>{cat.name}</span>
            <button onClick={() => handleDelete(cat.slug)} className="ind-btn ind-btn-ghost">Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
