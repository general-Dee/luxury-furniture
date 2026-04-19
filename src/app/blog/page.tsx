import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import RecentPosts from '@/components/RecentPosts'  // remove NewsletterSignup import

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default async function BlogPage() {
  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false })

  return (
    <main className="container-luxury py-12">
      <h1 className="text-4xl font-serif text-center mb-4">Luxury Living Blog</h1>
      <p className="text-center text-gray-600 mb-12">Insights, trends, and inspiration for your home</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {posts?.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
              <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                {post.featured_image && (
                  <div className="relative h-64 w-full">
                    <Image
                      src={post.featured_image}
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
                    {post.published_at && formatDate(post.published_at)}
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