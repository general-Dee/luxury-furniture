import { createClient } from '@/utils/supabase/server'
import ProductCard from '@/components/ProductCard'
import Hero from '@/components/Hero'
import LazyCategoryNav from '@/components/LazyCategoryNav'
import LazyProductFilters from '@/components/LazyProductFilters'
import LoadMore from '@/components/LoadMore'
import LatestBlogPosts from '@/components/LatestBlogPosts'

const PRODUCTS_PER_PAGE = 12

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ 
    category?: string
    search?: string
    minPrice?: string
    maxPrice?: string
    sort?: string
    inStock?: string
    page?: string
  }>
}) {
  const { category, search, minPrice, maxPrice, sort, inStock, page } = await searchParams
  const currentPage = parseInt(page || '1')
  const supabase = await createClient()

  // Start query
  let query = supabase
    .from('products')
    .select('*, categories(name, slug)', { count: 'exact' })

  // Category filter
  if (category && category !== 'all') {
    const { data: catData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', category)
      .single()
    if (catData) {
      query = query.eq('category_id', catData.id)
    }
  }

  // Search filter
  if (search && search.trim() !== '') {
    query = query.ilike('name', `%${search}%`)
  }

  // Price range
  if (minPrice && !isNaN(parseFloat(minPrice))) {
    query = query.gte('price', parseFloat(minPrice))
  }
  if (maxPrice && !isNaN(parseFloat(maxPrice))) {
    query = query.lte('price', parseFloat(maxPrice))
  }

  // Stock availability
  if (inStock === 'true') {
    query = query.gt('stock', 0)
  }

  // Sorting
  switch (sort) {
    case 'price_asc':
      query = query.order('price', { ascending: true })
      break
    case 'price_desc':
      query = query.order('price', { ascending: false })
      break
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false })
      break
  }

  // Pagination
  const from = (currentPage - 1) * PRODUCTS_PER_PAGE
  const to = from + PRODUCTS_PER_PAGE - 1
  query = query.range(from, to)

  const { data: products, count } = await query

  const totalProducts = count || 0
  const hasMore = totalProducts > currentPage * PRODUCTS_PER_PAGE

  return (
    <>
      <Hero />
      <div className="container-luxury py-12" id="products">
        <LazyCategoryNav />
        <LazyProductFilters />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-8">
          {products?.length === 0 ? (
            <p className="col-span-full text-center text-gray-500 py-12">
              No products found. Try adjusting your filters.
            </p>
          ) : (
            products?.map((product, index) => (
              <ProductCard key={product.id} product={product} priority={index < 4 && currentPage === 1} />
            ))
          )}
        </div>
        {hasMore && <LoadMore currentPage={currentPage} />}
        
        {/* Blog preview section – only shows if at least one published post exists */}
        <LatestBlogPosts />
      </div>
    </>
  )
}