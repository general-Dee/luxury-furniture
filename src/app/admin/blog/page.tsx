'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false })
      setPosts(data || [])
      setLoading(false)
    }
    fetchPosts()
  }, [])

  const handleDelete = async (id: string) => {
    if (confirm('Delete this post?')) {
      await supabase.from('blog_posts').delete().eq('id', id)
      setPosts(posts.filter(p => p.id !== id))
    }
  }

  if (loading) return <div className="container-luxury py-12">Loading...</div>

  return (
    <div className="container-luxury py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif">Manage Blog Posts</h1>
        <Link href="/admin/blog/new" className="btn-primary">+ New Post</Link>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {posts.map(post => (
              <tr key={post.id}>
                <td className="px-6 py-4">{post.title}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${post.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-6 py-4">{new Date(post.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <Link href={`/admin/blog/edit/${post.id}`} className="text-blue-600 hover:text-blue-800">Edit</Link>
                  <button onClick={() => handleDelete(post.id)} className="text-red-600 hover:text-red-800 ml-2">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}