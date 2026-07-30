<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:session-summary -->
# Pascal & Pearls — Project Summary

## Stack
- Next.js 16, Tailwind CSS, Firebase Firestore (client SDK), Nodemailer

## Live URL
- https://pascal-and-pearls.vercel.app

## Auth
- Sign in via `/auth` page: name + email → OTP sent via Gmail SMTP → verify OTP
- `AuthContext` stores `{name, email}` in localStorage key `pnp_user`
- `AuthProvider` wraps `CartProvider` in layout

## Checkout Flow
1. Auth check (redirects to /auth if not signed in)
2. Shipping details (pincode: digits only, max 6; phone: digits only, max 10)
3. OTP verification (email OTP via `/api/send-otp`, verify via `/api/verify-otp`)
4. Payment — UPI (QR code + deep link + transaction ID) or Cash on Delivery

## API Routes
- `POST /api/send-otp` — generates 6-digit OTP, stores in Firestore `otps` collection (5 min expiry), sends via Gmail SMTP
- `POST /api/verify-otp` — checks OTP against Firestore, deletes on success
- `POST /api/create-order` — creates order in Firestore `orders` collection

## Key Files
- `src/app/admin/page.tsx` — admin dashboard (password: admin123), 4 tabs: Overview, Orders, Products, Users
- `src/app/auth/page.tsx` — sign in page
- `src/app/checkout/page.tsx` — full checkout with 4-step flow
- `src/context/AuthContext.tsx` — user state (login/logout)
- `src/context/CartContext.tsx` — cart state
- `src/app/api/send-otp/route.ts` — OTP email sender
- `src/app/api/verify-otp/route.ts` — OTP verifier, saves user to Firestore `users` collection when name provided
- `src/app/api/create-order/route.ts` — order creator
- `src/lib/firebase.ts` — Firebase client config
- `src/lib/orders.ts` — order types (`paymentMethod: "upi" | "cod"`)

## Env Vars (set on Vercel)
- Firebase: `NEXT_PUBLIC_FIREBASE_*` (in .env.local)
- Gmail SMTP: `SMTP_USER` (antonyabilash51@gmail.com), `SMTP_PASS` (app password)
- Turnstile: `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`

## UPI ID
- antonyabilash51-2@oksbi

## Notes
- PayPal fully removed
- Image fallback: `onError` handler replaces broken images with FALLBACK_IMG
- OTPs stored in Firestore with 5-min TTL, cleaned up on verify
- Firestore rules: products read-public/write-admin; orders create-public with validation, read-public
- Seed page at `/seed` has "Fix Product Images" button
## Design
- **Glassmorphism** — Custom CSS classes in `globals.css`: `glass`, `glass-strong`, `glass-header`, `glass-card`, `glass-drawer`, `glass-input`. Applied to cards, sections, headers, drawer, and all inputs across the site. Body has subtle radial gold/stone gradients for the glass to reveal.

## Recent Enhancements
- **Rate limiting** — `/api/send-otp` blocks repeat requests within 60s per email (in-memory Map)
- **My Orders page** (`/my-orders`) — lists orders filtered by `customerDetails.email`, links to order confirmation
- **Order confirmation email** sent to customer after placing order (via Gmail SMTP)
- **COD notification** — store owner receives email at SMTP_USER when a COD order is placed
- **OTP resend timer** — 60s countdown on auth + checkout pages before resend allowed
- **Shop search** — text input filters products by name/description
- **Navbar** — "Orders" link in desktop user menu + mobile menu when logged in
- **SEO** — root layout metadata set
- **PayPal** — all PayPal env vars removed from Vercel

## SEO (All Live)
- **Sitemap** (`src/app/sitemap.ts`) — dynamic XML sitemap with all static pages + product detail pages from Firestore
- **Robots** (`src/app/robots.ts`) — allows all crawlers, disallows `/admin`, `/seed`, `/api/`; points to sitemap
- **Root layout** — full OG + Twitter card + robots metadata
- **Per-page metadata** — home, about, collections (server components); shop via layout; product detail via `generateMetadata` in `shop/[id]/layout.tsx` (dynamic title/product name)
- **Next step to show up on Google**: Submit to [Google Search Console](https://search.google.com/search-console) — add property `https://pascal-and-pearls.vercel.app`, verify domain, submit sitemap URL `/sitemap.xml`

## Latest Session — Enhancements

### Admin Dashboard
- Created `/admin` page with password auth (admin123)
- 4 tabs: Overview (sales charts, counts), Orders (list + status management dropdown), Products (fetched from Firestore), Users (fetched), Coupons (create/list/delete)
- Order status updates via dropdown → updates Firestore + sends email notification to customer

### SEO & Discovery
- Dynamic sitemap.xml (`src/app/sitemap.ts`) — all static pages + product detail pages
- robots.txt (`src/app/robots.ts`) — allows all, disallows `/admin`, `/seed`, `/api/`; points to sitemap
- Root layout OG/Twitter card metadata
- Per-page metadata (home, about, collections as server components; shop via layout; product detail via `generateMetadata` in `shop/[id]/layout.tsx`)
- Google Search Console verification file at `/googleXXXXXX.html`

### WhatsApp & Newsletter
- Floating WhatsApp chat button — Phone: `918073379266`, message: "Hi Pascal & Pearls!"
- Newsletter signup form in footer → saves to Firestore `subscribers` collection

### Wishlist
- Context (`WishlistContext`) with localStorage persistence
- Heart toggle on product detail page
- `/wishlist` page listing all wishlist items
- Navbar heart icon with count badge

### Product Page Improvements
- **Lightbox** — click product image → fullscreen overlay with zoom/close
- **Related products** — shows 4 products from same category (excludes current product)
- **Recently Viewed** — stored in localStorage (max 8), shown on shop page
- **Sold out / Low stock badges** — on `ProductCard` (sold out if stock=0, low stock if ≤3)
- **Share on WhatsApp** — button on product detail page
- **Product reviews** — submit form + display list on product detail page, saved in Firestore `reviews` subcollection per product

### PWA
- `manifest.webmanifest` with name, description, theme colors, SVG icons (sizes 192/512)

### Coupons
- Admin creates coupons (code, discount %, expiry) saved to Firestore `coupons`
- Checkout applies coupon code → validates not expired, calculates discount

### Order Management
- Order status can be updated by admin → triggers email notification to customer
- **Stock deduction** — auto-deducts from `products.{id}.stock` on order placement
- **Order notes** — textarea in checkout form, saved to order in Firestore
- **Print invoice** — button on `/order-confirmation` page
- **Estimated delivery** — shown in checkout summary ("3-5 business days")

### Bug Fixes
- Fixed JSX nesting in checkout (missing grid div close after adding order notes textarea)

### Vercel
- Re-authenticated with `vercel login` (device code flow) after expired token — new session established

## Latest Session — Production Hardening

### Firestore Security Rules
- Complete rewrite of `firestore.rules` with field-level validation for every collection
- Orders: create with field validation (name, email, items, totalAmount), public read, update only `paymentStatus`
- Products: public read, admin write only (locked down)
- Users: no direct client access (blocked) — now fetched via `/api/admin/users`
- Reviews: public create with rating validation (1-5), public read
- Coupons: public read (checkout validation), no direct write
- Subscribers: create with email validation, no read/list
- OTPs: fully blocked from client access

### Admin Product CRUD
- New API route `/api/admin/products` with POST (create), PATCH (update), DELETE (delete)
- Admin Products tab now has: Add Product form, Edit (inline form), Delete (with confirmation), Search filter
- Products table shows ID, image, name, category, price, stock, featured status

### Fulfillment Status & Shipping Emails
- Separated `fulfillmentStatus` (pending → shipped → delivered → cancelled) from `paymentStatus`
- New `fulfillmentStatus` field on orders, set to "pending" on creation
- `update-order-status` API now handles both `paymentStatus` and `fulfillmentStatus` independently
- Sends customer emails for fulfillment updates — shipped ("Your order is on its way!"), delivered ("We hope you love it!"), cancelled
- Admin Orders tab shows both badges and separate button groups for payment & fulfillment

### Admin UX Improvements
- Search/filter on Orders (by ID, name, email, phone) with pagination (20 per page)
- Search/filter on Products (by name, category, ID)
- Search/filter on Users (by name, email)
- Fulfillment column added to Overview tab's recent orders table
- Expanded order view shows order notes, transaction ID, discount info

### Error Boundaries
- Root `error.tsx` with "Try Again" and "Go Home" buttons

### Image Optimization
- Updated `next.config.ts` with `qualities: [25, 50, 75, 100]` and QR code API remote pattern
- Converted `ProductCard` to use `next/image` with `fill` + `sizes` for automatic optimization
- Converted product detail page main image and thumbnails to `next/image`

## Latest Session — All 8 Features

### 1. Categories Management
- Admin Products tab has "Manage Categories" panel to add/remove category names stored in Firestore `categories` collection
- Product form category dropdown now sourced from Firestore (dynamic, not hardcoded)
- Shop page fetches categories from Firestore instead of hardcoded array
- `firestore.rules` updated with `categories` collection rule

### 2. Low Stock Alerts
- Overview tab shows products with stock ≤ 3 in a red-badged table
- Filtered from existing `products` prop passed to OverviewTab

### 3. CSV Export of Orders
- Orders tab has "Export CSV" button that generates CSV from `filtered` orders
- Columns: Order ID, Date, Customer Name, Email, Phone, Address, Items, Total, Payment Method, Payment Status, Fulfillment Status, Tracking, Notes, Discount
- Downloads via Blob + object URL

### 4. Admin Review Moderation
- New "Reviews" tab in admin (between Coupons and Content)
- Fetches all reviews from Firestore `reviews` collection
- Shows table: Product Name, Customer Name, Rating, Comment, Date
- Approve button sets `approved: true`, shows "Approved" badge when done
- Delete button removes review with confirmation
- `firestore.rules` updated for `reviews` collection

### 5. Order Timeline
- `src/lib/orders.ts`: Added `StatusEvent` interface, `statusHistory: StatusEvent[]` to Order
- `create-order` route: initial `statusHistory` set on creation (`[{status:"pending", timestamp, note:"Order placed"}]`)
- `update-order-status` route: appends to `statusHistory` on payment/fulfillment changes
- New `src/components/OrderTimeline.tsx`: visual timeline with icons (Clock, Truck, Check, X), colors, timestamps
- `/order-confirmation` page: shows timeline in order summary
- `/my-orders` page: shows timeline under each order card

### 6. Customer Self-Cancellation
- New `/api/cancel-order` route: validates cancellation within 30 min, fulfillment still "pending"
- Restores stock to products on cancellation
- Sends cancellation email to customer and notification to owner
- `/my-orders` page: "Cancel" button appears when within time window
- `cart` collection added to firestore.rules

### 7. Abandoned Cart Recovery
- `CartContext`: auto-saves cart to Firestore `carts/{email}` when items change and user is logged in
- New `/api/abandoned-cart` route: checks cart age (>3h), sends reminder email (once per 24h)
- `ClientLayout`: calls abandoned-cart check on every page load (once per session via sessionStorage)
- `firestore.rules`: carts collection rule added

### 8. Product Variants
- `src/lib/products.ts`: Added `ProductVariant` interface, `variants?: ProductVariant[]` to Product
- `Product` type: `variants: [{name: string, price?: number, stock?: number}]`
- Admin products API: supports `variants` field in POST/PATCH
- Product detail page (`shop/[id]/page.tsx`): pill-style variant selector between price and description
  - Shows variant name + price difference ("Base" if ₹0, "+₹XXX" otherwise)
  - Selected variant is filled bg-charcoal, others bordered
  - Display price updates to base + variant price
  - Add to Cart includes variant name in item name
- `CartContext`: `CartItem` now has `variant?: string`, reducer matches on productId+variant key
  - `addItem`, `removeItem`, `updateQuantity` all support variant parameter
- `CartDrawer`: updateQuantity/removeItem calls pass variant (optional, backward compatible)

### New Files Created
- `src/app/api/admin/content/route.ts` — site content save API
- `src/context/SiteContentContext.tsx` — site content provider/hook
- `src/app/api/cancel-order/route.ts` — customer cancellation API
- `src/components/OrderTimeline.tsx` — order timeline component
- `src/app/api/abandoned-cart/route.ts` — abandoned cart reminder API
<!-- END:session-summary -->
