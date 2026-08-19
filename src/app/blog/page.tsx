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
    <main className="ind-scope max-w-7xl mx-auto px-6 py-12">
      <h1 className="uppercase text-4xl text-center mb-4">Luxury living blog</h1>
      <p className="text-center opacity-70 mb-12">Insights, trends, and inspiration for your home</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="ind-card ind-blueprint relative !p-0 !gap-0">
              <i className="ind-corner tl" />
              <i className="ind-corner tr" />
              <i className="ind-corner bl" />
              <i className="ind-corner br" />
              {post.featuredImage && (
                <div className="ind-duotone relative w-full aspect-video border-b border-[var(--ind-color-divider)]">
                  <Image
                    src={post.featuredImage}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <h2 className="uppercase text-xl mb-2">
                  {post.title}
                </h2>
                <p className="text-xs uppercase tracking-[0.06em] text-[var(--ind-color-accent-700)] mb-2">
                  {post.publishedAt && formatDate(post.publishedAt)}
                </p>
                <p className="text-sm opacity-80">
                  {post.excerpt || post.content.replace(/<[^>]*>/g, '').slice(0, 150)}...
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div>
          <RecentPosts />
        </div>
      </div>
    </main>
  )
}
