'use client'
import { useState } from 'react'
import ImageUpload from './ImageUpload'

export default function ImageUploadWrapper({ initialImages = [] }: { initialImages: string[] }) {
  const [images, setImages] = useState(initialImages)

  // Sync images to a hidden input so it's submitted with the form
  return (
    <>
      <ImageUpload onImagesChange={setImages} initialImages={initialImages} />
      <input type="hidden" name="images" value={JSON.stringify(images)} />
    </>
  )
}