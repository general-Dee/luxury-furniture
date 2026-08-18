import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'

export async function GET() {
  const snapshot = await adminDb.collection('blog_posts').get()
  const posts = snapshot.docs.map((d) => {
    const data = d.data()
    return { slug: d.id, title: data.title, published: Boolean(data.published) }
  })
  return NextResponse.json(posts)
}
