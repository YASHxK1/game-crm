# 03 — Customers & Memberships

## A. Customers (`/customers`, `/customers/[id]`)

List page:

- Search box (same partial phone/name logic as check-in).
- **New customer** card: Name*, Phone* (unique), Email, DOB (date, optional),
  Tags (comma-separated, max 10, e.g. `PS5, tournament regular`), Notes.
- **Create** → audit-logged; redirects to `/customers/[id]`.
- Duplicate phone is blocked: `Duplicate phone — already: <name>`.

Profile page (`/customers/[id]`):

- Header: name + phone. Summary card: total spend (sum of linked transactions),
  visit count, tags, notes.
- **Memberships** table: plan short-ID, start, end, Status badge
  (`Active` green / `Expiring` amber ≤7 days / `Expired` red, computed in `lib/utils.ts`).
- **Sell plan** row: dropdown of active plans (`name ₹price / validityDays d`) + **Sell plan**.
  Creates: `memberships` row (`start=today`, `end=today+validityDays`),
  `membership_ledger` entry (`sold:<plan>`), auto `transactions` row
  (Cash/Membership), and audit log.
- **Visits** (last 20) and **Payments** (last 20) tables.
- Owner-only **Anonymize (GDPR delete)**: rewrites name→`Deleted`,
  phone→`deleted-<8 chars>`, clears email/DOB/notes/tags. Visits/transactions keep
  anonymised foreign keys for reports.

## B. Membership model (validity-pass only)

Locked decision: no hours balance in MVP. `hours_included` column exists but unused.

- `membership_plans`: name, price, `type='validity'`, `validity_days`, `active`.
- `memberships`: customer, plan, `start_date`, `end_date`, `status`
  (`active`/`expiring`/`expired`).
- `membership_ledger`: append-only (`membership_id`, `reason`, `created_by`).

Lifecycle:

1. Sell → `active`.
2. Nightly `GET /api/cron/daily` (Vercel cron `30 2 * * *`, see `vercel.json`):
   `end < today` → `expired`; `today ≤ end ≤ today+7` → `expiring`.
3. **Dashboard → Expiring / expired** table surfaces renewals (top 10).

Renewal = sell the same/another plan again (no separate renew button; history preserved).

## C. Finding people fast

- Always search by phone first (indexed, <300ms target); fall back to name.
- Open profiles by clicking the underlined name in Check-in or Customers.
- Tags are free-text array — keep a short controlled vocabulary
  (`PS5`, `PC`, `regular`, `tournament`) so filtering by eye stays useful.
