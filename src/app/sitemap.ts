import { createClient } from '@/utils/supabase/server'
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://luxury-furniture.vercel.app'

  // Fetch all products
  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at')

  // Static routes
  const staticRoutes = [
    { route: '', priority: 1.0 },
    { route: '/cart', priority: 0.7 },
    { route: '/account', priority: 0.6 },
    { route: '/orders', priority: 0.6 },
  ].map(({ route, priority }) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority,
  }))

  // Dynamic product routes
  const productRoutes = products?.map(product => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: new Date(product.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  })) || []

  return [...staticRoutes, ...productRoutes]
}