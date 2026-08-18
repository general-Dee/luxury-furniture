import Link from 'next/link'
import Image from 'next/image'
import { adminDb } from '@/lib/firebase/admin'

export default async function RecentPosts() {
  const snapshot = await adminDb
    .collection('blog_posts')
    .where('published', '==', true)
    .orderBy('publishedAt', 'desc')
    .limit(3)
    .get()

  if (snapshot.empty) return null

  const posts = snapshot.docs.map((d) => {
    const data = d.data()
    return {
      slug: d.id,
      title: data.title as string,
      featuredImage: data.featuredImage as string | null,
      publishedAt: data.publishedAt?.toDate ? data.publishedAt.toDate() : null,
    }
  })

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h3 className="text-xl font-serif mb-4">Recent Posts</h3>
      <div className="space-y-4">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="group flex gap-3">
            {post.featuredImage && (
              <div className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden">
                <Image
                  src={post.featuredImage}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <div>
              <h4 className="font-serif text-gray-800 group-hover:text-luxury-gold transition line-clamp-2">
                {post.title}
              </h4>
              {post.publishedAt && (
                <p className="text-xs text-gray-500 mt-1">
                  {post.publishedAt.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
