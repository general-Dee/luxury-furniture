import { notFound } from 'next/navigation'
import Image from 'next/image'
import RecentPosts from '@/components/RecentPosts'
import { adminDb } from '@/lib/firebase/admin'

export const dynamic = 'force-dynamic'

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const snap = await adminDb.collection('blog_posts').doc(slug).get()
  if (!snap.exists) notFound()
  const data = snap.data()!
  if (!data.published) notFound()

  const post = {
    title: data.title as string,
    content: data.content as string,
    featuredImage: data.featuredImage as string | null,
    publishedAt: data.publishedAt?.toDate ? data.publishedAt.toDate() : null,
  }

  return (
    <main className="container-luxury py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <article className="lg:col-span-2">
          <h1 className="text-4xl md:text-5xl font-serif mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-gray-500 text-sm mb-8">
            <span>{post.publishedAt && formatDate(post.publishedAt)}</span>
          </div>
          {post.featuredImage && (
            <div className="relative h-96 w-full mb-8 rounded-lg overflow-hidden">
              <Image src={post.featuredImage} alt={post.title} fill className="object-cover" priority />
            </div>
          )}
          <div
            className="prose prose-lg max-w-none prose-headings:font-serif prose-a:text-luxury-gold"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
        <aside>
          <RecentPosts />
        </aside>
      </div>
    </main>
  )
}
