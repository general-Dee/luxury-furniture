'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import dynamic from 'next/dynamic'
import ImageUpload from '@/components/ImageUpload'

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false })

export default function EditBlogPost() {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [featuredImage, setFeaturedImage] = useState('')
  const [published, setPublished] = useState(false)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const supabase = createClient()

  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        alert('Post not found')
        router.push('/admin/blog')
        return
      }

      setTitle(data.title)
      setSlug(data.slug || '')
      setExcerpt(data.excerpt || '')
      setContent(data.content || '')
      setFeaturedImage(data.featured_image || '')
      setPublished(data.published || false)
      setInitialLoading(false)
    }

    if (id) fetchPost()
  }, [id, supabase, router])

  const generateSlug = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const finalSlug = slug || generateSlug(title)

    const { error } = await supabase
      .from('blog_posts')
      .update({
        title,
        slug: finalSlug,
        excerpt,
        content,
        featured_image: featuredImage,
        published,
        published_at: published ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      alert(error.message)
    } else {
      router.push('/admin/blog')
    }
    setLoading(false)
  }

  if (initialLoading) {
    return <div className="container-luxury py-12">Loading post...</div>
  }

  return (
    <div className="container-luxury py-12 max-w-4xl mx-auto">
      <h1 className="text-3xl font-serif mb-8">Edit Blog Post</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border rounded-md px-3 py-2 focus:ring-luxury-gold focus:border-luxury-gold"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Slug (URL)</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="auto-generated from title"
            className="w-full border rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Excerpt (short summary)</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Featured Image URL</label>
          <input
            type="url"
            value={featuredImage}
            onChange={(e) => setFeaturedImage(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="w-full border rounded-md px-3 py-2 mb-2"
          />
          <ImageUpload onUpload={(url) => setFeaturedImage(url)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Content *</label>
          <RichTextEditor value={content} onChange={setContent} />
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            Published
          </label>
        </div>
        <div className="flex gap-4">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Saving...' : 'Update Post'}
          </button>
          <button type="button" onClick={() => router.push('/admin/blog')} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}