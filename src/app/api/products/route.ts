import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')
  const category = searchParams.get('category')
  const search = searchParams.get('search')
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const sort = searchParams.get('sort')
  const inStock = searchParams.get('inStock')

  const from = (page - 1) * limit
  const to = from + limit - 1

  const supabase = await createClient()
  let query = supabase.from('products').select('*, categories(name, slug)', { count: 'exact' })

  // Apply filters only if they have meaningful values
  if (category && category !== 'all' && category !== '') {
    // @ts-ignore
    const { data: catData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', category)
      .single()
    if (catData) query = query.eq('category_id', (catData as any).id)
  }
  if (search && search.trim() !== '') {
    query = query.ilike('name', `%${search.trim()}%`)
  }
  if (minPrice && !isNaN(parseFloat(minPrice))) {
    query = query.gte('price', parseFloat(minPrice))
  }
  if (maxPrice && !isNaN(parseFloat(maxPrice))) {
    query = query.lte('price', parseFloat(maxPrice))
  }
  if (inStock === 'true') {
    query = query.gt('stock', 0)
  }

  // Sorting
  if (sort === 'price_asc') query = query.order('price', { ascending: true })
  else if (sort === 'price_desc') query = query.order('price', { ascending: false })
  else query = query.order('created_at', { ascending: false })

  query = query.range(from, to)

  // @ts-ignore
  const { data, count, error } = await query

  if (error) {
    console.error('API products error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    products: data || [],
    total: count || 0,
    page,
    hasMore: (page * limit) < (count || 0)
  })
}