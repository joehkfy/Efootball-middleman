# eFootball Middleman - Phase 1 MVP

Safe middleman marketplace for buying & selling eFootball accounts, coins and items.

**Supabase is already fully set up for you!**

## Features (Phase 1)

- User registration & login
- Create listings (pending admin approval)
- Browse active listings with search & filters
- Buy flow → creates order
- Manual payment + proof
- Order status tracking
- Real-time chat (buyer ↔ seller ↔ admin)
- Admin dashboard (approve listings, manage orders)

## Tech Stack

- Next.js 14 (App Router)
- Tailwind CSS
- Supabase (Auth + Database + Realtime) — **already configured**

## Quick Start

### 1. Install & Run Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

The `.env.local` file already contains the correct Supabase keys.

### 2. Make Yourself Admin

1. Register an account on the site
2. Go to your Supabase project: https://supabase.com/dashboard/project/agsgbfehfvkkyqryeprq
3. Table Editor → `profiles`
4. Find your user and change `role` from `user` to `admin`

### 3. Deploy to Netlify

1. Push this folder to a GitHub repository
2. Go to https://app.netlify.com → Add new site → Import from Git
3. Select the repo
4. Build settings (usually auto-detected):
   - Build command: `npm run build`
   - Publish directory: `.next`
5. **Add Environment Variables** in Netlify (Site settings → Environment variables):

   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://agsgbfehfvkkyqryeprq.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnc2diZmVoZnZra3lxcnllcHJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIyMzUyOTgsImV4cCI6MjEwNzgxMTI5OH0.ptc6DtgWPdaxz6fq-HZNRquedYfOYJXbRU_BTAzylbc` |

6. Deploy!

## How a Deal Works

1. Seller creates listing → status = pending
2. Admin approves → status = active
3. Buyer clicks "Buy Now" → order created (pending_payment)
4. Buyer pays admin manually and clicks "I have paid" + pastes proof
5. Order moves to waiting_admin
6. Admin confirms payment → in_progress
7. Seller transfers account (via chat)
8. Buyer confirms → Admin marks completed
9. Admin pays seller (minus 8% commission)

## Commission

Default is 8% (change in `src/lib/supabase.ts` → `COMMISSION_RATE`)

## Supabase Project

- Project ID: `agsgbfehfvkkyqryeprq`
- Region: eu-west-3
- Dashboard: https://supabase.com/dashboard/project/agsgbfehfvkkyqryeprq

All tables, RLS policies and Realtime are already created.
