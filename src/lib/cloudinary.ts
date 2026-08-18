import 'server-only'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * Produces a signature for a signed, folder-scoped upload. The client sends
 * these params (plus the returned signature/timestamp/api_key) straight to
 * Cloudinary's upload endpoint — our server never proxies the file bytes.
 */
export function signUploadParams(params: Record<string, string | number>) {
  const timestamp = Math.round(Date.now() / 1000)
  const paramsToSign = { ...params, timestamp }
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!
  )

  return {
    signature,
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    ...params,
  }
}

export async function deleteCloudinaryImage(publicId: string) {
  await cloudinary.uploader.destroy(publicId)
}

export default cloudinary
