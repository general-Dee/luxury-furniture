import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import Image from 'next/image'

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default async function LatestBlogPosts() {
  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(3)

  if (!posts || posts.length === 0) return null

  return (
    <section className="mt-20">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-serif mb-2">From Our Blog</h2>
        <p className="text-gray-500">Insights, trends, and inspiration for your home</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="group">
            <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
              {post.featured_image && (
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={post.featured_image}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="p-5">
                <h3 className="text-xl font-serif mb-2 group-hover:text-luxury-gold transition">
                  {post.title}
                </h3>
                <p className="text-gray-500 text-sm mb-2">
                  {post.published_at && formatDate(post.published_at)}
                </p>
                <p className="text-gray-600 line-clamp-2">
                  {post.excerpt || post.content.replace(/<[^>]*>/g, '').slice(0, 120)}...
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="text-center mt-8">
        <Link href="/blog" className="inline-block text-luxury-gold hover:text-luxury-charcoal transition">
          View all articles →
        </Link>
      </div>
    </section>
  )
}