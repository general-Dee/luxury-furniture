import { NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { adminDb } from '@/lib/firebase/admin'
import { requireAdmin } from '@/lib/firebase/session'

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { name } = (await request.json()) as { name?: string }
  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  const slug = slugify(name)
  const categoryRef = adminDb.collection('categories').doc(slug)
  if ((await categoryRef.get()).exists) {
    return NextResponse.json({ error: 'A category with this name already exists' }, { status: 409 })
  }

  await categoryRef.set({ name, createdAt: FieldValue.serverTimestamp() })
  return NextResponse.json({ slug })
}
