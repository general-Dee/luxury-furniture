import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { requireAdmin } from '@/lib/firebase/session'

export async function DELETE(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { slug } = await params

  const inUse = await adminDb.collection('products').where('categorySlug', '==', slug).limit(1).get()
  if (!inUse.empty) {
    return NextResponse.json({ error: 'Category is still in use by products' }, { status: 409 })
  }

  await adminDb.collection('categories').doc(slug).delete()
  return NextResponse.json({ ok: true })
}
