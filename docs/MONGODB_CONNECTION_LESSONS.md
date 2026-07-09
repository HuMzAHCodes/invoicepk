# 🗄️ MongoDB Connection String — Lessons Learned

> Resource for future projects and AI tools.
> Read this before choosing a MongoDB connection string format in any Next.js project.

---

## The Two MongoDB Connection String Formats

### Format 1 — SRV (what we started with)

```
mongodb+srv://user:password@cluster0.va87p1m.mongodb.net/dbname?retryWrites=true&w=majority
```

**How it works:**
- `mongodb+srv://` is a shorthand format
- When the app connects, it first performs a **DNS SRV lookup** to discover
  the actual MongoDB server addresses and ports
- The DNS query looks up: `_mongodb._tcp.cluster0.va87p1m.mongodb.net`
- MongoDB Atlas returns the real shard addresses from that DNS record
- Then the app connects to those addresses

**Advantages:**
- Short and clean connection string
- Atlas can rotate server addresses without breaking your connection string
- Officially recommended by MongoDB Atlas UI

**Problem:**
- Requires a DNS SRV lookup before every new connection
- Some ISPs (common in Pakistan) block or refuse SRV-type DNS queries
- In certain runtime environments, DNS settings from the main process
  don't carry over to child/worker processes

---

### Format 2 — Standard (what we switched to)

```
mongodb://user:password@ac-o17iaaa-shard-00-00.va87p1m.mongodb.net:27017,ac-o17iaaa-shard-00-01.va87p1m.mongodb.net:27017,ac-o17iaaa-shard-00-02.va87p1m.mongodb.net:27017/dbname?ssl=true&replicaSet=atlas-55zpqj-shard-0&authSource=admin
```

**How it works:**
- `mongodb://` is the direct connection format
- The actual shard hostnames and port `27017` are hardcoded directly in the string
- No DNS SRV lookup needed — the app connects directly to the listed addresses
- Standard DNS (A record) still resolves the hostnames, but this is far more
  reliable and not blocked by ISPs

**Advantages:**
- No SRV DNS dependency — works even when ISP blocks SRV lookups
- Works in all runtime environments including isolated worker processes
- More explicit — you know exactly which servers you're connecting to

**Disadvantage:**
- Longer string
- If Atlas rotates shard addresses (rare), you'd need to update the string

---

## What Happened In This Project

### Phase 1 & 2 Testing (Days 1–2) — SRV format worked fine

During Day 1, we used the SRV format (`mongodb+srv://`). Two things worked:

1. **Seed script** (`scripts/seed.ts`) — runs via `ts-node` in the main Node.js
   process. We applied `dns.setServers(['8.8.8.8', '8.8.4.4'])` which overrides
   the ISP DNS at the process level. This made SRV lookups succeed.

2. **Jest tests** (`npm test`) — also runs in the main Node.js process via
   `jest.setup.ts`. Same DNS override applied → SRV lookups succeeded.

So Phase 1 and 2 tests passed with no connection issues.

### Phase 3 Testing (Day 3) — SRV format crashed

On Day 3, we tested the Business and Client API routes via Postman for the
first time. These routes run inside **Next.js API route handlers**.

**What was different:**

Next.js 16 with **Turbopack** (the new dev bundler) runs each API route in an
**isolated worker process** — completely separate from the main `next dev` process.

This means:
- `dns.setServers(['8.8.8.8', '8.8.4.4'])` set in `lib/db.ts` or `next.config.ts`
  only applies to the **main process**
- The **worker process** that handles API routes starts fresh with the ISP's
  default DNS settings
- When the worker tries to connect to MongoDB using `mongodb+srv://`, it performs
  a DNS SRV lookup using the ISP's DNS
- The ISP blocks that SRV lookup → `ECONNREFUSED`
- The API route returns `500 Internal Server Error`

**The seed script and Jest tests still worked** because they don't go through
Turbopack workers — they run directly in the main Node.js process where the
DNS override is effective.

### The Fix

Switched both `MONGODB_URI` and `MONGODB_TEST_URI` in `.env.local` from SRV
format to standard format. The standard format doesn't need an SRV DNS lookup
at all — it connects directly to the hardcoded shard addresses.

---

## Decision For Future Projects

| Environment | Use SRV format? | Use Standard format? |
|---|---|---|
| Simple Node.js/Express server (single process) | ✅ Fine | ✅ Also fine |
| Next.js with Turbopack (Next.js 15+) in Pakistan | ❌ Will break | ✅ Required |
| Next.js without Turbopack (older versions) | ⚠️ May work with DNS fix | ✅ Safer |
| Jest tests (main process) | ✅ Fine with DNS fix | ✅ Also fine |
| Vercel production deployment | ✅ Fine (Vercel DNS works) | ✅ Also fine |

**Rule of thumb for Pakistan + Next.js 15/16:**
Always use the standard connection string format. Get it from Atlas by toggling
off "SRV Connection String" in the Connect → Drivers screen.

---

## How To Get The Standard Connection String From Atlas

1. Go to **cloud.mongodb.com** → your cluster → **Connect**
2. Choose **"Drivers"**
3. Select **Node.js** as the driver
4. Find the **"SRV Connection String"** toggle → turn it **OFF**
5. Copy the connection string shown
6. Add your database name before the `?`:
   - `.../dbname?ssl=true&...`
7. Replace `<db_password>` with your real password

---

## Files Changed In This Project To Apply The Fix

| File | Change |
|---|---|
| `.env.local` | Replaced `MONGODB_URI` and `MONGODB_TEST_URI` with standard format strings |
| `lib/db.ts` | Kept `dns.setServers()` inside `connectDB()` as a fallback (doesn't hurt) |

---

*Documented: July 2026 | Project: InvoicePK | Stack: Next.js 16 + Turbopack + MongoDB Atlas*
