# Pascal & Pearls — Complete Project Documentation

## Overview

**Pascal & Pearls** is a full-stack e-commerce PWA (Progressive Web App) for artisan handcrafted beaded jewelry and artificial pearl sets. Built with Next.js 16, Firebase Firestore, and Tailwind CSS.

**Live URL:** https://pascal-and-pearls.vercel.app

---

## 1. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.12 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 (glassmorphism design) |
| Database | Firebase Firestore (client SDK v12) |
| Authentication | OTP-based via Gmail SMTP (Nodemailer) |
| Payments | UPI (QR + deep link) + Cash on Delivery |
| Storage | Firebase Storage (product images) |
| Deployment | Vercel (production) |
| Email | Gmail SMTP (`antonyabilash51@gmail.com`) |
| SEO | Dynamic sitemap, robots.txt, OG tags, Bing/GSC verified |

---

## 2. Project Setup

### 2.1 Initial Setup
```bash
npx create-next-app@latest pascalandpearls --typescript --tailwind --eslint
cd pascalandpearls
```

### 2.2 Dependencies Installed
```bash
npm install firebase
npm install lucide-react
npm install nodemailer
npm install @types/nodemailer
```

### 2.3 Firebase Configuration
- Firebase project `pascalandpearls` created
- Firestore database enabled (production mode)
- Firebase config stored in `.env.local`
- `service-account-key.json` for admin operations
- Firestore security rules in `firestore.rules`

### 2.4 Environment Variables (`.env.local`)
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
SMTP_USER=antonyabilash51@gmail.com
SMTP_PASS=...
NEXT_PUBLIC_TURNSTILE_SITE_KEY=...
TURNSTILE_SECRET_KEY=...
NEXT_PUBLIC_SITE_URL=https://pascal-and-pearls.vercel.app
```

---

## 3. Features Implemented

### 3.1 Core E-Commerce
- **Product Catalog** — Firestore-backed with categories, search, price sorting
- **Product Detail** — Image lightbox, variant selector, reviews, related products, recently viewed
- **Shopping Cart** — localStorage + Firestore sync, drawer + full page
- **Checkout** — 4-step flow: Auth → Shipping → OTP → Payment (UPI/COD)
- **Order Management** — Full lifecycle: pending → shipped → delivered → cancelled

### 3.2 Admin Dashboard (`/admin`, password: `admin123`)
- **Overview** — Sales stats, revenue, order counts, low stock alerts
- **Orders** — List, search, filter, paginate, update payment/fulfillment status, CSV export
- **Products** — Add/edit/delete products, manage categories, variants
- **Coupons** — Create discount codes with expiry
- **Reviews** — Moderate (approve/delete) product reviews
- **Content** — Edit hero banner, announcement bar, about section, footer
- **Users** — View registered users

### 3.3 Real-Time Updates (Latest Session)
All pages use Firestore `onSnapshot` listeners instead of one-time `getDocs()`:
- Admin dashboard updates instantly when orders/products/content change
- Shop page shows new products and price changes immediately
- Product detail page reflects edits in real-time

### 3.4 User Features
- **Auth** — Name + email → OTP via email → auto-login
- **Wishlist** — Heart toggle, localStorage-persisted, `/wishlist` page
- **My Orders** — Order history with timeline, self-cancellation within 30 min
- **Abandoned Cart Recovery** — Auto-email reminders after 3 hours
- **Coupons** — Apply discount codes at checkout
- **WhatsApp** — Floating chat button + share on product pages

### 3.5 Legal & Compliance
- **Privacy Policy** — `/privacy` — data collection, usage, cookies, rights
- **Terms of Service** — `/terms` — pricing, cancellations, liability
- **Cookie Consent** — Bottom banner with accept button, links to legal pages
- **Footer Links** — Privacy, Terms, Contact in footer

### 3.6 SEO & Discovery
- **Sitemap** — Dynamic XML at `/sitemap.xml` (all static pages + products)
- **Robots.txt** — At `/robots.txt`, disallows `/admin`, `/seed`, `/api/`
- **Google Search Console** — Verification file at `/google79b2198e3c088e8f.html`
- **Bing Webmaster Tools** — Meta tag `msvalidate.01`
- **IndexNow** — API key file at root
- **Open Graph** — Title, description, image, URL, site name, locale
- **Twitter Cards** — Summary large image with title, description, image
- **Meta Keywords** — 12 relevant jewelry keywords
- **metadataBase** — Set to production URL

### 3.7 PWA
- **Manifest** — Name, short name, description, categories, screenshots, icons
- **Display** — `standalone` mode
- **Theme** — `#3a3a3a`, background `#faf8f5`
- **Icons** — 192px and 512px SVG icons

---

## 4. Database Structure (Firestore Collections)

```
products/           — Product catalog
  {id}:
    name, price, description, images[], category, stock,
    featured, material, variants[], createdAt

orders/             — Customer orders
  {id}:
    items[], customerDetails{}, shippingAddress{},
    totalAmount, paymentMethod, paymentStatus,
    fulfillmentStatus, statusHistory[], createdAt

users/              — Registered users
  {id}:
    name, email, createdAt

coupons/            — Discount codes
  {id}:
    code, discountPercent, expiresAt

reviews/            — Product reviews
  {id}:
    productId, productName, userName, rating, comment,
    approved, createdAt

categories/         — Product categories
  {id}:
    name

siteContent/        — Dynamic CMS content
  hero/, announcement/, about/, footer/

carts/              — Abandoned cart recovery
  {email}:
    items[], updatedAt

subscribers/        — Newsletter subscribers
  {id}:
    email, subscribedAt

otps/               — One-time passwords (5-min TTL)
  {email}:
    otp, expiresAt
```

---

## 5. API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/send-otp` | POST | Send OTP email (rate-limited 60s) |
| `/api/verify-otp` | POST | Verify OTP, create user |
| `/api/create-order` | POST | Place order, deduct stock, send emails |
| `/api/cancel-order` | POST | Cancel within 30 min, restore stock |
| `/api/update-order-status` | PATCH | Update payment/fulfillment status |
| `/api/admin/products` | POST/PATCH/DELETE | Product CRUD |
| `/api/admin/users` | GET | List users |
| `/api/admin/content` | POST | Save site content |
| `/api/coupons` | GET/POST | Validate/create coupons |
| `/api/reviews` | GET/POST | Submit/list reviews |
| `/api/abandoned-cart` | POST | Check cart age, send reminder |

---

## 6. Key Pages

| Route | Page | Type |
|-------|------|------|
| `/` | Home — Hero + Collections + About | Server |
| `/shop` | Product listing with filters + sort | Client |
| `/shop/[id]` | Product detail — images, variants, reviews | Client |
| `/cart` | Shopping cart | Client |
| `/checkout` | 4-step checkout flow | Client |
| `/auth` | Sign in (name + email → OTP) | Client |
| `/wishlist` | Saved items | Client |
| `/my-orders` | Order history | Client |
| `/order-confirmation` | Post-order success + timeline | Client |
| `/collections` | Collection showcase | Server |
| `/about` | About the brand | Server |
| `/contact` | Contact/support page | Server |
| `/privacy` | Privacy policy | Server |
| `/terms` | Terms of service | Server |
| `/admin` | Admin dashboard (password: admin123) | Client |
| `/seed` | Database seeding UI | Client |

---

## 7. Marketing Materials

All launch materials are in the `marketing/` folder:
- `launch-post.md` — Instagram, Facebook, Twitter, Email drafts
- `producthunt-draft.md` — Product Hunt listing

---

## 8. Deployment

1. Push to GitHub
2. Connect repo to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy
5. Add custom domain
6. Submit sitemap to Google Search Console + Bing Webmaster Tools

---

## 9. Future Improvements

- [ ] Add product image upload directly from admin
- [ ] Implement stock management notifications
- [ ] Add order tracking with tracking numbers
- [ ] Build a blog for SEO content
- [ ] Add social media links to footer
- [ ] Create referral/affiliate program
- [ ] Implement advanced analytics
- [ ] Add multi-language support
- [ ] Create native mobile app wrapper

---

## 10. Session Summary (Latest)

**What was done in the final session:**
- Converted all data fetching to Firestore `onSnapshot` for real-time updates
- Created Privacy Policy, Terms of Service, Contact pages
- Added Cookie Consent banner
- Updated PWA manifest with categories and screenshots
- Added OG image, Twitter image, meta keywords
- Added Bing Webmaster Tools verification
- Added IndexNow API key file
- Created marketing launch materials
- Fixed desktop path resolution for all action modules
- Switched JARVIS voice assistant to opencode/big-pickle
- Clean build — 32 pages, zero errors
