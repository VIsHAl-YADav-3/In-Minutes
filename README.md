# In Minutes — Multi-Restaurant Food Delivery Platform

A full-stack MERN food delivery platform: customers browse restaurants, order food, pay via Razorpay or COD, and track delivery in real time. Sellers onboard their own restaurant and menu (flexible, up to 50 items). Admins approve restaurants and oversee the platform. Includes a live AI support chatbot ("Vishal").

## Stack

- **Frontend:** React + Vite + Tailwind CSS, React Router, Socket.io client
- **Backend:** Node.js + Express, MongoDB + Mongoose, JWT auth, Socket.io
- **Payments:** Razorpay (online) + Cash on Delivery
- **Images:** Cloudinary
- **AI:** Vishal chatbot (Claude API, with a built-in rule-based fallback so it works without any key)

## Project structure

```
in-minutes/
  backend/      Express API (MongoDB, auth, restaurants, food, orders, payments, AI, admin)
  frontend/     Vite + React client
```

## 1. Prerequisites

- Node.js 18+
- A MongoDB database — [MongoDB Atlas](https://www.mongodb.com/atlas) free tier works well
- A [Cloudinary](https://cloudinary.com) account (free tier) for image uploads
- A [Razorpay](https://razorpay.com) account in **test mode** for payments
- (Optional) An Anthropic API key for smarter Vishal AI replies — without one, Vishal still works using a built-in rule-based responder

## 2. Backend setup

```bash
cd backend
cp .env.example .env
# edit .env and fill in MONGO_URI, JWT_SECRET, CLOUDINARY_*, RAZORPAY_*, AI_API_KEY
npm install
npm run dev        # starts on http://localhost:5000
```

Create an admin account (reads `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`):

```bash
node utils/seedAdmin.js
```

Health check: `GET http://localhost:5000/api/health`

## 3. Frontend setup

```bash
cd frontend
cp .env.example .env
# edit .env if your backend runs somewhere other than localhost:5000
npm install
npm run dev         # starts on http://localhost:5173
```

## 4. Trying it out

1. Register a customer account at `/register`.
2. Click **Become a Seller** (profile menu or nav) → fill in restaurant details + upload cover/profile images → you're redirected to **Add Food Menu**.
3. Add as many food items as you like (1–50, no minimum) with images, price, category.
4. Log in as the seeded admin (`/login`) → go to **Admin → Restaurants** → approve the new restaurant so it goes live for customers.
5. Browse as a customer, add items to cart, checkout with Razorpay (test card `4111 1111 1111 1111`, any future expiry/CVV) or Cash on Delivery.
6. Track the order, and once delivered, leave a review.
7. Try the **Help** button any time to chat with Vishal.

## 5. Deployment notes (performance-focused)

The spec calls out fast loading and avoiding cold starts — a few concrete choices:

- **Backend:** deploy somewhere with minimal cold-start latency (Render/Railway "always on" tier, or a small VPS). Avoid free tiers that fully spin down between requests if you can — cold starts are the #1 cause of "slow to open" complaints. Health check endpoint (`/api/health`) is provided for uptime monitors/keep-alive pings.
- **Frontend:** deploy the Vite build (`npm run build` → `dist/`) to Vercel/Netlify/Cloudflare Pages — these serve static assets from a CDN with no cold start at all.
- **Images:** already routed through Cloudinary with automatic format/quality optimization and lazy `loading="lazy"` on all `<img>` tags.
- **Code splitting:** Seller dashboard, Admin dashboard, and Become-a-Seller are all `React.lazy`-loaded so the initial customer-facing bundle stays small.
- **Database indexes:** text indexes on restaurant/food name+category+location, plus indexes on seller/restaurant/order-status fields for fast queries — see the `models/` files.

Set `CLIENT_URL` in the backend `.env` to your deployed frontend URL (for CORS + Socket.io), and `VITE_API_URL` / `VITE_SOCKET_URL` in the frontend `.env` to your deployed backend URL.

## 6. Key implementation notes

- **50-item cap, no minimum:** enforced server-side in `foodController.addFood` (checked against a live count, not a stored counter that could drift) and reflected live in the seller UI as "Food Items: X / 50".
- **Restaurant approval workflow:** creating a restaurant sets `approvalStatus: pending`; it's excluded from public listings until an admin approves it. Sellers can still add their menu while pending.
- **Safe deletion:** deleting a restaurant soft-deletes it and cascades a soft-delete to its food items — no orphan records, and "Delete All Restaurants" degrades gracefully to the empty state rather than crashing.
- **Payment integrity:** Razorpay orders are only turned into real `Order` documents after signature verification server-side (HMAC-SHA256) — the client never gets to declare "payment succeeded" on its own.
- **Every empty state** (no restaurants, no food, empty cart, no orders, no notifications, no search results) has a dedicated, on-brand component rather than a blank screen.

## 7. What's a starting point vs. done

This is a complete, working full-stack skeleton covering every feature in the spec end-to-end — not a mockup. That said, for a real production launch you'd want to layer on: automated tests, image size/type validation hardening, refresh tokens, pagination on a few more admin lists, and a proper CI/CD pipeline. The architecture is built to make all of that straightforward to add.
