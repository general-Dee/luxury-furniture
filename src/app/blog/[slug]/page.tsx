import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
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
    <main className="ind-scope max-w-7xl mx-auto px-6 py-12">
      <Link href="/blog" className="ind-btn ind-btn-ghost !px-0 mb-6 inline-block">← All posts</Link>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <article className="lg:col-span-2">
          <h1 className="uppercase text-4xl md:text-5xl mb-2">{post.title}</h1>
          <p className="text-xs uppercase tracking-[0.06em] text-[var(--ind-color-accent-700)] mb-6">
            {post.publishedAt && formatDate(post.publishedAt)}
          </p>
          {post.featuredImage && (
            <figure className="ind-blueprint ind-duotone relative m-0 mb-6">
              <i className="ind-corner tl" />
              <i className="ind-corner tr" />
              <i className="ind-corner bl" />
              <i className="ind-corner br" />
              <div className="relative h-96 w-full">
                <Image src={post.featuredImage} alt={post.title} fill className="object-cover" priority />
              </div>
            </figure>
          )}
          <div
            className="prose prose-lg max-w-none prose-headings:uppercase prose-headings:font-[var(--ind-font-heading)] prose-a:text-[var(--ind-color-accent)]"
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
