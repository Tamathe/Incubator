# Admin smoke test

Manual checklist for verifying Stage 1 after deploy. ~10 minutes.

## Public forms

- [ ] Visit `/` — page loads, no console errors.
- [ ] Footer subscribe form: enter a fresh email, click Subscribe → "Sent ✓".
- [ ] Visit `/join`:
  - [ ] Path 02 CTA "Submit a pitch" scrolls to the pitch section.
  - [ ] RSVP form: fill in name, email, pick a chip, check "Add me to the listserv" → "Confirmed ✓".
  - [ ] Pitch form: fill in name, email, problem/affected/firstBuild → "Submitted ✓".

## Admin auth

- [ ] Visit `/admin` while logged out → redirected to `/admin-login`.
- [ ] Enter the wrong password → "Incorrect password" error, still on login.
- [ ] Enter the right password → land on `/admin` overview.
- [ ] Refresh `/admin` — stays logged in (cookie persists).
- [ ] Open `/admin-login` directly while logged in — page renders (acceptable; clicking Sign in again no-ops).

## Admin dashboards

- [ ] Overview shows correct counts:
  - Subscribers count matches DB.
  - Unreviewed RSVPs count matches DB.
  - New pitches count matches DB.
  - Latest subscribers table shows the email submitted above.
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
  - [ ] CSV export works.

## Spam guards

- [ ] Open browser devtools, manually POST to `/api/subscribe` with `{ email, website: "spam" }` → 204, no DB row.
- [ ] POST `/api/subscribe` with garbage email → 400.
- [ ] POST `/api/subscribe` six times within 10 minutes from the same IP → 6th returns 429.

## Logout

- [ ] Click "Sign out" in the admin sidebar → redirected to `/admin-login`.
- [ ] Visit `/admin` again → redirected back to login (cookie cleared).
