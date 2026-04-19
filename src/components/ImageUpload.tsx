'use client'
import { useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'
import { X, Upload, Loader2 } from 'lucide-react'

interface ImageUploadProps {
  onImagesChange: (urls: string[]) => void
  initialImages?: string[]
  maxImages?: number
}

export default function ImageUpload({ onImagesChange, initialImages = [], maxImages = 5 }: ImageUploadProps) {
  const [images, setImages] = useState<string[]>(initialImages)
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  const uploadImage = useCallback(async (file: File) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${fileName}`

    const { error, data } = await supabase.storage
      .from('product-images')
      .upload(filePath, file)

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)

    return publicUrl
  }, [supabase])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (images.length + files.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images`)
      return
    }

    setUploading(true)
    try {
      const newUrls = await Promise.all(files.map(uploadImage))
      const updated = [...images, ...newUrls]
      setImages(updated)
      onImagesChange(updated)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload one or more images')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index)
    setImages(updated)
    onImagesChange(updated)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {images.map((url, idx) => (
          <div key={idx} className="relative w-24 h-24 rounded border overflow-hidden group">
            <Image src={url} alt={`Product ${idx + 1}`} fill className="object-cover" />
            <button
              type="button"
              onClick={() => removeImage(idx)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        {images.length < maxImages && (
          <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed rounded cursor-pointer hover:bg-gray-50">
            <Upload className="w-6 h-6 text-gray-400" />
            <span className="text-xs text-gray-500 mt-1">Upload</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}
      </div>
      {uploading && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Uploading...
        </div>
      )}
      <p className="text-xs text-gray-400">Max {maxImages} images. Supported formats: JPG, PNG, WebP.</p>
    </div>
  )
}