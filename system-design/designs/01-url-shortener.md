# Design 01 — URL Shortener (bit.ly)

> **Practice this out loud, timed at 20 minutes.** It's the most commonly given design
> question at this band because it's small enough to finish and still touches hashing,
> read-heavy caching, database choice, and redirects.

---

## The 4-step structure — use this for EVERY design question

1. **Clarify requirements** (2 min) — never start designing immediately
2. **Estimate scale** (2 min) — reads vs writes, storage
3. **API + data model** (5 min)
4. **Design the flow, then address the bottleneck** (10 min)

Interviewers grade the *structure* as much as the answer. Starting with questions rather
than a diagram is half the score.

---

## 1. Clarify (ask these before designing)

- Custom aliases, or generated only? → **both, custom optional**
- Do links expire? → **optional TTL**
- Analytics on clicks? → **yes, click count**
- Do we need user accounts? → **yes, so users can see their links**
- Expected scale? → **assume 1M new links/month**

## 2. Estimate

```
Writes:  1M/month ≈ 0.4 writes/sec        — trivial
Reads:   assume 100:1 read/write ratio    → ~40 reads/sec, peak ~200/sec
Storage: 1M links/month × 500 bytes ≈ 500 MB/month ≈ 6 GB/year
```

**The conclusion that drives everything:** this is an extremely **read-heavy** system with
tiny data. So: optimise the redirect path, cache aggressively, and don't over-engineer
storage.

## 3. API

```
POST /api/v1/urls              { longUrl, customAlias?, expiresAt? }  [auth]
   → 201 { shortUrl: "https://sho.rt/aB3xK9", code: "aB3xK9" }

GET  /:code                    → 302 redirect to the long URL
GET  /api/v1/urls              → my links, paginated                  [auth]
GET  /api/v1/urls/:code/stats  → { clicks, createdAt }                [auth + owner]
DELETE /api/v1/urls/:code                                             [auth + owner]
```

## 4. Data model (MySQL)

```sql
CREATE TABLE urls (
  id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  code        VARCHAR(10)  NOT NULL UNIQUE,       -- the short code; UNIQUE = indexed
  long_url    VARCHAR(2048) NOT NULL,
  user_id     INT UNSIGNED NULL,
  click_count BIGINT UNSIGNED NOT NULL DEFAULT 0, -- denormalized counter
  expires_at  DATETIME NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_created (user_id, created_at)
) ENGINE=InnoDB;
```

**Why MySQL and not MongoDB here:** the access pattern is a single exact-match lookup on a
unique key, which a B-tree does perfectly, and the data is small and uniform. Either would
work — say that, then justify. (Real bit.ly-scale systems use a key-value store like
DynamoDB or Cassandra, since there are no relationships at all. Mentioning that shows you
know where the design leads.)

---

## Generating the short code — the core question

### Option A — hash the URL (MD5/SHA, take the first 7 chars)
Deterministic, so the same URL gives the same code. But **collisions** are possible and you
must check-and-retry, and you can't shorten the same URL twice with different settings.

### Option B — base62 encode an auto-increment ID ✅ *the answer to give*

```js
const CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'; // 62

function toBase62(id) {
  let s = '';
  while (id > 0) { s = CHARS[id % 62] + s; id = Math.floor(id / 62); }
  return s || '0';
}
// id 1000000 → "4c92"
```

**Zero collisions by construction** — the database already guarantees ids are unique. And
62^7 ≈ 3.5 trillion codes, so 7 characters is plenty essentially forever.

**The catch they'll probe:** sequential ids make codes guessable and enumerable — anyone can
walk `aB3xK9` → `aB3xKA` and read other people's links. Two fixes:

1. **Offset and scramble** the id before encoding (e.g. multiply by a large coprime, mod
   62^7) — reversible, still collision-free, no longer sequential.
2. **Random 7-char code with a uniqueness retry.** At 1M rows out of 3.5 trillion, collision
   probability per insert is negligible, so the retry loop essentially never runs. Rely on
   the `UNIQUE` constraint to catch it and retry.

Random-with-retry is simplest and what I'd build. Saying "the auto-increment approach is
collision-free but enumerable, so I'd scramble or go random" is exactly the depth wanted.

---

## The redirect path (the hot path)

```
GET /aB3xK9
   ↓
Check Redis:  GET url:aB3xK9
   ├─ HIT  → 302 to long_url                       ~1ms   ← 95%+ of traffic
   └─ MISS → SELECT long_url FROM urls WHERE code=?
             → SETEX url:aB3xK9 86400 <long_url>
             → 302
   ↓
Enqueue a click event (fire-and-forget) — never block the redirect
```

**301 vs 302 — a favourite follow-up:**
- **301 Permanent** — the browser caches it forever, so subsequent clicks never reach your
  server. Faster for the user, but **you lose all click analytics**.
- **302 Found** — the browser asks every time, so you can count clicks.

> *"Use 302, because analytics is a product requirement. If we didn't need click tracking,
> 301 would be faster and cheaper."* Knowing *why* is the whole point of the question.

### Counting clicks without killing the database

`UPDATE urls SET click_count = click_count + 1` on every redirect means a write per read —
on a hot link that's a row-lock hotspot.

> *"I'd increment a Redis counter on the redirect and flush the aggregates to MySQL
> periodically — say every minute — or push click events onto a queue and have a worker
> batch them. Analytics tolerate a few seconds of lag, so there's no reason to pay for a
> synchronous write on the hot path."*

---

## Handling the edge cases (raise these yourself)

| Case | Handling |
|------|----------|
| Code not found | 404 page, not a 500 |
| Link expired | Check `expires_at`; 410 Gone |
| Custom alias taken | 409 Conflict — the `UNIQUE` index enforces it |
| Malicious URL | Check against a safe-browsing list on create; allow reporting |
| Abuse / spam | Rate limit link creation per user and per IP |
| Open redirect | Validate the scheme is http/https; reject `javascript:` |

---

## Scaling it (only if asked)

- **Cache** absorbs almost everything — a small hot set gets nearly 100% hit rate
- **Read replicas** for cache misses
- **CDN / edge** — redirects can be served at the edge, since the mapping is immutable
- **Sharding** by code prefix if it ever came to that — but 6 GB/year means it won't

---

## Say this in the interview (the 90-second version)

> "First I'd confirm the requirements — custom aliases, expiry, analytics, and whether
> links belong to users. Then the key observation is that this is extremely read-heavy,
> maybe 100 reads per write, but with very little data — a few GB a year. So the whole
> design is about making the redirect fast, not about storage.
>
> The API is a POST to create a short URL and a GET on the code that returns a redirect.
> The table is basically id, code, long_url, user_id and a click count, with a unique index
> on code — which is the only lookup that matters.
>
> For generating the code, base62-encoding an auto-increment id is collision-free by
> construction and 7 characters gives about 3.5 trillion combinations. The downside is that
> sequential ids are enumerable, so I'd either scramble the id before encoding or just
> generate a random 7-character code and let the unique constraint catch the rare collision
> and retry.
>
> On the redirect path I check Redis first and fall back to MySQL on a miss, writing it back
> to the cache. Since the mapping never changes, the cache hit rate should be very high. I'd
> return a 302 rather than a 301 — a 301 gets cached by the browser and you lose click
> tracking entirely.
>
> For click counts I wouldn't write to MySQL on every redirect. I'd increment a Redis
> counter and flush aggregates periodically, because analytics can tolerate a little lag and
> a synchronous write per read would be the bottleneck."

---

## My attempt

<!-- Day 22: cover the page, set a 20-min timer, do it out loud, then compare. -->
