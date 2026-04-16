import { createClient } from '@/utils/supabase/client'
import { useCartStore, CartItem } from '@/store/cartStore'

export async function syncCartWithUser(userId: string) {
  const supabase = createClient()
  const { items: localItems, clearCart, addItem } = useCartStore.getState()

  // Fetch user's cart from Supabase
  const { data: cart } = await supabase
    .from('carts')
    .select('*, cart_items(*)')
    .eq('user_id', userId)
    .single()

  if (cart && cart.cart_items.length > 0) {
    // Merge server cart into local store (add items, avoid duplicates)
    for (const serverItem of cart.cart_items) {
      const existingLocal = localItems.find(i => i.product_id === serverItem.product_id)
      if (existingLocal) {
        // Update quantity to max of both?
        // For simplicity, add quantities
        addItem({
          id: serverItem.id,
          product_id: serverItem.product_id,
          name: serverItem.product_name,
          price: serverItem.price,
          quantity: serverItem.quantity,
          image: serverItem.image,
        })
      } else {
        addItem({
          id: serverItem.id,
          product_id: serverItem.product_id,
          name: serverItem.product_name,
          price: serverItem.price,
          quantity: serverItem.quantity,
          image: serverItem.image,
        })
      }
    }
  }

  // Optionally, clear local cart after merge? Not needed.
}