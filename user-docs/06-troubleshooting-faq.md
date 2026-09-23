# 06 — Troubleshooting & FAQ

## Login problems

| Symptom | Cause → Fix |
|---------|-------------|
| Back on `/login?error=1` | Wrong email/password. Email is lowercased at signup — retry exact case; reset via owner creating a new user. |
| Redirect loop `/` → `/login` | No session cookie (private mode / blocked cookies). Allow cookies, retry. |
| Staff sees only 5 links | Correct — Dashboard/Plans/Users/Settings are admin-only by server check. |
| `UNAUTHORIZED` / `FORBIDDEN` text | Session expired or staff hitting admin action. Re-login; owners only for that button. |

## Daily-flow errors

- `Name and phone required` — fill both starred fields in New customer.
- `Duplicate phone — already: X` — open X's profile; do not create a second row.
- `Visit not open` on checkout — already checked out or voided; refresh `/visits`.
- `Staff can void only within 24h` — ask owner to void older visits.
- `Not found` on profile/visit — bad/old UUID link; re-search.
- Payment recorded but Day Close unchanged — you crossed midnight; Day Close is today-only. Owner checks Dashboard 30d.
- `Cannot deactivate yourself` — ask another admin to deactivate you.

## Data & deploy

- DB connection errors (`ECONNREFUSED`, `password authentication failed`): check
  `DATABASE_URL` — compose dev uses `postgres://gamecrm:gamecrm_dev@db:5432/gamecrm`;
  host tooling uses `...@localhost:5432/...`. `docker compose ps` must show `db` healthy.
- Fresh DB has no login: run `npm run db:push` then `npm run db:seed` (creates owner/plans/rates/demo customer).
- Vercel runtime DB errors after manual deploy: set `DATABASE_URL` (Neon pooled),
  `AUTH_SECRET` (≥32 chars), `AUTH_URL` (vercel URL) in project env, redeploy, then seed Neon once.
- CSV export `Forbidden` — staff account; login as admin. `Unknown type` — use only the four listed links.
- Cron not expiring passes — hit `GET /api/cron/daily` manually and check `memberships.status`.

## FAQ

**Booking/reservations?** Non-goal in MVP — station is a free-text tag, no slot logic.
**GST invoices / online payments?** Non-goal — log cash/UPI/card manually; no gateway.
**Offers/points/SMS?** Non-goal (v2.0). Use expiring list + Top-10 CSV for manual outreach.
**Multi-branch?** No — single parlour, no branch column.
**Delete a customer fully?** Use Anonymize (admin) — preserves visit/revenue history for reports.
**Change a past amount?** No edit UI — void the visit if applicable and record a correcting transaction; audit log keeps both.
**Minors/DOB?** DOB optional; no guardian-consent flow in MVP — record only with consent per local law.
