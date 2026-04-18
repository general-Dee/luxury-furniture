'use client'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function ImageUpload({ onUpload }: { onUpload: (url: string) => void }) {
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `public/${fileName}`

    const { error, data } = await supabase.storage
      .from('blog-images')
      .upload(filePath, file)

    if (error) {
      alert('Upload failed: ' + error.message)
    } else {
      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath)
      onUpload(publicUrl)
    }
    setUploading(false)
  }

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={uploadImage}
        disabled={uploading}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-luxury-gold file:text-white hover:file:bg-luxury-charcoal"
      />
      {uploading && <p className="text-sm mt-1">Uploading...</p>}
    </div>
  )
}