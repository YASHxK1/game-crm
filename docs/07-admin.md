# 07 — Admin: Rates, Staff, Settings

All pages in this file require the owner (`admin`) role.

## Station rates (`/settings`)

The fixed price list behind the check-in dropdown and the payment hint.
The **Save** form takes a Label (`PS5` / `PC` / `General`, unique) and a
₹-per-hour price. Saving an existing label updates its price; a new label
creates a row. The table lists every label with its hourly price, and a note
confirms the fixed settings: INR currency, English, Cash/UPI/Card/Other modes,
and the cron path.

## Staff accounts (`/users`)

The form creates an account with Name, Email (stored lowercase, must be unique),
Password (minimum 6 characters, securely hashed), and Role (`staff`/`admin`).
New accounts are active immediately. The table lists every user with a
**Deactivate** button, which blocks future logins. You cannot deactivate your
own account (`Cannot deactivate yourself`) — ask another owner to do it.

## Nightly job and audit

- `GET /api/cron/daily` marks passes ending before today as `expired`
  and passes ending within 7 days as `expiring`. Vercel runs it nightly
  (`30 2 * * *` in `vercel.json`); locally trigger it with
  `curl http://localhost:3000/api/cron/daily`.
- The audit log records customer creation, visit check-outs and voids,
  and membership sales with the actor, entity, action, and before/after
  values. There is no on-screen audit viewer yet — query the `audit_log`
  table directly when investigating.
