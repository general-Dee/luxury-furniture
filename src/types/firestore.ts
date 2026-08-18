import type { Timestamp } from 'firebase/firestore'

export type Product = {
  slug: string
  name: string
  nameLower: string
  description: string | null
  price: number
  stock: number
  images: string[]
  categorySlug: string
  categoryName: string
  isSale: boolean
  isActive: boolean
  avgRating: number
  reviewCount: number
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type Category = {
  slug: string
  name: string
  createdAt: Timestamp
}

export type OrderItem = {
  productId: string
  productName: string
  quantity: number
  price: number
  image: string
}

export type OrderStatus = 'pending' | 'paid' | 'failed' | 'cancelled'

export type Order = {
  userId: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  items: OrderItem[]
  totalAmount: number
  status: OrderStatus
  paystackReference: string | null
  paystackAccessCode: string | null
  createdAt: Timestamp
  updatedAt: Timestamp
  paidAt: Timestamp | null
}

export type Address = {
  fullName: string
  phone: string
  address: string
  city: string
  state: string
  isDefault: boolean
  createdAt: Timestamp
}

export type WishlistItem = {
  productId: string
  name: string
  slug: string
  price: number
  image: string
  createdAt: Timestamp
}

export type Review = {
  productId: string
  userId: string
  userName: string
  rating: number
  title: string
  comment: string
  images: string[]
  verifiedPurchase: boolean
  createdAt: Timestamp
}

export type Subscriber = {
  email: string
  subscribedAt: Timestamp
  isActive: boolean
}

export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  content: string
  featuredImage: string | null
  author: string
  published: boolean
  publishedAt: Timestamp | null
  createdAt: Timestamp
}

export type AbandonedCart = {
  cartItems: OrderItem[]
  totalPrice: number
  lastUpdated: Timestamp
  notified: boolean
}

export type UserProfile = {
  email: string
  displayName: string | null
  phone: string | null
  createdAt: Timestamp
}

/** Shape returned by GET /api/products — a client-safe product DTO. */
export type ProductListItem = {
  id: string
  slug: string
  name: string
  description: string
  price: number
  stock: number
  images: string[]
  isSale: boolean
  categories: { name: string; slug: string } | null
}
