# 07 — Caching & Redis

> **How it's asked:** "This endpoint is slow — how do you make it faster?" / "Where would
> you use Redis?" / "How do you invalidate a cache?"
> Caching is the easiest big win to *describe*, and invalidation is where they find out
> whether you've actually done it.

---

## Why cache

A MySQL query on an indexed column: **~1–10 ms**. A Redis `GET`: **~0.1–1 ms**, and it
never touches disk. More importantly, the cached call removes load from the database —
which is almost always the hardest thing in your stack to scale.

**Cache when data is:** read far more than written, expensive to compute, and tolerant of
being slightly stale.

**Don't cache:** data that must be exact right now (account balance, remaining stock at
checkout), data read once, or anything user-specific you might accidentally serve to
another user.

---

## The layers of caching (name these — it shows breadth)

```
Browser cache        Cache-Control, ETag           — free, closest to the user
   ↓
CDN                  Cloudflare, CloudFront        — static assets, images, JS bundles
   ↓
App-level cache      Redis / Memcached             — query results, sessions   ← you build this
   ↓
Database cache       InnoDB buffer pool            — MySQL's own, automatic
```

At the 6 LPA band "application cache" means Redis, but mentioning the other three in one
sentence is cheap and lands well.

---

## Cache-aside (lazy loading) — the default pattern

This is the one you'll implement 95% of the time.

```
Read:   check cache → hit?  return it
                    → miss? query DB → write to cache → return
Write:  write to DB → delete (or update) the cache key
```

```js
async function getProduct(id) {
  const key = `product:${id}`;

  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);              // hit

  const product = await Product.findByPk(id);         // miss
  if (!product) return null;

  await redis.setex(key, 3600, JSON.stringify(product));  // TTL 1 hour
  return product;
}

async function updateProduct(id, data) {
  const product = await Product.update(data, { where: { id } });
  await redis.del(`product:${id}`);                   // invalidate, don't rewrite
  return product;
}
```

**Delete rather than update the key on write.** Updating means two writers can interleave
and leave a stale value permanently. Deleting means the next read repopulates from the
source of truth — self-healing.

### The other patterns, in one line each

| Pattern | How | Use when |
|---------|-----|----------|
| **Cache-aside** | App checks cache, fills on miss | Default. Almost always this. |
| **Write-through** | Write to cache and DB together | Cache must never be stale; slower writes |
| **Write-behind** | Write to cache, flush to DB async | Very write-heavy; risks data loss on crash |
| **Read-through** | Cache library fetches from DB itself | When your cache layer supports it |

---

## Key naming and TTL

```
product:123                     a single entity
products:category:5:page:1      a list, parameterised
user:42:cart                    user-scoped
session:abc123                  a session
ratelimit:ip:1.2.3.4            a counter
```

Use `:` separators and put the variable parts last so you can reason about (and scan)
groups of keys.

**Always set a TTL.** A cache without expiry is a memory leak that also serves stale data
forever. Rough guide:

| Data | TTL |
|------|-----|
| Product detail | 1 hour |
| Category / navigation lists | 6–24 hours |
| Homepage feed | 5 minutes |
| Search results | 1–5 minutes |
| User session | matches the session lifetime |

---

## Invalidation — "the hardest problem"

Three strategies, in the order you'd actually reach for them:

1. **TTL only.** Simplest. Accept staleness up to the TTL. Perfect for things nobody
   notices being a few minutes old.
2. **Explicit delete on write.** What the code above does. Correct and cheap for
   single-entity keys.
3. **Versioned / namespaced keys** — when one write invalidates *many* keys and you can't
   enumerate them:

```js
// Instead of trying to delete products:category:5:page:1..500
const v = await redis.incr('products:v');            // bump one counter
const key = `products:v${v}:category:5:page:1`;      // all old keys are now unreachable
```

Old keys are orphaned and expire on their own. This is the sharp answer to *"how do you
invalidate a paginated list when one item changes?"*

> **Never use `KEYS *` in production** — it's O(n) and blocks the single-threaded Redis
> server. Use `SCAN` if you must iterate, or design keys so you don't have to.

---

## The three cache failure modes (senior-sounding, easy to learn)

| Problem | What happens | Fix |
|---------|--------------|-----|
| **Cache stampede** (thundering herd) | A hot key expires; 1,000 concurrent requests all miss and all hit the DB at once | A short lock so only one request rebuilds; or stagger TTLs with jitter (`3600 + random(0,300)`) |
| **Cache penetration** | Requests for an id that doesn't exist never populate the cache, so every one reaches the DB | Cache the negative result too (`null` with a short TTL); or a bloom filter |
| **Cache avalanche** | Many keys given the same TTL all expire in the same second | TTL jitter; warm critical keys ahead of expiry |

The jitter fix is one line and covers two of the three:

```js
const ttl = 3600 + Math.floor(Math.random() * 300);
await redis.setex(key, ttl, JSON.stringify(data));
```

---

## What else Redis is good for

Redis is not only a cache. Naming these shows range:

| Use | Redis feature |
|-----|---------------|
| Sessions | `SETEX` — shared across all app servers, so servers stay stateless |
| Rate limiting | `INCR` + `EXPIRE` |
| Job queue | Lists (`LPUSH`/`BRPOP`), or BullMQ on top |
| Leaderboard | Sorted sets (`ZADD`/`ZREVRANGE`) |
| Pub/Sub | `PUBLISH`/`SUBSCRIBE` — broadcasting socket events across servers |
| Distributed lock | `SET key val NX PX 30000` |

```js
// Rate limiter: 100 requests per 15 minutes per IP
const key = `ratelimit:${req.ip}`;
const count = await redis.incr(key);
if (count === 1) await redis.expire(key, 900);
if (count > 100) return res.status(429).json({ error: 'Too many requests' });
```

**Redis is single-threaded** — which is why `INCR` is atomic with no locking, and also why
one slow command (`KEYS *`) blocks everything.

---

## Measuring it

**Hit rate = hits / (hits + misses).** Below ~80% and your caching probably isn't earning
its complexity — usually wrong TTLs, or you're caching things nobody reads twice.

Also decide the eviction policy. `allkeys-lru` is the sane default for a pure cache: when
memory fills, drop the least recently used. `noeviction` (the default) makes writes fail
when full — fine for a queue, wrong for a cache.

---

## Say this in the interview

> "First I'd find out *why* it's slow — usually it's a missing index or an N+1, and caching
> a bad query just hides the problem. Once the query is sound, if the data is read-heavy and
> tolerates being slightly stale, I'd add Redis with a cache-aside pattern: check Redis,
> return on a hit, otherwise query MySQL, write it back with a TTL, and return.
>
> On writes I delete the key rather than updating it, so the next read repopulates from the
> source of truth — updating in place lets two writers interleave and leave a permanently
> stale value.
>
> I always set a TTL, and I add jitter to it so a lot of keys don't expire in the same
> second and stampede the database. For a hot key I'd also guard the rebuild with a short
> lock so only one request regenerates it. And I'd cache negative results with a short TTL,
> otherwise requests for ids that don't exist bypass the cache entirely every time.
>
> For invalidating something like a paginated list where one write affects many keys, I'd
> use a version number in the key prefix and just bump the counter, which orphans all the
> old keys at once instead of trying to delete them.
>
> Beyond caching I'd use Redis for sessions, rate limiting with INCR and EXPIRE, and as a
> job queue via BullMQ."

**Rehearse until:** you can write the cache-aside function from memory and name all three
failure modes with their fixes.

---

## My practice — endpoint I cached

<!-- Day 16: add Redis caching to one real endpoint. Record before/after response time. -->
