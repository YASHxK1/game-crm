# 06 — Owner Dashboard & Reports (`/dashboard`, owner only)

Staff who open this page are redirected to `/day-close`.

## Today cards

Today's revenue (sum of today's payments), today's visits, new customers
today, and active members (passes with more than 7 days remaining).

## Charts (last 30 days)

- **Revenue (30d)** — line chart of daily totals, for trend and pricing decisions.
- **Visits by hour (30d)** — bar chart of check-ins per hour, for peak analysis
  and staffing decisions.

## Tables

- **Expiring / expired (top 10)** — customer short ID, pass end date,
  status badge. Use it for renewal reminders.
- **Top 10 (30d)** — customers ranked by spend over the last 30 days.

## CSV exports

Admin-only download links call `/api/exports/<type>`:

| Link | Contents | Row limit |
|------|----------|-----------|
| `customers.csv` | Customer profiles | 5,000 |
| `visits.csv` | Check-in/out records | 10,000 |
| `transactions.csv` | Payments | 10,000 |
| `memberships.csv` | Passes | 5,000 |

Staff get `Forbidden` on these URLs; unknown types return an error.
The dashboard window is fixed at today + 30 days — for custom ranges,
filter the CSV in a spreadsheet.
