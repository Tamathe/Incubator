# Admin smoke test

Manual checklist for verifying Stage 1 after deploy. ~10 minutes.

## Public forms

- [ ] Visit `/` — page loads, no console errors.
- [ ] Footer subscribe form: enter a fresh email, click Subscribe → "Sent ✓".
- [ ] Visit `/join`:
  - [ ] Enter a fresh email in "Join the Incubator" → "See you Friday."
  - [ ] The email creates one active `Member` and one active `Subscriber`; repeat submission updates the same rows.
  - [ ] Pitch form: fill in name, email, problem/affected/firstBuild → "Submitted ✓".
  - [ ] Submit a proposal with an open preferred Friday → success message names the held date.
  - [ ] Confirm that the first Friday of each month never appears in the available-date list.

## Admin auth

- [ ] Visit `/admin` while logged out → redirected to `/admin-login`.
- [ ] Enter the wrong password → "Incorrect password" error, still on login.
- [ ] Enter the right password → land on `/admin` overview.
- [ ] Refresh `/admin` — stays logged in (cookie persists).
- [ ] Open `/admin-login` directly while logged in — page renders (acceptable; clicking Sign in again no-ops).

## Admin dashboards

- [ ] Overview shows correct counts:
  - Members count matches the active member roster.
  - Subscribers count matches DB.
  - Unreviewed RSVPs count matches DB.
  - New pitches count matches DB.
  - Latest members table shows the email submitted above.
- [ ] `/admin/members`:
  - [ ] Table shows members ordered by latest confirmation.
  - [ ] "Mark inactive" removes a member from the active count; "Reactivate" restores it.
  - [ ] "Export CSV" downloads a valid CSV with all roster columns.
- [ ] `/admin/subscribers`:
  - [ ] Table shows all subscribers ordered newest-first.
  - [ ] "Add subscriber" form adds a row.
  - [ ] "Unsubscribe" toggles status and hides from public counts.
  - [ ] "Export CSV" downloads a valid CSV with all columns.
- [ ] `/admin/rsvps`:
  - [ ] RSVPs grouped by meeting date, newest first.
  - [ ] Filter "Unreviewed only" hides reviewed rows.
  - [ ] Click "Mark reviewed" → flips to "✓ Reviewed", count drops on overview.
  - [ ] CSV export works.
- [ ] `/admin/pitches`:
  - [ ] Kanban columns: new, reviewing, accepted, declined, converted.
  - [ ] Click a card → detail panel opens on the right.
  - [ ] Change status → card moves columns.
  - [ ] Add a note, click "Save notes" → persists after reload.
  - [ ] Confirm a held Friday → `/sessions` changes that date from Held to Booked.
  - [ ] CSV export works.

## Spam guards

- [ ] POST `/api/members/register` with `{ email, website: "spam" }` → 204, no DB row.
- [ ] POST `/api/members/register` with garbage email → 400.
- [ ] POST `/api/members/register` six times within 10 minutes from the same IP → 6th returns 429.
- [ ] Open browser devtools, manually POST to `/api/subscribe` with `{ email, website: "spam" }` → 204, no DB row.
- [ ] POST `/api/subscribe` with garbage email → 400.
- [ ] POST `/api/subscribe` six times within 10 minutes from the same IP → 6th returns 429.

## Logout

- [ ] Click "Sign out" in the admin sidebar → redirected to `/admin-login`.
- [ ] Visit `/admin` again → redirected back to login (cookie cleared).
