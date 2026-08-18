import Link from 'next/link'
import Image from 'next/image'
import RecentPosts from '@/components/RecentPosts'
import { adminDb } from '@/lib/firebase/admin'

export const dynamic = 'force-dynamic'

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default async function BlogPage() {
  const snapshot = await adminDb
    .collection('blog_posts')
    .where('published', '==', true)
    .orderBy('publishedAt', 'desc')
    .get()

  const posts = snapshot.docs.map((d) => {
    const data = d.data()
    return {
      slug: d.id,
      title: data.title as string,
      excerpt: data.excerpt as string | undefined,
      content: data.content as string,
      featuredImage: data.featuredImage as string | null,
      publishedAt: data.publishedAt?.toDate ? data.publishedAt.toDate() : null,
    }
  })

  return (
    <main className="container-luxury py-12">
      <h1 className="text-4xl font-serif text-center mb-4">Luxury Living Blog</h1>
      <p className="text-center text-gray-600 mb-12">Insights, trends, and inspiration for your home</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
              <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                {post.featuredImage && (
                  <div className="relative h-64 w-full">
                    <Image
                      src={post.featuredImage}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-2xl font-serif mb-2 group-hover:text-luxury-gold transition">
                    {post.title}
                  </h2>
                  <p className="text-gray-500 text-sm mb-2">
                    {post.publishedAt && formatDate(post.publishedAt)}
                  </p>
                  <p className="text-gray-600">
                    {post.excerpt || post.content.replace(/<[^>]*>/g, '').slice(0, 150)}...
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Sidebar – only Recent Posts */}
        <div>
          <RecentPosts />
        </div>
      </div>
    </main>
  )
}
