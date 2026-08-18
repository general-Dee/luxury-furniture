import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/firebase/session'
import { signUploadParams } from '@/lib/cloudinary'

export async function POST() {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const params = signUploadParams({ folder: 'products' })
  return NextResponse.json(params)
}
