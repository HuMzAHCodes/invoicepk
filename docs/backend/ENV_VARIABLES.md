# ⚙️ ENV_VARIABLES.md — InvoicePK Environment Variables

> All environment variables live in `.env.local` in the project root.
> `.env.local` is in `.gitignore` — never commit it to GitHub.
> Each developer sets up their own `.env.local` from the `.env.example` file.

---

## Quick Setup

```bash
# 1. Copy the example file
cp .env.example .env.local

# 2. Fill in your real values (see guide below for where to find each one)

# 3. Restart the dev server after any change
npm run dev
```

---

## Full Variable Reference

### 🍃 MongoDB Atlas

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | YES | Full connection string including credentials |
| `MONGODB_TEST_URI` | YES | Separate test database — used by Jest |

**Where to get it:**
1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free cluster (M0 — free forever)
3. Click **Connect → Drivers → Node.js**
4. Copy the connection string — replace `<password>` with your Atlas user password

```
MONGODB_URI=mongodb+srv://invoicepk-user:<password>@cluster0.xxxxx.mongodb.net/invoicepk?retryWrites=true&w=majority
MONGODB_TEST_URI=mongodb+srv://invoicepk-user:<password>@cluster0.xxxxx.mongodb.net/invoicepk_test?retryWrites=true&w=majority
```

> ⚠️ Notice `invoicepk` vs `invoicepk_test` at the end — these are two separate databases on the same cluster. Tests run against `invoicepk_test` so they never touch real data.

---

### 🔥 Firebase Auth

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | YES | Firebase project API key (client-side) |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | YES | Firebase auth domain (client-side) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | YES | Firebase project ID (client-side) |
| `FIREBASE_PROJECT_ID` | YES | Same as above — used server-side by Admin SDK |
| `FIREBASE_CLIENT_EMAIL` | YES | Service account email — from Firebase private key JSON |
| `FIREBASE_PRIVATE_KEY` | YES | Service account private key — from Firebase private key JSON |

**Where to get it:**

**Client-side keys (`NEXT_PUBLIC_*`):**
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Select your project → **Project Settings → General**
3. Scroll to **Your apps** → click **Web app** → copy the config object

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
```

**Server-side Admin keys:**
1. **Project Settings → Service Accounts**
2. Click **Generate new private key** → downloads a `.json` file
3. Open the file — copy `project_id`, `client_email`, and `private_key`

```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANB...\n-----END PRIVATE KEY-----\n"
```

> ⚠️ `FIREBASE_PRIVATE_KEY` must be wrapped in double quotes in `.env.local`. It contains literal `\n` characters — do not replace them with real newlines.

> ⚠️ Never commit the downloaded `.json` file to Git. Delete it after copying the values.

---

### ☁️ Cloudinary

| Variable | Required | Description |
|---|---|---|
| `CLOUDINARY_CLOUD_NAME` | YES | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | YES | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | YES | Cloudinary API secret |

**Where to get it:**
1. Go to [cloudinary.com](https://cloudinary.com) → sign up free
2. Dashboard → **API Keys** section
3. Copy Cloud Name, API Key, and API Secret

```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz12345
```

---

### 🤖 Google Gemini (AI invoice draft — free tier)

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | NO* | Google AI Studio API key for describe → auto-fill |
| `GEMINI_MODEL` | NO | Model id (default: `gemini-flash-latest`) |

\*Required only if you use **Describe invoice → Auto-fill**. Without it, that feature returns 503; the rest of the app works normally.

**Where to get it:**
1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Sign in with Google → **Create API key** (free)
3. Paste into `.env.local`

```
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-flash-latest
```

> If Auto-fill shows a free-tier / quota error, set `GEMINI_MODEL=gemini-flash-latest` (or another model that works for your key in AI Studio). Newer keys often have **0 free quota** for older names like `gemini-2.0-flash`.

> Voice input on the invoice form uses the browser Web Speech API — no extra env var.

---

### 🌐 App Config

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | YES | Base URL of the app |
| `LOG_LEVEL` | NO | Set to `debug` in dev for verbose logs |

```
NEXT_PUBLIC_APP_URL=http://localhost:3000
LOG_LEVEL=debug
```

> In production on Vercel, `NEXT_PUBLIC_APP_URL` should be your Vercel deployment URL e.g. `https://invoicepk.vercel.app`

---

## .env.example File

Copy this file into your project root as `.env.example` and commit it to GitHub. It shows every variable name with placeholder values so both developers know what to fill in.

```bash
# ─── MongoDB Atlas ─────────────────────────────────────────
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/invoicepk?retryWrites=true&w=majority
MONGODB_TEST_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/invoicepk_test?retryWrites=true&w=majority

# ─── Firebase Auth (Client-side) ───────────────────────────
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id

# ─── Firebase Admin SDK (Server-side) ──────────────────────
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# ─── Cloudinary ────────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# ─── Google Gemini (AI draft) ──────────────────────────────
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-flash-latest

# ─── App Config ────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
LOG_LEVEL=debug
```

---

## Vercel Production Setup

Environment variables must also be added to Vercel for the production deployment. `.env.local` is local only — Vercel does not read it.

**Steps:**
1. Go to your Vercel project → **Settings → Environment Variables**
2. Add each variable from the list above
3. For `FIREBASE_PRIVATE_KEY` — paste the full value including the quotes
4. Set `NEXT_PUBLIC_APP_URL` to your actual Vercel URL
5. Set `LOG_LEVEL` to nothing (leave empty) in production
6. Set `MONGODB_URI` to the production database — **NOT** the test one

> ⚠️ `MONGODB_TEST_URI` is not needed on Vercel — it is only used locally by Jest.

---

## Two Database Strategy

| Database | URI Variable | Used By |
|---|---|---|
| `invoicepk` | `MONGODB_URI` | Local dev + Vercel production |
| `invoicepk_test` | `MONGODB_TEST_URI` | Jest tests only |

This keeps test runs completely isolated from real data. The seed script (`scripts/seed.ts`) targets `MONGODB_URI`. Jest automatically uses `MONGODB_TEST_URI` when `NODE_ENV=test`.

**Jest setup — `jest.config.ts`:**
```typescript
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathPattern: '__tests__',
  runInBand: true,           // run tests sequentially — avoids DB conflicts
  setupFiles: ['./jest.setup.ts'],
};
```

**`jest.setup.ts`:**
```typescript
process.env.MONGODB_URI = process.env.MONGODB_TEST_URI!;
```

This one line makes every Jest test connect to the test database automatically — no extra configuration needed in each test file.

---

## Variable Ownership

| Variable | Backend Dev | Frontend Dev |
|---|---|---|
| `MONGODB_URI` | Sets up | Does not need |
| `MONGODB_TEST_URI` | Sets up | Does not need |
| `NEXT_PUBLIC_FIREBASE_*` | Does not need | Sets up |
| `FIREBASE_PROJECT_ID` | Sets up | Does not need |
| `FIREBASE_CLIENT_EMAIL` | Sets up | Does not need |
| `FIREBASE_PRIVATE_KEY` | Sets up | Does not need |
| `CLOUDINARY_*` | Sets up | Does not need |
| `NEXT_PUBLIC_APP_URL` | Both set | Both set |
| `LOG_LEVEL` | Sets up | Does not need |

> Both developers still need the `.env.local` file set up correctly to run the project locally. Share the actual values over a secure channel (WhatsApp DM, not GitHub).

---

*Last updated: June 2026 | Never commit .env.local to Git*
