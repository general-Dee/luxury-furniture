# Luxury Furniture

A luxury furniture storefront built on Next.js 16 (App Router), Firebase (Firestore + Auth), Cloudinary (images), and Paystack (payments). Deployed on Vercel.

## Stack

- **Framework**: Next.js 16, React 19, TypeScript
- **Data**: Firestore (`firestore.rules`, `firestore.indexes.json`) via the Firebase client SDK on the browser and `firebase-admin` on the server
- **Auth**: Firebase Authentication (email/password), bridged to server components/middleware via an httpOnly session cookie (`src/lib/firebase/session.ts`)
- **Images**: Cloudinary, signed uploads only (`src/lib/cloudinary.ts`, `src/lib/cloudinary-upload.ts`)
- **Payments**: Paystack, redirect flow with webhook + self-healing verify endpoint (`src/app/api/paystack/*`)
- **Email**: Resend, for order confirmations and abandoned-cart reminders
- **Hosting**: Vercel, including a Vercel Cron job for the abandoned-cart reminder

## Getting started

1. Copy `.env.example` to `.env.local` and fill in real values:
   - Firebase client config and Admin SDK service account (Firebase Console → Project Settings)
   - Cloudinary cloud name / API key / secret (Cloudinary Console)
   - Paystack secret key (Paystack Dashboard → Settings → API Keys — use a **test** key locally)
   - Resend API key and sender address
   - A random `CRON_SECRET` (used to authorize the cron route)

2. Install dependencies and run the dev server:

   ```bash
   npm install
   npm run dev
   ```

3. Deploy Firestore rules and indexes to your Firebase project:

   ```bash
   npx firebase deploy --only firestore:rules,firestore:indexes
   ```

4. Grant yourself admin access (needed for `/admin`): set `ADMIN_EMAILS` in `.env.local` to a comma-separated list of emails, sign up for an account with one of them, then run:

   ```bash
   npm run bootstrap:admins
   ```

   Sign out and back in afterwards so your session picks up the new `admin` custom claim.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build / start |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Unit tests (Vitest) |
| `npm run test:e2e` | End-to-end tests (Playwright) |
| `npm run bootstrap:admins` | Grant the `admin` custom claim to `ADMIN_EMAILS` |

## Data model

See the `Product`, `Order`, `Review`, etc. types in `src/types/firestore.ts` for the Firestore document shapes, and `firestore.rules` for who can read/write what. Orders are written server-side only (via `/api/paystack/initialize` and the webhook) — the client never writes prices or order status directly.

## Deploying

Connect the repo to Vercel and set the same environment variables from `.env.example` in the Vercel dashboard (scoped per environment — use a separate, non-production Firebase project for Preview deployments). Vercel Cron (configured in `vercel.json`) calls `/api/cron/abandoned-cart-reminder` every 6 hours; it authenticates via the `CRON_SECRET` env var, which Vercel automatically sends as a bearer token to cron routes when that variable is set.
