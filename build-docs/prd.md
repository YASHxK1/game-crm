A **tech stack** is the set of tools and technologies you use to build and run a software product. Think of it as the layers that work together, from what the user sees to where the data is stored.

## The usual layers

| Layer | What it does | In your CRM (proposed) |
|-------|--------------|------------------------|
| **Frontend** | What staff see and click: screens, forms, charts | Next.js (React) + Tailwind + shadcn/ui |
| **Backend** | The logic behind the screens: saving a customer, checking membership balance | Next.js server actions / API routes |
| **Database** | Where data is permanently stored | Postgres (Neon) |
| **Authentication** | Login and roles (owner vs. staff) | Auth.js |
| **Hosting** | The servers that make the app available on the internet | Vercel |

## An analogy
Your gaming parlour has a front counter (frontend), a back office where the records are managed (backend), a filing cabinet (database), a lock on the door (authentication), and the building itself (hosting). The tech stack is the choice of what each of those is made of.
---

# PRD: Gaming Parlour CRM

**Version:** 0.1 (Draft) | **Owner:** Yash | **Status:** For review

---

## 1. Executive Summary

**Problem Statement**
Gaming parlours typically track regulars, memberships, and daily takings on paper, WhatsApp, or scattered spreadsheets. The owner can't see who their best customers are, when a membership expires, or how revenue and footfall trend.

**Proposed Solution**
A lightweight, staff-only web CRM for a single parlour: fast customer lookup and check-in, membership management, and a reports dashboard for revenue and footfall. It's built on a Vercel-native stack (Next.js + serverless Postgres).

**Success Criteria**

| # | KPI | Target |
|---|-----|--------|
| 1 | Time for staff to find a customer and check them in | ≤ 10 s from opening the app (phone number search) |
| 2 | Share of daily visits logged in the CRM | ≥ 95% within 30 days of go-live |
| 3 | Membership balance/expiry accuracy vs. manual audit | 100% on a 20-customer weekly spot check |
| 4 | Dashboard load time (12 months of data, ~10k visits) | < 2 s p95 |
| 5 | Time for the owner to get a daily/weekly revenue summary | < 30 s (vs. manual tally) |

---

## 2. User Experience & Functionality

### User Personas

| Persona | Description | Key needs |
|---------|-------------|-----------|
| **Owner (Admin)** | Runs the parlour, reviews performance | Reports, membership plans, staff accounts, data export |
| **Counter Staff** | Works the front desk, often on a phone/tablet during rush hours | Quick search, check-in, membership top-up, record payment |

### User Stories & Acceptance Criteria

**US-1: Customer profiles**
*As a counter staff member, I want to create and find a customer by phone number so that I don't re-enter details on every visit.*
- Create a customer with name (required), phone (required, unique), optional email, DOB, notes, and tags (e.g., "PS5", "tournament regular").
- Search by phone (partial match) or name; results appear in < 300 ms.
- Duplicate phone numbers are blocked with a link to the existing profile.
- Profile page shows visit history, membership status, and total spend.

**US-2: Memberships**
*As an owner, I want to define membership plans and assign them to customers so that regulars get their benefits and I can track expiry.*
- Owner can create plans with a name, price, and type: **time pack** (hours balance), **validity pass** (start/end date), or **both** (exact plan types are TBD; see Open Questions).
- Staff can sell a plan to a customer, which records a transaction and sets balance/expiry.
- Time-pack balance decrements when a visit is closed with hours used.
- Profile shows status: Active / Expiring (≤ 7 days) / Expired.
- An "Expiring soon" list is available on the dashboard.
- All balance changes are written to an immutable ledger (who, when, delta, reason).

**US-3: Visit check-in (footfall)**
*As a counter staff member, I want to check a customer in and out so that footfall and usage are captured.*
- One-tap check-in from a customer profile; walk-ins can be logged without a profile (anonymous count).
- Check-out records duration and, if applicable, deducts the membership balance.
- Staff can edit or void a visit within 24 hours; the owner can edit anytime. Edits are audit-logged.
- Optional field: station/console (free-text tag; no booking logic).

**US-4: Payments log (revenue source)**
*As a counter staff member, I want to record what a customer paid so that revenue reports are accurate.*
- Record amount, mode (Cash / UPI / Card / Other, configurable), category (Session, Membership, Snacks/Other), and an optional linked visit.
- Every membership sale auto-creates a transaction.
- A daily "close day" view shows totals by mode for cash reconciliation.

**US-5: Reports dashboard**
*As an owner, I want revenue and footfall reports so that I can make staffing and pricing decisions.*
- Cards: today's revenue, visits, new customers, active members.
- Charts: revenue by day/week/month, visits by hour-of-day and day-of-week (peak analysis), revenue by category and payment mode.
- Top 10 customers by spend/visits for a chosen date range.
- Date-range filter; CSV export of visits, transactions, and customers.

**US-6: Access control**
*As an owner, I want role-based staff accounts so that only I see financial reports and settings.*
- Roles: `admin`, `staff`. Staff can't access reports beyond today's summary, plan setup, user management, or exports.
- Staff can be deactivated instantly; sessions are invalidated.

### Non-Goals (MVP)
- Console/slot **booking or reservations**
- **POS, billing, or invoicing** (GST/tax invoices) and payment gateway integration
- **Marketing campaigns** (WhatsApp/SMS), loyalty points, or offers engine
- **Customer-facing app or portal**
- **Multi-branch** support
- Inventory/canteen stock management
- Hardware integrations (console timers, door locks, RFID)

---

## 3. AI System Requirements

**Not applicable for MVP.** No AI features are in scope. A possible later phase, such as churn prediction ("customers who haven't visited in 30 days"), is a simple SQL query and doesn't need an AI system.

---

## 4. Technical Specifications

### Proposed Tech Stack (Vercel-friendly)

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | **Next.js (App Router) + TypeScript** | First-class Vercel support; server components and server actions keep the API surface small |
| UI | **Tailwind CSS + shadcn/ui** | Fast, accessible, mobile-friendly counter UI |
| Charts | **Recharts** | Simple dashboards, works with React server/client split |
| Database | **Neon Postgres** (via Vercel Marketplace) | Serverless Postgres, connection pooling suits serverless functions |
| ORM | **Drizzle ORM** + drizzle-kit migrations | Lightweight, cold-start friendly, type-safe |
| Auth | **Auth.js** (credentials, role in session) | Free, self-contained, no extra vendor. Clerk is the alternative if you want managed auth |
| Validation | **Zod** | Shared schemas for forms and server actions |
| Background jobs | **Vercel Cron** → route handler | Nightly membership-expiry status update and daily rollups |
| File storage (optional) | **Vercel Blob** | Only if you later add customer photos/exports |
| Observability | **Vercel Analytics + Speed Insights**, Sentry (optional) | Built in |
| Testing | **Vitest** (unit), **Playwright** (e2e smoke tests) | Runs in CI |
| Hosting | **Vercel** (Git-based deploys, preview per PR) | Matches your constraint |

### Architecture Overview

```
[Staff / Owner browser (mobile or desktop)]
              │  HTTPS
              ▼
   ┌─────────────────────────────┐
   │  Next.js on Vercel          │
   │  • Server Components (UI)   │
   │  • Server Actions / Routes  │
   │  • Auth.js middleware (RBAC)│
   └──────────┬──────────────────┘
              │ Drizzle (pooled connection)
              ▼
   ┌─────────────────────────────┐
   │  Neon Postgres              │
   └─────────────────────────────┘
              ▲
   Vercel Cron (nightly) ──► /api/cron/daily
```

### Core Data Model

| Table | Key fields |
|-------|-----------|
| `users` | id, name, email, password_hash, role (`admin`/`staff`), active |
| `customers` | id, name, phone (unique), email, dob, notes, tags[], created_at |
| `membership_plans` | id, name, price, type, hours_included, validity_days, active |
| `memberships` | id, customer_id, plan_id, start_date, end_date, hours_balance, status |
| `membership_ledger` | id, membership_id, delta_hours, reason, created_by, created_at (append-only) |
| `visits` | id, customer_id (nullable for walk-ins), check_in, check_out, station, created_by, voided |
| `transactions` | id, customer_id (nullable), visit_id (nullable), amount, mode, category, created_by, created_at |
| `audit_log` | id, actor_id, entity, entity_id, action, before, after, created_at |

Indexes: `customers(phone)`, `visits(check_in)`, `transactions(created_at)`, `memberships(customer_id, status)`.

### Integration Points
- **Auth:** Auth.js, credentials provider, JWT session carrying the role.
- **DB:** Neon via pooled connection string (env vars managed in Vercel).
- **Export:** CSV generated server-side via route handlers.
- **External APIs:** None in MVP (payments and WhatsApp are non-goals).

### Non-Functional Requirements
- **Performance:** p95 page load < 2 s on 4G mobile; search < 300 ms.
- **Availability:** Rely on Vercel and Neon SLAs; the app must degrade to a clear error state, not lose data silently.
- **Accessibility:** Lighthouse Accessibility score ≥ 90 on core screens.
- **Responsive:** Fully usable at 360 px width (staff will use phones).
- **Backups:** Daily automated DB backup/point-in-time recovery enabled; monthly CSV export by the owner.

### Security & Privacy
- Customer data (name, phone, DOB) is personal data: collect only what's needed, and restrict access to authenticated staff.
- Passwords hashed with argon2/bcrypt; HTTPS only; secure, httpOnly session cookies.
- Role checks enforced **server-side** on every action and report, not just in the UI.
- Rate-limit login attempts; deactivate users to revoke access.
- Audit log for edits/voids and balance changes.
- Secrets live only in Vercel environment variables. DB is not publicly exposed beyond the pooled connection string.
- Add a data-deletion path (admin can anonymize a customer on request). Confirm the applicable local privacy law with a professional.
- Minors: the DOB field is optional, and if minors visit, consider parental-consent handling (see Open Questions).

---

## 5. Risks & Roadmap

### Phased Rollout

| Phase | Scope | Exit criteria |
|-------|-------|--------------|
| **MVP (v1.0)** | Auth + roles, customers, membership plans/sales/ledger, check-in/out, payments log, dashboard, CSV export | Used daily by staff for 2 weeks; ≥ 95% visits logged; KPIs 1–5 met |
| **v1.1** | Data import from existing sheets, "inactive customers" list, day-close report, PWA install on counter phone/tablet, better audit views | Owner replaces spreadsheet fully |
| **v2.0** | Optional: WhatsApp/SMS reminders for expiring memberships, loyalty/offers, simple slot booking, multi-branch | Only after validating demand from MVP data |

### Technical & Product Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **Staff don't log visits during rush hours** | Reports become unreliable | One-tap check-in, phone-number search, walk-in counter shortcut; a 2-week trial with staff feedback |
| **Vercel plan limits** (Hobby is for non-commercial use, and cron/function limits are tighter) | Compliance or feature limits | Plan for the **Pro** tier for a business; verify current pricing and limits before launch |
| **Serverless DB connections/cold starts** | Slow first load | Pooled Neon connection, lightweight ORM, keep queries indexed |
| **Membership balance errors** | Trust loss with customers | Append-only ledger, server-side transactions, weekly spot check |
| **Data loss or bad edits** | Financial mismatch | Audit log, soft-delete/void instead of hard-delete, PITR backups |
| **Scope creep** (billing, booking, campaigns) | Delays MVP | Enforce the Non-Goals list until MVP exit criteria are met |
| **Personal data / privacy compliance** | Legal exposure | Data minimization, RBAC, deletion path, legal check |

---

## Open Questions (need your input before v1.0 is locked)

1. **Membership model:** Are memberships prepaid hours, monthly passes, or both? Any freeze/transfer/refund rules?
2. **Pricing:** Is a session's price fixed per hour per console type, or is it decided at the counter? (Affects whether MVP needs a price list.)
3. **Existing data:** Do you have customer/membership data in Excel or Google Sheets to import at launch?
4. **Devices:** Will staff use a phone, a tablet, or a PC at the counter? Is there reliable internet at the parlour?
5. **Minors:** Do under-18 customers visit, and do you need to record guardian consent?
6. **Currency and payment modes:** Confirm the list (Cash / UPI / Card / other) and the currency shown.
7. **Language:** English only, or a local language for the staff UI?

---

Once you answer the open questions (even a rough answer is enough), I can revise this PRD, or I can save it as a `.md` file, add a database schema (Drizzle) and a starter project structure for the MVP.
