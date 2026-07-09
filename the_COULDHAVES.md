# the_COULDHAVES.md

Nice-to-have features and improvements that would enhance the user experience but aren't critical for MVP.

---

## 1. Auth Expiry — "Sign in again" Prompt

**Problem:** When the Firebase ID token expires (after ~1 hour), API calls fail with "Authentication required." The user sees a generic error with no guidance on what to do.

**Proposed Fix:** Detect 401 errors globally in `apiGet`/`apiPost`/`apiPut`/`apiPatch`/`apiDelete` and show a toast or modal that says "Your session expired. Please sign in again." with a button that redirects to `/login`.

**Where to implement:**
- `lib/api-client.ts` — add 401 detection in the response handler
- `components/Toast/index.tsx` — use existing toast system for the prompt

**Priority:** Medium — improves UX significantly for long sessions.

---

## 2. Pro Plan — Subscription & Payment Integration

**Problem:** The landing page shows Free and Pro pricing tiers, but only the free tier is implemented. The "Start Pro" button just goes to `/login` with no actual upgrade path. The UpgradePrompt modal dismisses with "Got it" but doesn't let users upgrade.

**Current state:**
- Free tier: 5 invoices/month — enforced server-side (HTTP 429 when exceeded)
- Pro tier: PKR 999/month — UI only, no backend logic
- No payment provider (no Stripe, no JazzCash, no bank transfer)

**Proposed implementation:**
1. **Payment provider** — integrate Stripe or JazzCash for PKR payments
2. **Subscription model** — add `plan: 'free' | 'pro'` and `planExpiresAt` to Business model
3. **Server-side enforcement** — check plan status before invoice limit check
4. **Upgrade flow** — clicking "Start Pro" → payment checkout → webhook updates plan
5. **Billing portal** — let users view/manage subscription, cancel, update payment
6. **Invoice for Pro** — generate receipt/invoice for the subscription itself

**Where to implement:**
- `models/Business.ts` — add `plan` and `planExpiresAt` fields
- `app/api/subscription/` — new route for checkout, webhook, status
- `components/UpgradePrompt/index.tsx` — link to actual checkout instead of dismiss
- `components/Settings/` — add subscription management section

**Priority:** High — monetization depends on this.

---

*Last updated: July 2026*
