import { createClient } from '@/utils/supabase/server'
import ProductCard from '@/components/ProductCard'
import Hero from '@/components/Hero'
import CategoryNav from '@/components/CategoryNav'   // ← normal import, no dynamic

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const supabase = await createClient()

  let query = supabase.from('products').select('*, categories(name, slug)')

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

  const { data: products } = await query.order('created_at', { ascending: false })

  return (
    <>
      <Hero />
      <div className="container-luxury py-12" id="products">
        <CategoryNav />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-12">
          {products?.length === 0 ? (
            <p className="col-span-full text-center text-gray-500 py-12">No products found.</p>
          ) : (
            products?.map((product, index) => (
              <ProductCard key={product.id} product={product} priority={index < 4} />
            ))
          )}
        </div>
      </div>
    </>
  )
}