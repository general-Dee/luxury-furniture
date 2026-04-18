import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params  // ✅ Await the params Promise
  const supabase = await createClient()

  const { data: post, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single()

  // If post not found or not published, show 404
  if (error || !post || !post.published) {
    notFound()
  }

  return (
    <main className="container-luxury py-12 max-w-4xl mx-auto">
      <article>
        <h1 className="text-4xl md:text-5xl font-serif mb-4">{post.title}</h1>
        <div className="flex items-center gap-4 text-gray-500 text-sm mb-8">
          <span>{post.published_at && formatDate(post.published_at)}</span>
        </div>

        {post.featured_image && (
          <div className="relative h-96 w-full mb-8 rounded-lg overflow-hidden">
            <Image
              src={post.featured_image}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <div
          className="prose prose-lg max-w-none prose-headings:font-serif prose-a:text-luxury-gold"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </main>
  )
}