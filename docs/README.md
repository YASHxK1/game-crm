# Gaming Parlour CRM — User Manual

Staff-only web app for a single gaming parlour: customer lookup, check-in/out,
validity memberships, payments, day-close, and an owner dashboard.
Dark theme (white text on black), mobile-first (usable at 360px),
English language, INR (₹) currency.

## Roles

| Role | Can access |
|------|-----------|
| Counter staff (`staff`) | Check-in, Customers, Visits, Payments, Day Close (today only) |
| Owner (`admin`) | Everything staff can, plus Dashboard, Plans, Users, Settings, CSV exports |

Default seeded owner account: `owner@parlour.local` / `Owner@123`.
Change it after first login (create a real admin in Users, deactivate the seed).

## Contents

1. `01-getting-started.md` — login, navigation, first-day checklist
2. `02-checkin-visits.md` — customer search, check-in/out, walk-ins, voids
3. `03-customers.md` — profiles, creating customers, duplicates, anonymise
4. `04-memberships.md` — validity passes, selling plans, expiring list
5. `05-payments-day-close.md` — recording payments, fixed + manual pricing, reconciliation
6. `06-dashboard-reports.md` — owner dashboard, charts, top customers, CSV exports
7. `07-admin.md` — plans, station rates, staff accounts, cron, audit
8. `08-troubleshooting-faq.md` — errors, fixes, frequently asked questions

## Fastest paths

- **Rush hour (staff):** Check-in → search phone → In → Payments → record → Day Close.
- **Morning (owner):** Dashboard → expiring list → Day Close → exports.
