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

  if (!name || typeof price !== 'number' || typeof stock !== 'number' || !categorySlug) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const slug = slugify(name)
  const productRef = adminDb.collection('products').doc(slug)
  if ((await productRef.get()).exists) {
    return NextResponse.json({ error: 'A product with this name already exists' }, { status: 409 })
  }

  const categorySnap = await adminDb.collection('categories').doc(categorySlug).get()
  if (!categorySnap.exists) {
    return NextResponse.json({ error: 'Category not found' }, { status: 400 })
  }

  await productRef.set({
    name,
    nameLower: name.toLowerCase(),
    description: description ?? '',
    price,
    stock,
    images: Array.isArray(images) ? images : [],
    categorySlug,
    categoryName: categorySnap.data()!.name,
    isSale: Boolean(isSale),
    isActive: isActive !== false,
    avgRating: 0,
    reviewCount: 0,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })

  return NextResponse.json({ slug })
}
