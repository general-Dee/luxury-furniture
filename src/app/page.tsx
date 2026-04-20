import { createClient } from '@/utils/supabase/server'
import ProductCard from '@/components/ProductCard'
import Hero from '@/components/Hero'
import CategoryNav from '@/components/CategoryNav'
import ProductFilters from '@/components/ProductFilters'
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

  let query = supabase
    .from('products')
    .select('*, categories(name, slug)', { count: 'exact' })

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

  if (search && search.trim() !== '') {
    query = query.ilike('name', `%${search}%`)
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

  switch (sort) {
    case 'price_asc':
      query = query.order('price', { ascending: true })
      break
    case 'price_desc':
      query = query.order('price', { ascending: false })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

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
        <CategoryNav />
        <ProductFilters />
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
        <LatestBlogPosts />
      </div>
    </>
  )
}