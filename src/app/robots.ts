import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin', '/checkout/verify', '/login', '/signup'],
    },
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL || 'https://luxury-furniture.vercel.app'}/sitemap.xml`,
  }
}