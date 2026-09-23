# 02 — Check-in & Visits

## Check-in (`/checkin`)

Built for speed: find a customer by phone and check them in within ~10 seconds.

1. Type a partial phone number or name in the search box and press **Search**.
   Search matches phone or name and returns at most 20 results.
2. Each result row shows the name (click to open the profile), the phone,
   a station dropdown (`PS5` / `PC` / `General` with hourly rates),
   an **In** button, and the customer's tags.
3. Choose the station and press **In**. A visit is created with the current
   time and your staff ID.
4. The **Open visits** table below lists up to 20 visits that have not been
   checked out yet.

### Walk-ins (no profile)

Use the **Walk-in** card at the top: enter the station and press
**Walk-in check-in**. Walk-ins are stored without a customer link —
they count toward footfall but not toward any customer's spend.

## Visits (`/visits`)

Shows the last 100 visits, newest first, with columns:
check-in time, check-out time (`OPEN` while the customer is inside),
station, customer (short ID or `walk-in`), void flag, and action buttons.

### Check-out (**Out** button)

Sets the check-out time to now and computes the duration in whole minutes
(minimum 1 minute). Check-outs are written to the audit log.
Validity memberships do not lose hours on check-out (validity-pass model only).

### Void

Voiding flags a visit as cancelled without deleting it (history is preserved).

- Staff may void a visit only within 24 hours of its check-in;
  older visits show the error `Staff can void only within 24h`.
- Owners may void any visit at any time.
- Every void is audit-logged with the visit's previous values.
