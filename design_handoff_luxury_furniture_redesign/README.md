# Handoff: Luxury Furniture — Industry Redesign

## Overview
A full redesign of the general-Dee/luxury-furniture Next.js storefront (repo: `general-Dee/luxury-furniture`, branch `main`) using the "Industry" design system — a wireframe/blueprint aesthetic (steel-blue accent on a light technical ground, Barlow Condensed headings, square-cornered hairline-bordered cards with corner registration marks). Covers the full customer journey (browse → product → cart → checkout → account) plus content (blog, sale) and an admin back office.

## About the Design Files
The files in this bundle are **design references created in HTML** (Design Components — a proprietary streaming template format) — prototypes showing intended look, structure, and interaction flow, not production code to copy directly. The task is to **recreate these HTML designs in the target codebase's existing environment** (this repo is Next.js/React with Tailwind CSS and Firebase) using its established patterns, components, and data layer — not to ship the HTML as-is.

## Fidelity
**High-fidelity.** Final colors, typography, spacing and interaction flows are intentional and should be recreated pixel-for-pixel using the codebase's own component library (or Tailwind utility classes matching the tokens below, since the current app has no component library beyond a few hand-rolled components).

## Screens / Views
All screens share a persistent top nav (`.nav`): brand wordmark "Luxury Furniture" (→ home), category links (Living Room/Bedroom/Office — all route to the filtered home view), Sale, Blog, Wishlist, Orders, Account, Admin, a cart icon with item-count badge, and Login/Sign Up buttons. Footer is a single centered line, border-top hairline, 13px muted text.

1. **Home** — Hero: two-column grid, left column has an eyebrow tag ("Est. drawing set 04"), an uppercase Barlow Condensed H1 (`clamp(40px,6vw,68px)`), a body paragraph (max 52ch), and two buttons (primary + ghost). Right column: a duotoned photo in a `.blueprint` frame (corner marks). Below: a "filter plate" (`.plate` — hairline border + corner marks) with a title-block header row, then a 3-column filter grid (search input, sort select, in-stock checkbox), then a price-range row. Below that: category filter tags (`.tag`, one accent-filled "All" + outlined others). Below that: a 4-column product grid of `.card` blueprint cards (duotoned image top, category kicker, title, description, price in accent-700, "Add" primary button). Clicking a card opens Product; clicking Add increments the cart badge.

2. **Product detail** — Back link to Home. Two-column: left stacks two duotoned blueprint image frames; right has category tag, uppercase H1, large price (accent-700, Barlow Condensed 600, 30px), a 5-star rating row + review count, a description paragraph, a full-width primary "Add to cart — ₦price" button (routes to Cart), and a spec `.plate` table (Frame/Upholstery/Dimensions/Lead time). Below: "Customer reviews" section — kicker label + hairline rule, then a list of reviews (stars, name, date, comment).

3. **Cart** — Two-column: left is a stacked list of `.card` line items (duotoned thumbnail, name, price, qty stepper with `.btn-icon` minus/plus, Remove ghost button, line total); right is an order-summary `.card` (subtotal, shipping note, total, primary "Proceed to checkout" button, ghost "Continue shopping" button).

4. **Checkout** — Back link to Cart. Centered 640px column, uppercase H1, single `.card` with stacked form fields (Email, Phone, Address, City/State two-up), a rule, a total line, and a primary "Pay with Paystack" button (routes to Orders as the demo "order placed" state).

5. **Login** — Centered 380px `.card`, uppercase H2, Email + Password fields, primary "Sign in" block button (routes to Account), link to Sign up.

6. **Signup** — Same layout as Login; Email + Password (min 6 chars placeholder), primary "Sign up" block button (routes to Account), link to Sign in.

7. **Wishlist** — Uppercase H1, then either a 4-column grid of `.card` product tiles (duotoned image, name, price) or — when empty — a centered `.plate` panel with "You haven't saved any products yet." + a primary "Start shopping" button.

8. **Orders (customer)** — Uppercase H1, then either a stacked list of `.card` rows (order # short-id, date, total, status `.tag` colored by status) or an empty `.plate` panel ("You haven't placed any orders yet.").

9. **Account** — Uppercase H1, a "Profile info" `.card` (email + "View wishlist"/"View orders" secondary buttons), and a "Saved addresses" `.card` (empty state copy + "+ Add address" secondary button).

10. **Blog list** — Centered uppercase H1 + subhead. Two-column: left is a stacked list of `.card` post tiles (16:9 duotoned image, uppercase title, accent-700 uppercase date, excerpt); right is a "Recent posts" sidebar (kicker + hairline rule + link list). Clicking a post opens Blog post.

11. **Blog post** — Back link to Blog list. Two-column: left is the article (uppercase H1, accent-700 date, full-bleed duotoned blueprint hero image, body paragraphs); right is the same "Recent posts" sidebar.

12. **Sale** — Uppercase H1 + subhead, 4-column grid of `.card` tiles with a struck-through original price next to the sale price (accent-700).

13. **Admin dashboard** — Shared `AdminNav` sub-nav (Dashboard/Products/Categories/Orders tabs, active tab bold). Three `.card` stat tiles (Products / Categories / Pending orders counts) — each clickable, routing to the matching admin list.

14. **Admin products** — `AdminNav` + "+ New product" primary button + a `.table` (Name, Price + "· Inactive" accent-colored suffix, Stock, Edit link/Delete ghost button) or an empty `.plate` panel ("No products yet.").

15. **Admin orders** — `AdminNav` + a `.seg` status filter (All/Pending/Paid/Failed) + a `.table` (Order, Customer email, Items, Total, status `.tag`) or empty state.

16. **Admin categories** — `AdminNav` + an add-category row (text input + primary "Add") + a list of `.card` rows (name + ghost Delete button).

## Interactions & Behavior
- All navigation is client-side state (`screen` in a single component) in the prototype; in the real app this maps to Next.js routes (`/`, `/product/[slug]`, `/cart`, `/checkout`, `/login`, `/signup`, `/wishlist`, `/orders`, `/account`, `/blog`, `/blog/[slug]`, `/sale`, `/admin`, `/admin/products`, `/admin/categories`, `/admin/orders`).
- Product card click → product detail. "Add" button on a card increments the cart badge without navigating (`stopPropagation`). "Add to cart" on the product page increments the badge and navigates to Cart.
- Cart "Proceed to checkout" → Checkout. Checkout "Pay with Paystack" → Orders (stands in for the real Paystack redirect + webhook flow in `src/app/api/paystack/*`).
- Login "Sign in" and Signup "Sign up" both route to Account (demo shortcut for a real auth flow via Firebase, per `src/app/login/page.tsx` / `src/app/signup/page.tsx`).
- Admin dashboard stat tiles route to the matching admin sub-page, matching the original app's `Link` behavior.
- Wishlist / Orders / Admin Products / Admin Orders each have a designed **empty state** (centered `.plate` panel with a short message, sometimes a CTA) — toggle "Demo empty states" in the prototype's Tweaks panel to preview them; implement as the real "no data" branch of each list.
- No loading-state or form-validation visuals were designed — decide with product/design whether to add skeletons and inline validation errors before build, matching the existing app's fetch-on-mount patterns (`useEffect` + Firestore/`fetch` calls in `wishlist/page.tsx`, `sale/page.tsx`, etc.).
- Hover/focus/pressed states are NOT hand-styled per element — they come from the Industry system's built-in component states (see Design Tokens → Interaction states below); do not add custom hover colors.

## State Management
- `screen`: which view is showing (maps to routing in the real app).
- `cartCount`: demo integer, incremented by Add-to-cart actions (maps to real cart state — see `src/app/api/cart/sync/route.ts` and any cart context/store in the codebase).
- `demoEmptyStates`: prototype-only boolean toggle; not a real app state — replace with the real "list is empty" check (`items.length === 0`) per screen.
- Real data needs (per the repo's existing Firestore collections): `products`, `categories`, `orders` (customer + admin filtered views), `blog_posts`, wishlist subcollection under `users/{uid}/wishlist`, and the authenticated user session (`getServerUser`).

## Design Tokens
Full source of truth is the bundled `industry-design-system/styles.css`. Key values:
- **Colors**: `--color-bg #f2f2f3`, `--color-text #1d1f20`, `--color-accent #5980a6` (single steel-blue accent; a mono scheme — accent-2 is a stand-in, treat as the same role). Tonal ramps 100–900 for neutral/accent/accent-2, generated in OKLCH. Use light steps (100–300) for tints, 500 as base, 700–900 for text-on-tint and pressed states.
- **Type**: `--font-heading "Barlow Condensed"` (weight 600) for all headings, uppercase in this design; `--font-body "Barlow"` for body text. Scale: h1 42px, h2 32px, h3 25px, h4 20px, h5 16px, h6 13px (uppercase, letter-spacing 0.08em). Base body 15px / line-height 1.55.
- **Spacing**: `--space-1` 3.4px … `--space-8` 27.2px (0.85× density scale).
- **Radius**: `--radius-sm` 2px / `--radius-md` 4px / `--radius-lg` 7px — but note the "blueprint frame" override zeroes radius on cards, buttons, inputs, tags and dialogs (this system is square-cornered by design; the primary button is the one solid-filled object).
- **Shadows**: `--shadow-sm/md/lg`, ink-tinted, already tuned to the light ground.
- **Blueprint frame**: `.blueprint` class + four `<i class="corner tl/tr/bl/br">` children draws the hairline border + "+" registration marks at each corner — used on every card, image figure, and the filter/spec "plate" panels.
- **Duotone imagery**: `.duotone` wrapper desaturates and washes a photo in the accent color via `mix-blend-mode: color` — applied to every product/blog photo in this design.
- **Interaction states**: built into the system's CSS — hover/pressed tints from the accent ramp, `:focus-visible` shows a 2px accent outline, disabled controls drop to 45% opacity. Do not re-style these per screen.

## Assets
- All product/blog photography in the prototype uses `<image-slot>` placeholders (drag-and-drop image slots) — no real photography was sourced. Real product photos should go through the `.duotone` treatment described above.
- Icons are inline SVG at 1.5 stroke-width, matching Lucide's style (cart, star, heart) — swap for actual Lucide icons in the real build.

## Files
- `Luxury Furniture - Industry.dc.html` — the full redesign, all 16 screens, in the proprietary Design Component template format (streaming HTML + a small JS logic class). Open directly in a browser to view/interact.
- `AdminNav.dc.html` — the shared admin sub-nav component (Dashboard/Products/Categories/Orders tabs), imported by the four admin screens.
- `image-slot.js` — the web component powering the image placeholders; not needed in the real app (replace with real `<Image>` usage).
- `industry-design-system/styles.css` — the complete design-token + component stylesheet referenced above (tokens, ramps, `.card`/`.btn`/`.table`/`.tag`/`.field`/`.blueprint` component classes).
- `industry-design-system/readme.md` — the design system's own usage guide.

For the **pixel-faithful recreation of the current live site** (pre-redesign reference, in the original Playfair Display/Inter + gold/charcoal styling) and the **admin/account/blog/etc. pixel recreation**, see `Luxury Furniture - Original.dc.html` and `Luxury Furniture - Original More Pages.dc.html` in the parent project — not included in this bundle since they represent the existing app, not the new design.
