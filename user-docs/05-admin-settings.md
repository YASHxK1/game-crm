# 05 — Admin: Plans, Rates, Staff, Settings

All pages below require `admin`; staff are redirected to `/day-close`.

## Plans (`/plans`)

Validity plans only. **Create** form: Name*, Price ₹*, Validity days* (1–730, default 30).
Inserts with `type='validity'`, `active=true`. Table shows Name, Price, Days, Active.
Deactivation is DB-level (no UI toggle in MVP — set `active=false` in DB or add a toggle later).

## Settings (`/settings`) — station rates

Fixed pricing list backing the check-in dropdown and payment hint.
**Save** form: Label* (`PS5`/`PC`/`General`, unique), ₹/hour*.
Upsert logic: existing label → price updated; new label → inserted, `active=true`.
Table shows Label, ₹/hour. Note under it confirms `INR · English · Cash/UPI/Card/Other · Cron path`.

## Users (`/users`)

Grid form: Name*, Email* (lowercased, unique), Password* (min 6, bcrypt-hashed, cost 10),
Role (`staff`/`admin`). **Create user** → active immediately.
Table: Name, Email, Role, Active, Action (**Deactivate**; blocks future logins;
cannot deactivate yourself — error `Cannot deactivate yourself`).

## Settings notes & cron

- Currency/modes/language are fixed constants in forms + `Settings` note (no i18n table yet).
- Nightly job: `GET /api/cron/daily` → `cronDaily()` in `lib/actions.ts`
  (expires past-due, marks ≤7-day as expiring). Vercel schedule in `vercel.json`:
  `30 2 * * *`. Locally trigger with `curl http://localhost:3000/api/cron/daily`.
- Audit: `audit_log` rows on customer create, visit checkout/void, membership sell,
  with `actor_id`, entity/action, before/after JSON. No UI viewer in MVP — query DB directly.
