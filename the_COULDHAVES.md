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

*Last updated: July 2026*
