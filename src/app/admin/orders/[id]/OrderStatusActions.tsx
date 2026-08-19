'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const FULFILLMENT_OPTIONS = [
  { value: 'unfulfilled', label: 'Unfulfilled' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
]

export default function OrderStatusActions({
  orderId,
  status,
  fulfillmentStatus,
}: {
  orderId: string
  status: string
  fulfillmentStatus: string
}) {
  const router = useRouter()
  const [fulfillment, setFulfillment] = useState(fulfillmentStatus)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function patch(body: Record<string, string>) {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Request failed')
        return
      }
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  async function handleCancel() {
    if (!confirm('Cancel this order? This cannot be undone.')) return
    await patch({ status: 'cancelled' })
  }

  async function handleFulfillmentUpdate() {
    await patch({ fulfillmentStatus: fulfillment })
  }

  if (status === 'failed' || status === 'cancelled') {
    return <p className="text-sm opacity-60">No actions available.</p>
  }

  return (
    <div className="ind-scope flex flex-col items-end gap-2">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {status === 'paid' && (
        <div className="flex items-center gap-2">
          <select
            value={fulfillment}
            onChange={(e) => setFulfillment(e.target.value)}
            className="ind-input !min-h-0 !w-auto text-sm"
          >
            {FULFILLMENT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleFulfillmentUpdate}
            disabled={saving || fulfillment === fulfillmentStatus}
            className="ind-btn ind-btn-secondary"
          >
            Update
          </button>
        </div>
      )}
      <button onClick={handleCancel} disabled={saving} className="ind-btn ind-btn-ghost !text-red-600">
        Cancel order
      </button>
    </div>
  )
}
