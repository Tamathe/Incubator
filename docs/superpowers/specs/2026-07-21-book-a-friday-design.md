# Book a Friday

**Date:** 2026-07-21  
**Status:** Approved and implemented  
**Decision source:** Tama Thé, July 21, 2026

## Objective

Let someone submit an idea, talk, demonstration, collaborator request, or problem and request an available Friday in the same flow. The booking becomes the front edge of the Incubator's operating loop: proposal, review, session, follow-up, and permanent record.

## Rules

- The first Friday of every month is reserved for the Incubator and cannot be booked through the public form.
- The public form offers a rolling 27-Friday window.
- Choosing a date is optional. A proposal can still be submitted without one.
- A submitted preferred date receives a seven-day hold while the proposal is reviewed.
- A submitter may choose one alternate date. The alternate is a preference, not a hold.
- One active hold or confirmed booking may occupy a Friday.
- Published meeting entries, cancellations, and first-Friday reservations override public availability.
- Raw proposal text, identity, and email remain private. The public calendar shows only availability until session copy has been reviewed for publication.

## Booking states

1. `requested`: the preferred date is held for seven days.
2. `confirmed`: an administrator has approved the session and date.
3. `completed`: the session occurred.
4. `cancelled`: the proposal or booking was cancelled and the date was released.
5. `expired`: the review window elapsed and the date was released.

## Surfaces

- `/join#pitch`: proposal form, preferred date, alternate date, and confirmation.
- `/sessions`: public availability and published Friday calendar.
- `/api/fridays`: privacy-safe availability data.
- `/admin/pitches`: review, reschedule, confirmation, completion, cancellation, and private notes.

## Deferred work

- Automatic confirmation, reminder, rescheduling, and cancellation emails.
- Calendar invitations sent directly to presenters.
- Public session titles and presenter credit generated from an approved booking record.
- Recording, materials, decisions, actions, and contributor credit attached to the completed session.
