# 03 — Customers

## Customer list (`/customers`)

- Use the search box for partial phone or name matches.
- The **New customer** card creates a profile with:
  Name (required), Phone (required, must be unique), Email (optional),
  Date of birth (optional), Tags (comma-separated, up to 10,
  e.g. `PS5, tournament regular`), Notes (optional).
- Pressing **Create** saves the profile, writes an audit entry,
  and opens the new profile page.
- A duplicate phone number is rejected with
  `Duplicate phone — already: <name>`. Open that existing profile instead
  of creating a second one.

## Profile page (`/customers/[id]`)

- Header shows the name and phone number.
- The summary card shows total spend (sum of linked payments),
  number of visits, tags, and notes.
- The **Memberships** table lists recent passes with start date, end date,
  and a status badge: `Active` (green), `Expiring` — 7 days or less left
  (amber), `Expired` (red).
- The **Visits** table shows the last 20 visits (in/out times, station, minutes).
- The **Payments** table shows the last 20 payments (time, amount, mode, category).
- Selling a membership is done from this page (see `04-memberships.md`).
- Owners see an **Anonymize (GDPR delete)** button: it replaces the name with
  `Deleted`, scrambles the phone, and clears email, birth date, notes, and tags.
  Past visits and payments keep their links so revenue reports stay correct.

## Tips for clean data

- Always search by phone first — it is indexed and the fastest lookup.
- Keep tags to a short agreed vocabulary (`PS5`, `PC`, `regular`,
  `tournament`) so they stay useful when scanning lists.
