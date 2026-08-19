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
    <div className="ind-scope">
      <div className="flex items-center gap-4 mb-4">
        <span className="ind-card-kicker">Recent posts</span>
        <div className="flex-1 border-t border-[var(--ind-color-divider)]" />
      </div>
      <div className="space-y-4">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="flex gap-3">
            {post.featuredImage && (
              <div className="ind-duotone relative w-16 h-16 flex-shrink-0 border border-[var(--ind-color-divider)]">
                <Image
                  src={post.featuredImage}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <h4 className="text-sm hover:text-[var(--ind-color-accent)] transition line-clamp-2">
                {post.title}
              </h4>
              {post.publishedAt && (
                <p className="text-xs opacity-60 mt-1">
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
