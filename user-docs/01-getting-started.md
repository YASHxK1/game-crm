# 01 — Getting Started

## 1. Open the app

- Local Docker dev: `http://localhost:3000`
- Local Docker prod: `http://localhost:3000` (via `docker-compose.prod.yml`)
- Vercel: your `https://<project>.vercel.app` URL

You land on `/login` if signed out, otherwise `/` redirects:
`admin` → `/dashboard`, `staff` → `/checkin`.

## 2. Log in

1. Go to `/login`.
2. Enter staff email + password → **Sign in**.
3. On failure you return to `/login?error=1` — recheck email case (stored lowercase) and password.

Sessions are JWT httpOnly cookies with role (`admin`/`staff`). Deactivating a user
in `/users` blocks their next login; existing sessions stop authorising admin pages.

## 3. Header navigation

Top bar shows only what your role allows:

- Staff: Check-in, Customers, Visits, Payments, Day Close
- Admin adds: Dashboard, Plans, Users, Settings
- Right side shows `email (role)` + **Out** button (`/api/signout`).

All pages are server-rendered; every action re-checks your role server-side,
not just by hiding links.

## 4. First-day checklist (owner)

1. Login as seed admin, go to **Users** → create your real owner account + one staff account.
2. **Settings** → save station rates: `PS5 ₹150/h`, `PC ₹100/h`, `General ₹80/h` (edit anytime).
3. **Plans** → verify `Weekly ₹349/7d`, `Monthly ₹999/30d`, `Quarterly ₹2499/90d`; add your own.
4. **Customers** → create 2–3 test profiles, sell a test membership, check in/out, record a test payment.
5. **Day Close** → confirm totals by mode match the test payments, then void the test visit in **Visits**.
6. Deactivate the seed account or change its password.

## 5. Conventions used everywhere

- Money: INR `₹`, whole rupees in most views (paise stored in DB).
- Dates: `en-IN` locale; membership dates are `YYYY-MM-DD` day-granular.
- IDs shown truncated (first 8 chars) — full UUIDs are in exports.
- Empty tables show headers only; exports of empty tables return a file containing `empty`.
