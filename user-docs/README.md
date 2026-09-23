# Gaming Parlour CRM — User Guide

Staff-only web app for one parlour: customer lookup, check-in/out,
validity memberships, payments, day-close, and owner dashboard.
Mobile-first (works at 360px), English, currency INR (₹).

## Who is this for

| Role | Login | Can do |
|------|-------|--------|
| Counter staff (`staff`) | email + password | Check-in, Customers, Visits, Payments, Day Close (today only) |
| Owner (`admin`) | email + password | Everything staff can + Dashboard, Plans, Users, Settings, CSV exports |

Default seeded owner: `owner@parlour.local` / `Owner@123` — change it after first login
by creating a new admin in Users and deactivating the seed account.

## Map

- `01-getting-started.md` — login, roles, layout, first-day checklist
- `02-daily-operations.md` — check-in, visits, payments, day-close (rush-hour flow)
- `03-customers-memberships.md` — profiles, search, validity passes, expiring list
- `04-owner-dashboard-reports.md` — dashboard cards, charts, top-10, CSV exports
- `05-admin-settings.md` — plans, station rates, staff accounts, settings, cron
- `06-troubleshooting-faq.md` — common errors, fixes, FAQ

> Staff rush-hour path: **Check-in → search phone → In → Payments → record → Day Close**.
> Owner morning path: **Dashboard → expiring list → Day Close yesterday → exports**.
