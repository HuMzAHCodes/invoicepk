# 🔍 FRONTEND_TESTING.md — Frontend Verification Strategy

> This document explains how the frontend developer verifies pages work correctly
> during development. There is no Jest suite on the frontend side — that's the
> backend's territory (see `BACKEND_DEV.md` / `DEVELOPMENT_PLAN.md`). Instead, every
> page is checked manually against the real backend, using the real seeded data in
> MongoDB Atlas. There are no frontend mocks either — the same "no mock data" rule
> from `AI_MEMORY.md` and `RISKS_AND_DECISIONS.md` applies here too.

---

## Why No Frontend Mocks

The project-wide decision (see `RISKS_AND_DECISIONS.md`, Decision 3) is that mock
data hides real bugs — connection issues, shape mismatches, deployment problems —
until it's too late to catch them cheaply. That reasoning applies just as much to
the frontend as the backend. A page that "works" against hand-typed mock data but
breaks the moment it touches the real API response is not actually working — it's
untested.

**The rule:** every page you build is checked against the backend's real seed data
from `scripts/seed.ts` (documented in `DATABASE_SCHEMA.md`), running on a real
MongoDB Atlas connection. Never write a fake `invoices.json` file and point a
component at it "just to see the layout."

---

## What You're Working With — The Seed Data

From Day 1, the backend developer's `scripts/seed.ts` puts this real data into
Atlas (full details in `DATABASE_SCHEMA.md`):

| Resource | Test Data |
|---|---|
| Business | `TestFreelancer Co.`, NTN `1234567-8`, STRN `12-00-1234-567-89` |
| Client 1 | `Acme Corp` — corporate, has NTN |
| Client 2 | `John Doe` — individual, no NTN |
| Invoice INV-001 | Standard GST 17%, WHT applicable, PKR 100,000 subtotal, status: draft |
| Invoice INV-002 | Zero-rated GST, USD 2,000, status: sent |

This gives you exactly enough real data to verify every UI state without inventing
anything: a corporate client and an individual client, a standard-GST invoice and a
zero-rated one, a draft invoice and a sent one. Build your pages so they correctly
display all of these real variations — if your invoice list only looks right for
INV-001 but breaks on INV-002 (USD, zero-rated), that's a real bug the seed data just
caught for you.

---

## Day-by-Day: What's Actually Available to Test Against

Cross-referencing `DEVELOPMENT_PLAN.md`'s schedule — you cannot manually verify a
page against a route that doesn't exist yet. Here's what's realistically testable
each day, assuming both devs are roughly on schedule:

| Day | Backend Routes Live | What You Can Verify For Real |
|---|---|---|
| 1 | None yet | Theme, scaffolding, static layout only — no real data yet |
| 2 | Auth routes | Register → login → token stored in cookie correctly |
| 3 | Business + Client routes | Settings page loads real business; client list shows real clients |
| 4 | Invoice create/list | Invoice list shows real invoices from Atlas |
| 5 | Invoice detail/edit | Invoice form submits real data, detail page shows real invoice |
| 6 | Status + delete | Status transitions and delete actually update Atlas |
| 8 | PDF route | Download button produces a real PDF with real invoice data |
| 9 | PDF save route | Save-to-cloud button actually updates `pdfUrl` in Atlas |
| 10 | Dashboard stats | Dashboard cards show real aggregated numbers |

**If you're ahead of the backend's schedule:** build the page's static structure and
layout first (using `GLOBAL_LAYOUT.md` conventions), then wire in the real `apiFetch`
call the moment the route exists. Don't build against an imagined response shape —
wait the half-day if needed, or build a different page that already has its backend
route ready.

---

## Manual Test Pass — Run This for Every Page Before Opening a PR

This is the frontend equivalent of the backend's "4-5 manual test cases" from
`BACKEND_DEV.md`. Not automated, but just as deliberate — go through this list
every time, not just when something looks broken.

### 1. Happy Path
- [ ] Page loads with real data from Atlas (not a blank state, not an error)
- [ ] All fields display correctly — check against what's actually in the seed data
- [ ] Numbers are formatted correctly (PKR vs USD — see `formatPKR`/`formatUSD` in `GST_LOGIC.md`)

### 2. Empty State
- [ ] What does this page look like with zero records? (e.g. a brand new test business
      with no clients yet) — does it show a sensible `EmptyState` component, or a
      blank confusing screen?

### 3. Loading State
- [ ] Throttle your network in browser dev tools (Slow 3G) and reload — does the
      page show `loading.tsx` or a spinner, or does it flash blank/broken content?

### 4. Error State
- [ ] Temporarily stop the dev server or disconnect from the internet, then try
      the action — does the page show a clear error, or does it crash silently?
- [ ] Try submitting a form with invalid data — does the Zod validation catch it
      before hitting the API? (see `VALIDATION_AND_FORMS.md`)

### 5. Edge Case Data
- [ ] Does the page handle the zero-rated USD invoice (INV-002) correctly, not just
      the standard PKR one (INV-001)?
- [ ] Does the page handle a client with no email/phone/NTN gracefully (optional
      fields are genuinely optional in the seed data — `John Doe` has fewer fields
      filled in than `Acme Corp`)?

### 6. Mobile
- [ ] Checked at 375px width — no horizontal scroll, no overlapping elements,
      touch targets are reachable

### 7. Auth Boundary
- [ ] Log out, then try to directly navigate to a protected URL (e.g. `/dashboard`)
      — does middleware correctly redirect to `/login`?

---

## Browser DevTools — Your Primary Debugging Tool

Since there's no Jest suite on your side, the browser console and Network tab are
where you verify things are actually working, not just looking right.

### Network Tab
- Confirm the request URL matches `API_REFERENCE.md` exactly
- Confirm the `Authorization: Bearer <token>` header is present
- Confirm the response shape matches what `API_REFERENCE.md` documents — if a field
  is missing or named differently than what your component expects, this is where
  you'll catch it before it becomes a silent `undefined` in the UI

### Console
- Watch for the `console.error('[ComponentName] ...')` logs you added per
  `FRONTEND_DEV.md`'s logging guidance
- The backend's `console.log` output is visible in the terminal running `npm run dev`
  (or the Vercel dashboard in production) — cross-reference timestamps if a request
  seems to hang or fail silently

### React DevTools
- Install the React DevTools browser extension
- Use it to confirm a Client Component is actually receiving the props you expect
  from its Server Component parent (see the "Server shell + Client form" pattern
  in `DATA_FETCHING.md`)

---

## Cross-Browser / Cross-Device Pass (Before Day 14 Final QA)

Not needed daily, but run once before the final QA day in `DEVELOPMENT_PLAN.md`:

- [ ] Chrome (desktop)
- [ ] Chrome (Android — most common for the target audience per `LAUNCH_STRATEGY.md`)
- [ ] Safari (iOS) — if any team member has an iPhone to test on
- [ ] Firefox (desktop, lower priority)

---

## Coordinating With the Backend Dev When Something Looks Wrong

If a page shows incorrect data or an API call fails in a way that looks like a
backend bug, not a frontend bug:

1. Check the Network tab — confirm your request matches `API_REFERENCE.md` exactly
   (this rules out a frontend mistake first)
2. Check the backend's terminal/console logs for the matching `[METHOD /api/route]`
   line (per the logging format in `BACKEND_PATTERNS.md`)
3. If the request looks correct but the response is wrong, report it to the backend
   dev with the exact request and response — don't just say "invoices page is broken"
4. Never silently work around a backend bug by changing your frontend code to handle
   a wrong response shape — that masks the real bug and the fix is even harder to
   find weeks later. Flag it and get the backend route fixed.

---

## What This Replaces (And Doesn't)

| You Might Be Tempted To... | Instead Do This |
|---|---|
| Create a `mockInvoices.ts` file with fake data to build the UI faster | Wait for or request the real route, or build with the actual seed data once it exists |
| Hardcode a sample PDF URL to test the download button | Use the real `GET /api/invoices/:id/pdf` route against a real seeded invoice |
| Skip mobile testing because "it'll probably be fine" | Always check 375px — this is in the PR checklist in `FRONTEND_DEV.md` for a reason |
| Assume the API response shape without checking | Always verify in the Network tab against `API_REFERENCE.md` |

---

*Last updated: June 2026 | No frontend mocks — verify against real seeded Atlas data, every time*
