/**
 * Client-side helper for signed Cloudinary uploads. Requests a short-lived
 * signature from one of our own API routes (which gate on auth/admin), then
 * uploads the file bytes straight to Cloudinary — our server never proxies
 * the file itself.
 */
export async function uploadToCloudinary(file: File, signEndpoint: string): Promise<string> {
  const signRes = await fetch(signEndpoint, { method: 'POST' })
  if (!signRes.ok) {
    throw new Error('Failed to authorize upload')
  }
  const { signature, timestamp, apiKey, cloudName, folder } = await signRes.json()

  const formData = new FormData()
  formData.append('file', file)
  formData.append('api_key', apiKey)
  formData.append('timestamp', String(timestamp))
  formData.append('signature', signature)
  formData.append('folder', folder)

  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  })
  if (!uploadRes.ok) {
    throw new Error('Image upload failed')
  }
  const data = await uploadRes.json()
  return data.secure_url as string
}
