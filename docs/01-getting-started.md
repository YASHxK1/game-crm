# 01 — Getting Started

## Opening the app

- Local Docker (dev or prod): `http://localhost:3000`
- Vercel: your `https://<project>.vercel.app` URL

If you are signed out you land on `/login`. Once signed in, `/` redirects
automatically: owners go to `/dashboard`, staff go to `/checkin`.

## Logging in (`/login`)

1. Enter your staff email and password.
2. Press **Sign in**.
3. A failed login returns you to `/login?error=1` — check the email spelling
   (emails are stored lowercase) and retype the password.

Sessions use secure httpOnly cookies carrying your role. If an owner
deactivates your account in **Users**, your next login is blocked.

## Navigation

The top header shows only the pages your role may use, plus your
`email (role)` and an **Out** button that signs you out.

- Staff links: Check-in, Customers, Visits, Payments, Day Close
- Owner links add: Dashboard, Plans, Users, Settings

Every button and page re-checks your role on the server — hiding a link is
never the only protection.

## First-day checklist (owner)

1. Sign in with the seed account (`owner@parlour.local` / `Owner@123`).
2. Open **Users** and create your real owner account plus one staff account.
3. Open **Settings** and confirm station rates
   (e.g. `PS5 ₹150/h`, `PC ₹100/h`, `General ₹80/h`).
4. Open **Plans** and confirm the passes
   (`Weekly ₹349/7d`, `Monthly ₹999/30d`, `Quarterly ₹2499/90d`).
5. Open **Customers**: create a test profile, sell it a plan,
   check it in and out, record a test payment.
6. Open **Day Close** and confirm the totals match your test payment,
   then void the test visit in **Visits**.
7. Deactivate the seed account (or change its password).

## Conventions used in the app

- Money is shown in whole rupees (`₹1,000` style, paise stored in the database).
- Membership dates are day-granular (`YYYY-MM-DD`).
- IDs on screen are shortened to the first 8 characters; full IDs are in CSV exports.
- Empty exports download a file containing the word `empty`.
