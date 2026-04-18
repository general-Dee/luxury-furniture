import { NextResponse } from 'next/server'

export async function GET() {
  // Fixed luxury price range for Nigerian market
  const minPrice = 200000
  const maxPrice = 7000000

  return NextResponse.json({ minPrice, maxPrice })
}