import { test, expect } from '@playwright/test'

// Covers the highest-value guest-facing path end to end. A second flow —
// an authenticated user completing checkout through to a valid Paystack
// redirect — needs the Firebase Auth emulator wired into the dev server
// (FIREBASE_AUTH_EMULATOR_HOST) and is intentionally not included here to
// avoid depending on live Firebase/Paystack credentials in CI; the webhook
// signature verification and order-total logic that flow relies on are
// covered directly by src/lib/paystack.test.ts and src/lib/order-items.test.ts.

test('guest cannot reach checkout without signing in', async ({ page }) => {
  await page.goto('/')
  const firstAddToCart = page.getByRole('button', { name: /add to cart/i }).first()
  await firstAddToCart.waitFor({ state: 'visible' })
  await firstAddToCart.click()

  await page.goto('/checkout')
  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByText(/sign in to your account/i)).toBeVisible()
})
