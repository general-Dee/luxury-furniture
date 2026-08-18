import { NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { adminDb } from '@/lib/firebase/admin'
import { requireAdmin } from '@/lib/firebase/session'

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { slug } = await params
  const body = await request.json()
  const { name, description, price, stock, images, categorySlug, isSale, isActive } = body as {
    name?: string
    description?: string
    price?: number
    stock?: number
    images?: string[]
    categorySlug?: string
    isSale?: boolean
    isActive?: boolean
  }

  const productRef = adminDb.collection('products').doc(slug)
  const productSnap = await productRef.get()
  if (!productSnap.exists) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  const update: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() }
  if (name !== undefined) {
    update.name = name
    update.nameLower = name.toLowerCase()
  }
  if (description !== undefined) update.description = description
  if (typeof price === 'number') update.price = price
  if (typeof stock === 'number') update.stock = stock
  if (Array.isArray(images)) update.images = images
  if (isSale !== undefined) update.isSale = Boolean(isSale)
  if (isActive !== undefined) update.isActive = Boolean(isActive)

  if (categorySlug !== undefined) {
    const categorySnap = await adminDb.collection('categories').doc(categorySlug).get()
    if (!categorySnap.exists) {
      return NextResponse.json({ error: 'Category not found' }, { status: 400 })
    }
    update.categorySlug = categorySlug
    update.categoryName = categorySnap.data()!.name
  }

  await productRef.update(update)
  return NextResponse.json({ ok: true })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { slug } = await params
  await adminDb.collection('products').doc(slug).delete()
  return NextResponse.json({ ok: true })
}
