import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'

const DEFAULT_LIMIT = 12

function serializeProduct(doc: FirebaseFirestore.QueryDocumentSnapshot) {
  const data = doc.data()
  return {
    id: doc.id,
    slug: doc.id,
    name: data.name,
    description: data.description ?? '',
    price: data.price,
    stock: data.stock,
    images: data.images ?? [],
    isSale: Boolean(data.isSale),
    categories: data.categorySlug
      ? { name: data.categoryName, slug: data.categorySlug }
      : null,
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const limit = Math.min(parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT, 50)
  const category = searchParams.get('category')
  const search = searchParams.get('search')?.trim().toLowerCase()
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const sort = searchParams.get('sort')
  const inStock = searchParams.get('inStock') === 'true'
  const sale = searchParams.get('sale') === 'true'
  const cursor = searchParams.get('cursor')

  try {
    let query: FirebaseFirestore.Query = adminDb.collection('products').where('isActive', '==', true)

    if (sale) query = query.where('isSale', '==', true)
    if (category && category !== 'all') query = query.where('categorySlug', '==', category)

    const hasPriceFilter = Boolean(minPrice || maxPrice)
    const wantsPriceSort = sort === 'price_asc' || sort === 'price_desc'

    // Firestore allows a range/inequality filter on at most one field per
    // query, and that field must also be the first orderBy — so search
    // (range on nameLower), price filtering/sorting (range on price), and
    // in-stock-only (range on stock) can't all be expressed in one query at
    // once. Pick a single range field by priority and apply whichever of the
    // others is left over as an in-memory post-filter on the fetched page —
    // a fine tradeoff for a catalog this size.
    let rangeField: 'nameLower' | 'price' | 'stock' | 'createdAt' = 'createdAt'
    if (search) rangeField = 'nameLower'
    else if (hasPriceFilter || wantsPriceSort) rangeField = 'price'
    else if (inStock) rangeField = 'stock'

    if (rangeField === 'nameLower') {
      // The high private-use codepoint sorts after any realistic name character.
      const prefixEnd = search + String.fromCharCode(0xf8ff)
      query = query.orderBy('nameLower').startAt(search).endAt(prefixEnd)
    } else if (rangeField === 'price') {
      const direction = sort === 'price_desc' ? 'desc' : 'asc'
      query = query.orderBy('price', direction)
      if (minPrice && !isNaN(parseFloat(minPrice))) query = query.where('price', '>=', parseFloat(minPrice))
      if (maxPrice && !isNaN(parseFloat(maxPrice))) query = query.where('price', '<=', parseFloat(maxPrice))
    } else if (rangeField === 'stock') {
      query = query.orderBy('stock').where('stock', '>', 0)
    } else {
      query = query.orderBy('createdAt', 'desc')
    }

    if (cursor) {
      const cursorDoc = await adminDb.collection('products').doc(cursor).get()
      if (cursorDoc.exists) query = query.startAfter(cursorDoc)
    }

    // Fetch one extra to know if there's a next page without a separate count query.
    const snapshot = await query.limit(limit + 1).get()
    let docs = snapshot.docs.slice(0, limit)
    const hasMore = snapshot.docs.length > limit

    // Apply the range filter that couldn't be expressed in the query itself.
    if (rangeField !== 'stock' && inStock) {
      docs = docs.filter((doc) => (doc.data().stock ?? 0) > 0)
    }

    return NextResponse.json({
      products: docs.map(serializeProduct),
      hasMore,
      nextCursor: docs.length ? docs[docs.length - 1].id : null,
    })
  } catch (error) {
    console.error('API products error:', error)
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 })
  }
}
