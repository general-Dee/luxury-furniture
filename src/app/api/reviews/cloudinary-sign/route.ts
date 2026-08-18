import { NextResponse } from 'next/server'
import { getServerUser } from '@/lib/firebase/session'
import { signUploadParams } from '@/lib/cloudinary'

export async function POST() {
  const user = await getServerUser()
  if (!user) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  }

  const params = signUploadParams({ folder: `reviews/${user.uid}` })
  return NextResponse.json(params)
}
