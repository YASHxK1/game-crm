# 05 — Payments & Day Close

## Recording a payment (`/payments`)

The top card reminds you of the fixed station rates
(e.g. `PS5 ₹150/h · PC ₹100/h`) — but the amount field is freely editable,
so fixed pricing with manual override is supported.

| Field | Required | Values / notes |
|-------|----------|----------------|
| Amount ₹ | yes | Any amount ≥ 0, decimals allowed |
| Mode | yes | Cash / UPI / Card / Other |
| Category | yes | Session / Membership / Snacks / Other |
| Customer ID | no | Full UUID from the profile URL, if known |
| Visit ID | no | Optional link to a visit |

Press **Record** to save. The table below lists the last 100 payments.

## Day Close (`/day-close`)

Shows today (from local midnight): total revenue, payment count, visit count,
a Cash-vs-UPI summary card, a **By mode** breakdown line, and the full
transaction table.

### Cash reconciliation

1. Count the physical cash and check UPI settlements.
2. Compare against the Cash and UPI cards on this page.
3. If anything is missing, find it in **Payments**/**Visits** and record it now.
   Payments are always stamped with the current time — back-dating is not
   supported, so log each payment as close to collection as possible.

Staff see only today's figures here; owners use the **Dashboard** for history.
