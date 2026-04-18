'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import dynamic from 'next/dynamic'
import ImageUpload from '@/components/ImageUpload'

// Dynamically import the rich text editor to avoid SSR issues
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false })

export default function NewBlogPost() {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [featuredImage, setFeaturedImage] = useState('')
  const [published, setPublished] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const finalSlug = slug || generateSlug(title)

    const { error } = await supabase.from('blog_posts').insert({
      title,
      slug: finalSlug,
      excerpt,
      content,
      featured_image: featuredImage,
      published,
      published_at: published ? new Date().toISOString() : null,
    })

    if (error) {
      alert(error.message)
    } else {
      router.push('/admin/blog')
    }
    setLoading(false)
  }

  return (
    <div className="container-luxury py-12 max-w-4xl mx-auto">
      <h1 className="text-3xl font-serif mb-8">Create New Blog Post</h1>
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
            Publish immediately
          </label>
        </div>
        <div className="flex gap-4">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Saving...' : 'Save Post'}
          </button>
          <button type="button" onClick={() => router.push('/admin/blog')} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}