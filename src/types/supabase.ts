export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          price: number
          stock: number
          images: string[]
          category_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          price: number
          stock: number
          images?: string[]
          category_id?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['products']['Insert']>
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
        }
        Update: Partial<Database['public']['Tables']['categories']['Insert']>
      }
      orders: {
        Row: {
          id: string
          email: string
          phone: string
          address: string
          city: string
          state: string
          total_amount: number
          status: string
          paystack_reference: string | null
          paystack_access_code: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          phone: string
          address: string
          city: string
          state: string
          total_amount: number
          status?: string
          paystack_reference?: string | null
          paystack_access_code?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          product_name: string
          quantity: number
          price: number
          image: string
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          product_name: string
          quantity: number
          price: number
          image: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          full_name: string
          phone: string
          address: string
          city: string
          state: string
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          phone: string
          address: string
          city: string
          state: string
          is_default?: boolean
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['addresses']['Insert']>
      }
      wishlist: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['wishlist']['Insert']>
      }
      subscribers: {
        Row: {
          id: string
          email: string
          subscribed_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          email: string
          subscribed_at?: string
          is_active?: boolean
        }
        Update: Partial<Database['public']['Tables']['subscribers']['Insert']>
      }
    }
  }
}