# 04 — Owner Dashboard & Reports (`/dashboard`, admin only)

Staff hitting `/dashboard` are redirected to `/day-close`.

## Cards (today)

Today revenue (sum of today's `transactions`), Today visits (count),
New customers (count), Active members (memberships with `End` ≥ today+7, max 5000 scanned).

## Charts (last 30 days, Recharts client components)

- **Revenue (30d)**: line chart from
  `SELECT to_char(created_at,'YYYY-MM-DD'), SUM(amount) … GROUP BY 1`.
- **Visits by hour (30d)**: bar chart from
  `SELECT to_char(check_in,'HH24')||':00', COUNT(*) … GROUP BY 1` — use for peak/staffing decisions.

## Tables

- **Expiring / expired (top 10)**: customer short-ID, end date, status badge.
- **Top 10 (30d)**: `customers LEFT JOIN transactions` grouped, ordered by spend desc.
- **Exports**: links to `/api/exports/<type>` → server-generated CSV download:
  `customers.csv`, `visits.csv`, `transactions.csv`, `memberships.csv`
  (limits 5k/10k/10k/5k rows). Admin-only (403 otherwise); unknown type → 400.

## Date ranges & performance

Current MVP fixes the window at 30 days + today. Custom ranges and paginated exports
are not yet in UI — filter the CSV in Sheets/Excel. Indexes on
`transactions(created_at)`, `visits(check_in)`, `customers(phone)` keep the
dashboard under the 2s p95 target at ~10k visits.
