import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import Image from 'next/image'

export default async function RecentPosts() {
  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, title, featured_image, published_at')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(3)

  if (!posts || posts.length === 0) return null

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h3 className="text-xl font-serif mb-4">Recent Posts</h3>
      <div className="space-y-4">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="group flex gap-3">
            {post.featured_image && (
              <div className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden">
                <Image
                  src={post.featured_image}
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
              <p className="text-xs text-gray-500 mt-1">
                {new Date(post.published_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}