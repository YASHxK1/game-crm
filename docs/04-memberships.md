# 04 — Memberships (Validity Passes)

This parlour uses validity passes only: a pass is valid between a start date
and an end date. There is no hours balance to track.

## Plans (`/plans`, owner only)

Each plan has a name, a price in rupees, and a validity length in days
(1–730). The seeded plans are `Weekly ₹349/7d`, `Monthly ₹999/30d`,
and `Quarterly ₹2499/90d`. Create new plans with the form at the top;
the table below lists every plan with its price, days, and active flag.

## Selling a pass (from a customer profile)

1. Open the customer (`Customers` → click the name).
2. In the **Memberships** card, pick a plan from the dropdown
   (`name ₹price / days`) and press **Sell plan**.
3. The app creates the membership (`start = today`,
   `end = today + validity days`), appends a `sold:<plan>` entry to the
   append-only membership ledger, auto-creates a Cash/Membership payment,
   and writes an audit entry.

Do not record a second manual payment for the same sale — the transaction
already exists in **Payments** and **Day Close**.

## Statuses and the expiring list

- `Active` — more than 7 days remain.
- `Expiring` — 7 days or fewer remain (amber badge).
- `Expired` — past the end date (red badge).

Every night the `GET /api/cron/daily` job refreshes these statuses
(Vercel runs it at 02:30 via `vercel.json`). The **Dashboard** shows an
**Expiring / expired** table for renewal follow-ups.

## Renewals

Renewal means selling the same (or another) plan again from the profile —
there is no separate renew button, so the full pass history is preserved.
