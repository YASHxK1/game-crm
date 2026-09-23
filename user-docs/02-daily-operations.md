# 02 — Daily Operations (Staff)

Goal: every visit + every rupee logged, even in rush hour.

## A. Check-in (`/checkin`)

Fast phone search (target ≤10s):

1. Type partial phone or name in the search box → **Search**. Results match
   `phone ILIKE %q% OR name ILIKE %q%`, max 20, indexed on `customers(phone)`.
2. Each row shows name (link to profile), phone, a station dropdown
   (seeded from **Settings** rates), and an **In** button.
3. Press **In** → visit created with `check_in=now()`, `created_by=you`.
4. Below the form: **Open visits** table (max 20, `check_out IS NULL`).

Walk-ins (no profile):

- Use the **Walk-in** card at top: pick/typing station → **Walk-in check-in**.
- Stored with `customer_id=NULL`; counted in footfall but not linked to spend.

Tips:

- Keep the station dropdown accurate (`PS5`/`PC`/`General`) — it drives the suggested price at payment time.
- If a duplicate phone error appears on customer creation, the error names the existing profile — open it instead of creating a second row.

## B. Visits (`/visits`)

List of last 100 visits, newest first: In, Out (`OPEN` if still inside),
Station, Cust (short ID or `walk-in`), Void flag, Actions.

- **Out**: sets `check_out=now()`, computes `duration_mins = max(1, round((out-in)/60s))`.
  Audit-logged. Membership validity passes do NOT decrement hours (validity-only MVP).
- **Void**: soft flag `voided=true` (never hard-deleted).
  - Staff: only within 24h of `check_in`, else error `Staff can void only within 24h`.
  - Owner: anytime. All voids audit-logged with before-image.

## C. Payments (`/payments`)

Top card shows fixed rates reminder, e.g. `PS5 ₹150/h · PC ₹100/h` — amounts are
editable (fixed + manual override per parlour decision).

Form fields:

| Field | Required | Notes |
|-------|----------|-------|
| Amount ₹ | yes | number, ≥0, decimals allowed |
| Mode | yes | Cash / UPI / Card / Other |
| Category | yes | Session / Membership / Snacks / Other |
| Customer ID | no | paste full UUID from profile URL if known |
| Visit ID | no | optional link to a visit |

Press **Record** → row in `transactions` with `created_by=you`. Table below shows last 100.

Membership sales auto-create a `Membership`-category transaction — do NOT record it again manually.

## D. Day Close (`/day-close`)

Today from midnight local: Revenue total, Txn count, Visits count, Cash vs UPI card,
**By mode** line (`Cash: ₹X · UPI: ₹Y …`), and full transaction table.

Cash reconciliation flow:

1. Count physical cash + UPI settlements.
2. Compare to Day Close Cash/UPI cards.
3. If mismatch, open **Payments**/**Visits** to find the missing entry — record it now (back-dating is not supported; `created_at=now()`).

Staff see only today here. Owners get full history in **Dashboard**.
