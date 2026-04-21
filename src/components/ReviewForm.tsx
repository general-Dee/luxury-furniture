'use client'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Star, X, Upload } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface ReviewFormProps {
  productId: string
  userId: string
  onReviewSubmitted?: () => void
}

export default function ReviewForm({ productId, userId, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `review-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `reviews/${fileName}`
    const { error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file)
    if (error) throw error
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)
    return publicUrl
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (images.length + files.length > 3) {
      alert('Maximum 3 images allowed')
      return
    }
    setUploading(true)
    try {
      const urls = await Promise.all(files.map(uploadImage))
      setImages(prev => [...prev, ...urls])
    } catch (err) {
      alert('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('reviews').insert({
      product_id: productId,
      user_id: userId,
      rating,
      title,
      comment,
      images,
      verified_purchase: false,
    })
    if (error) {
      alert(error.message)
    } else {
      setRating(5)
      setTitle('')
      setComment('')
      setImages([])
      if (onReviewSubmitted) onReviewSubmitted()
      else router.refresh()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border-t pt-6 mt-6">
      <h3 className="text-xl font-serif">Write a Review</h3>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none">
            <Star className={`w-6 h-6 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
          </button>
        ))}
      </div>
      <input
        type="text"
        placeholder="Review title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border rounded-md px-3 py-2"
      />
      <textarea
        placeholder="Your review"
        rows={4}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        required
        className="w-full border rounded-md px-3 py-2"
      />
      <div>
        <label className="block text-sm font-medium mb-1">Images (optional, max 3)</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {images.map((url, idx) => (
            <div key={idx} className="relative w-16 h-16 rounded border overflow-hidden">
              <Image src={url} alt="Review" fill className="object-cover" />
              <button type="button" onClick={() => removeImage(idx)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <label className="flex flex-col items-center justify-center w-16 h-16 border-2 border-dashed rounded cursor-pointer hover:bg-gray-50">
            {uploading ? (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-5 h-5 text-gray-400" />
            )}
            <input type="file" multiple accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
          </label>
        </div>
      </div>
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  )
}