# 08 — Troubleshooting & FAQ

## Login and access

| Symptom | Fix |
|---------|-----|
| Returned to `/login?error=1` | Wrong email or password. Emails are lowercase — retype carefully. |
| Redirect loop to `/login` | Cookies blocked (often private mode). Allow cookies and retry. |
| Staff sees only 5 links | Expected — Dashboard, Plans, Users, Settings are owner-only. |
| `UNAUTHORIZED` / `FORBIDDEN` message | Session expired, or staff used an owner-only action. Re-login as owner. |

## Daily-flow errors

- `Name and phone required` — fill both starred fields on the new-customer form.
- `Duplicate phone — already: X` — open X's profile; never create a second row.
- `Visit not open` — the visit was already checked out or voided; refresh **Visits**.
- `Staff can void only within 24h` — ask the owner to void older visits.
- `Not found` — stale link; search again for the customer.
- Day Close missing a payment — you crossed midnight (today-only view);
  owners check the 30-day Dashboard.
- `Cannot deactivate yourself` — another owner must deactivate you.

## Data and deployment

- Database errors (`ECONNREFUSED`, authentication failed): check `DATABASE_URL`.
  Docker dev uses `postgres://gamecrm:gamecrm_dev@db:5432/gamecrm`;
  `docker compose ps` must show `db` as healthy.
- Fresh database has no login: run `npm run db:push` then `npm run db:seed`
  inside Docker to create the owner, plans, rates, and demo customer.
- Vercel shows database errors after manual deploy: set `DATABASE_URL`
  (Neon pooled URL), `AUTH_SECRET` (32+ characters), and `AUTH_URL`
  (your Vercel URL) in project environment variables, redeploy, then seed once.
- CSV export says `Forbidden` — you are signed in as staff; use an owner account.
- Passes never expire — call `GET /api/cron/daily` manually and check statuses.

## Frequently asked questions

- **Table booking / reservations?** Not included — station is a free-text tag only.
- **GST invoices or online payment gateway?** Not included — record takings manually.
- **Offers, loyalty points, SMS reminders?** Not included — use the expiring list
  and Top-10 CSV for manual outreach.
- **Multiple branches?** Not supported — single parlour.
- **Fully deleting a customer?** Use Anonymize (owner) — history stays for reports.
- **Fixing a wrong amount?** No edit screen — void the visit if applicable and
  record a correcting payment; the audit log keeps both entries.
- **Customers under 18?** Date of birth is optional and there is no consent flow —
  record minors' data only with proper guardian consent per local law.
