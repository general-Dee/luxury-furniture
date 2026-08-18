import type { MetadataRoute } from 'next'
import { adminDb } from '@/lib/firebase/admin'

// Firestore is read at request time, not build time — this route has no
// static-generation credentials available (e.g. in CI) and product data
// changes too often for a build-time snapshot to stay accurate.
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://luxury-furniture.vercel.app'

  const snapshot = await adminDb.collection('products').where('isActive', '==', true).get()

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

  const productRoutes = snapshot.docs.map((doc) => {
    const data = doc.data()
    const updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date()
    return {
      url: `${baseUrl}/product/${doc.id}`,
      lastModified: updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }
  })

  return [...staticRoutes, ...productRoutes]
}
