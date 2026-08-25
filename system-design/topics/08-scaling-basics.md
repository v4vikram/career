# 08 — Scaling Basics

> **How it's asked:** "Your app has 100 users and works fine. Tomorrow it has 100,000.
> What breaks and what do you do?"
> The trap is jumping straight to microservices and Kafka. At this band the winning answer
> is a **calm, ordered list starting from the cheapest fix** — that reads as experience.

---

## The order you actually scale in

Say it in this order. The order *is* the answer.

```
1.  Measure           find the real bottleneck — don't guess
2.  Optimize          indexes, N+1, query fixes           ← free, biggest win
3.  Cache             Redis in front of hot reads
4.  Vertical scale    bigger server                        ← cheapest real change
5.  Horizontal scale  load balancer + N app servers
6.  DB read replicas  send reads to replicas
7.  CDN + object store static assets and uploads off your server
8.  Async work        queues for anything not needed in the response
9.  (later) Sharding, microservices, partitioning
```

> **Say this:** *"I'd resist re-architecting early. Most 'we need to scale' problems at this
> size are one missing index or one N+1 loop, and the fix is an afternoon rather than a
> migration."*

---

## Vertical vs horizontal

| | Vertical (scale up) | Horizontal (scale out) |
|---|---|---|
| What | Bigger CPU/RAM on one machine | More machines behind a load balancer |
| Effort | Restart the instance | Requires stateless servers |
| Ceiling | Hardware limit, and cost rises non-linearly | Effectively unlimited |
| Failure | **Single point of failure** | Survives one node dying |

**Start vertical.** It's a config change, and doubling the instance size buys you months
while you do the real work. Go horizontal when you hit the ceiling or need redundancy.

---

## Horizontal scaling requires stateless servers

**This is the key insight in the topic and a very common follow-up.**

```
              ┌──────────────┐
   users ───▶ │Load Balancer │ ──┬──▶ Node server 1
              └──────────────┘   ├──▶ Node server 2
                                 └──▶ Node server 3
                                        │
                        ┌───────────────┼───────────────┐
                        ▼               ▼               ▼
                     MySQL           Redis           S3
                 (shared state)  (sessions/cache) (uploads)
```

Any server must be able to handle any request. So **nothing user-specific may live in a
server's own memory or disk.** Three things break the moment you add a second server:

| Breaks | Why | Fix |
|--------|-----|-----|
| **In-memory sessions** | User logs in on server 1, next request hits server 2 → logged out | Sessions in Redis (or stateless JWTs) |
| **Local file uploads** | File saved on server 1's disk, download request hits server 2 → 404 | S3 / Cloudinary / object storage |
| **In-memory state** | Socket.io rooms, in-process caches, rate-limit counters diverge per server | Redis adapter / shared store |

**Sticky sessions** (the LB always sends a user to the same server) look like a fix. They're
a crutch: you lose even load distribution, and when that server dies its users are logged
out anyway. Mention it, then say why you'd use Redis instead.

### Load balancing algorithms

- **Round robin** — in turn. Fine default.
- **Least connections** — to the least busy server. Better for uneven request durations.
- **IP hash** — same client to the same server. This is how sticky sessions work.

The LB also does **health checks** (`GET /health`) and stops routing to a failed node —
that redundancy is half the reason to go horizontal.

---

## Scaling the database — the real bottleneck

App servers are easy to clone; the database is not. Order of moves:

### 1. Read replicas (master–slave replication)

```
        writes                  reads
   app ────────▶ MASTER ───▶ REPLICA 1 ◀──── app
                    │    └──▶ REPLICA 2 ◀──── app
                 (binlog)
```

Writes go to the master; the master streams its binary log to replicas; reads are spread
across replicas. Most apps are ~90% reads, so this is a big and cheap win.

**Replication lag is the catch, and it's the follow-up question.** A replica is
milliseconds-to-seconds behind. So:

> *"A user posts a comment, the write goes to the master, and the redirect reads from a
> replica that hasn't caught up — their own comment is missing. The usual fix is
> read-your-own-writes: route a user's reads to the master for a few seconds after they
> write, or read from the master for anything on a critical path."*

### 2. Connection pooling

MySQL handles a limited number of connections and each is expensive. Node must not open one
per request.

```js
const pool = mysql.createPool({
  host, user, password, database,
  connectionLimit: 10,        // per Node instance — multiply by instance count!
  queueLimit: 0,
});
```

**The gotcha:** 10 instances × a pool of 20 = 200 connections against a server configured
for 150. Size pools with the fleet in mind, or put PgBouncer/ProxySQL in front.

### 3. Partitioning and sharding (know the definitions, don't volunteer them)

- **Vertical partitioning** — split columns across tables (rarely-read blobs off a hot table).
- **Horizontal partitioning** — split rows by a key (orders by month) within one DB.
- **Sharding** — horizontal partitioning across *separate database servers*, e.g. users
  A–M on shard 1, N–Z on shard 2.

Sharding is a last resort: cross-shard joins and transactions become your problem, and
rebalancing is painful. Correct answer at this band: *"I'd shard only after replicas,
caching and archiving were exhausted."*

---

## Static assets, CDN, and uploads

- Never serve images or JS bundles from Node — it's the slowest, most expensive way.
- Put a **CDN** (Cloudflare, CloudFront) in front: edge servers cache close to users, which
  cuts latency and takes the traffic off your origin entirely.
- Uploads go to **S3 / Cloudinary**, not local disk. Use **presigned URLs** so the file goes
  browser → S3 directly and never occupies a Node process. See
  [10 — uploads](10-background-jobs-and-uploads.md).

---

## Numbers worth having in your head

Not for precision — for sounding grounded when you estimate.

| | |
|---|---|
| Memory read | ~100 ns |
| Redis GET (same DC) | ~0.5 ms |
| Indexed MySQL query | ~1–10 ms |
| Disk seek (SSD) | ~0.1 ms |
| Network round trip, same region | ~0.5 ms |
| India → US round trip | ~250 ms |
| One Node instance | ~1,000–5,000 req/s for simple JSON |

**Back-of-envelope:** 1 million daily requests ≈ 12 req/s average, but peak is typically
3–5× the average, so design for ~50 req/s. Being able to do that division out loud, and
remembering that peak ≠ average, is most of what "estimation" means here.

---

## Availability, in one line

"Three nines" (99.9%) ≈ 43 minutes of downtime a month. "Four nines" (99.99%) ≈ 4 minutes.
You get there with redundancy at every layer — multiple app servers, a replica ready to
promote, health checks and automated failover — not with one very reliable server.

---

## Say this in the interview

> "First I'd measure rather than guess — find whether it's CPU, memory, or the database.
> In my experience it's almost always the database, and often it's one missing index or an
> N+1 in a loop, so I'd fix that before changing any architecture. Then I'd put Redis in
> front of the hot read paths.
>
> If it's still tight, I'd scale vertically first because it's just a bigger instance and
> buys time. Then horizontally — a load balancer in front of several Node instances. The
> prerequisite is that the servers are stateless: sessions move to Redis, uploads move to
> S3, and any in-memory state moves to a shared store. Otherwise a user logs in on one
> server and gets logged out on the next request.
>
> For the database I'd add read replicas, since most apps are read-heavy — writes to the
> master, reads spread across replicas. The thing to watch is replication lag: right after a
> user writes something, reading from a lagging replica can show them stale data, so I'd
> route their reads to the master briefly after a write.
>
> I'd also move static assets to a CDN and push anything that doesn't need to be in the
> request — emails, image processing, reports — onto a background queue.
>
> Sharding and microservices I'd treat as a last resort, well after replicas and caching."

**Rehearse until:** you can recite the 9-step order, and you can immediately name the three
things that break when you add a second server.
