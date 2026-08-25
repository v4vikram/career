# Rapid-Fire Q&A Bank

> 60 questions that actually get asked at the 6 LPA band. Each answer is written the way you
> should **say** it — 2–4 sentences, no rambling.
>
> **How to use:** cover the answers. Say yours out loud. Mark the ones you fumble with an
> `x` and reread only those. Do this cold on days 14, 21 and 27.
>
> **After every real interview, add the questions you were asked at the bottom.** That
> section is what makes this file better than anything you could buy.

---

## HTTP & APIs (1–10)

**1. Difference between PUT and PATCH?**
PUT replaces the entire resource — omitted fields get cleared. PATCH updates only the fields
you send. PUT is idempotent by definition; PATCH usually is, but doesn't have to be.

**2. What does idempotent mean, and which methods are?**
Calling it N times leaves the server in the same state as calling it once. GET, PUT and
DELETE are idempotent; POST and PATCH generally aren't. It matters because clients and
proxies retry failed requests.

**3. 401 vs 403?**
401 means "I don't know who you are" — no token or an invalid one. 403 means "I know who you
are and you're still not allowed" — a logged-in user hitting an admin route.

**4. What status code for a successful POST that creates something?**
201 Created, ideally with a `Location` header pointing at the new resource. 200 works but
201 is more precise.

**5. What's CORS and why does it happen?**
The browser blocks a page on one origin from reading a response from another unless the
server explicitly allows it via `Access-Control-Allow-Origin`. It's a browser rule, not a
server one — which is why Postman never hits it. For non-simple requests the browser sends
an OPTIONS preflight first.

**6. How do you version an API?**
URL versioning, `/api/v1/...` — visible, easy to route, easy to cache. I only bump the
version for breaking changes; adding an optional field isn't breaking.

**7. Offset vs cursor pagination?**
Offset uses LIMIT/OFFSET — simple and lets you jump to any page, but it degrades as the
offset grows because the database still scans and discards those rows, and inserts shift the
pages. Cursor pagination uses the last seen key, so it's constant time and stable. Offset for
admin tables, cursor for feeds.

**8. Should an error response return 200?**
No. The status code carries the outcome. Returning 200 with `{success: false}` breaks every
HTTP client, proxy and monitoring tool that reads status codes.

**9. What is REST, in one sentence?**
An architectural style where you address resources by URL, use HTTP methods for the
operations, and keep each request stateless — the server doesn't remember anything between
requests.

**10. When would you not use REST?**
WebSockets when the server needs to push, GraphQL when clients need very different field
sets across many screens, and gRPC for high-throughput internal service calls.

---

## Databases & SQL (11–25)

**11. What is normalization? Explain 3NF.**
Organising tables so each fact is stored once. 1NF: atomic values, no repeating groups. 2NF:
no column depends on only part of a composite key. 3NF: no non-key column depends on another
non-key column — like city depending on pincode rather than on the user.

**12. When would you denormalize?**
When a read path is provably too slow, or when you need a historical snapshot. Order items
store the product's name and price at purchase time so an old invoice doesn't change when the
product is repriced.

**13. What is an index and what does it cost?**
A B+ tree kept sorted on the indexed columns, turning a full table scan into a tree
traversal. The cost is write speed and disk — every insert and update maintains every index.

**14. Explain the leftmost prefix rule.**
An index on (a, b, c) can serve queries filtering on a, or a and b, or all three — but not
on b alone or c alone. It's sorted by a first, then b within a. Like a phone book sorted by
surname: you can't find all the Vikrams without scanning it.

**15. How do you find why a query is slow?**
Check the slow query log to find the real offender, then run EXPLAIN. If `type` is ALL and
`key` is NULL it's a full scan. I also check for index-killers: a function wrapped around the
column, a leading-wildcard LIKE, or a string-vs-number type mismatch.

**16. Name things that stop an index being used.**
`YEAR(created_at) = 2026` instead of a range, `LIKE '%x%'` with a leading wildcard, comparing
a VARCHAR column to a number, `OR` across different columns, and `!=`.

**17. What is the N+1 problem?**
You fetch a list, then query inside a loop for each row's relation — one query becomes
fifty-one. It doesn't show up as one slow query, it shows up as many fast ones. Fix it with a
JOIN, `.populate()`, or by batching the ids into one `WHERE IN`.

**18. INNER vs LEFT JOIN?**
INNER returns only rows with a match on both sides. LEFT returns all rows from the left
table, with NULLs where there's no match — use it when the relation is optional, like users
who may have no orders.

**19. WHERE vs HAVING?**
WHERE filters rows before grouping; HAVING filters after, so HAVING can reference aggregates
like `COUNT(*) > 5`. Filter in WHERE where you can — it's cheaper.

**20. What is ACID?**
Atomicity — all statements commit or none do. Consistency — constraints always hold.
Isolation — concurrent transactions don't corrupt each other. Durability — once committed it
survives a crash.

**21. What's MySQL's default isolation level?**
REPEATABLE READ. And unlike the SQL standard, InnoDB also prevents phantom reads at that
level using next-key locking. PostgreSQL defaults to READ COMMITTED.

**22. Two users book the last seat simultaneously. What happens and how do you fix it?**
Both read stock = 1 before either writes, so both proceed and you oversell. A transaction
alone doesn't fix it. The simplest fix is one atomic statement — `UPDATE products SET stock =
stock - 1 WHERE id = ? AND stock > 0` — then check affected rows; zero means someone beat
you. If I need to read, compute, then write, I'd use `SELECT ... FOR UPDATE`.

**23. Pessimistic vs optimistic locking?**
Pessimistic takes a lock up front with `SELECT FOR UPDATE` — correct, but contended. Optimistic
adds a version column and retries if it changed. Pessimistic when collisions are common, like
flash-sale inventory; optimistic when they're rare, like two admins editing a product.

**24. What's a deadlock and how do you avoid it?**
Two transactions each hold a lock the other needs, so InnoDB kills one. Prevent it by always
acquiring locks in a consistent order, keeping transactions short, and retrying on error 1213.

**25. Why DECIMAL and not FLOAT for money?**
FLOAT is a binary approximation, so 0.1 + 0.2 isn't exactly 0.3 and rounding errors accumulate
across thousands of transactions. DECIMAL stores exact decimal values.

---

## MongoDB & data modelling (26–33)

**26. When MySQL and when MongoDB?**
MySQL when data is relational and needs integrity guarantees — orders, payments, inventory,
anything transactional. MongoDB when documents are self-contained with a varying shape —
logs, CMS content, reviews. I'd happily use both in one system.

**27. Embed or reference in MongoDB?**
Embed when the child is always read with the parent, is bounded, and doesn't change
independently — order items in an order. Reference when it's queried on its own, unbounded, or
shared — comments on a viral post, given the 16 MB document limit.

**28. Does MongoDB support transactions?**
Yes, multi-document ACID transactions since 4.0. They're more expensive than in MySQL and less
idiomatic — and needing them a lot usually means the data was relational to begin with.

**29. Is MongoDB schemaless?**
It has no database-enforced schema, which means enforcement moves into the application.
That's exactly why Mongoose schemas exist, and MongoDB also supports JSON Schema validation.

**30. Does MongoDB need indexes?**
Just as much as MySQL. An unindexed `find()` is a full collection scan — the same failure
mode as a missing index in SQL.

**31. What's the aggregation pipeline?**
A sequence of stages — `$match`, `$group`, `$sort`, `$lookup`, `$project` — where each
transforms the documents and passes them on. `$match` should come first so later stages
handle less data.

**32. What is CAP theorem?**
In a distributed system you can guarantee at most two of consistency, availability and
partition tolerance. Partitions happen regardless, so the real choice is CP — refuse to answer
rather than answer wrongly, like banking — or AP — always answer, possibly stale, like a feed.

**33. OLTP vs OLAP?**
OLTP is many small reads and writes serving the application — MySQL. OLAP is few huge
aggregation queries serving reporting — a warehouse. You keep them apart so heavy reports
don't crush production.

---

## Auth & security (34–43)

**34. How does JWT work?**
Three base64url parts: header, payload, and a signature that's an HMAC of the first two using
a server secret. The server verifies the signature to confirm nothing was tampered with — it
doesn't need to store anything.

**35. Is JWT encrypted?**
No, it's signed. Anyone can base64-decode the payload and read it. So it holds an id and a
role, never anything sensitive.

**36. Where do you store the JWT and why not localStorage?**
localStorage is readable by any JavaScript on the page, so a single XSS steals the token. I
keep a short-lived access token in memory and the refresh token in an HttpOnly, Secure,
SameSite cookie, which JavaScript can't touch.

**37. How do you log out with a JWT?**
You can't truly revoke a stateless token, so either keep access tokens short enough that
expiry suffices, store the refresh token server-side and delete it, or keep a Redis blocklist
of revoked token ids with a TTL matching their expiry. I use short access tokens plus a
server-side refresh token.

**38. Session vs JWT — which would you pick?**
For a single backend, sessions in Redis are simpler and revocation is free. JWTs earn their
keep with multiple services or mobile clients where a shared session store is awkward.
"Stateless" stops being true the moment you need a blocklist.

**39. Why bcrypt and not SHA-256?**
SHA-256 is designed to be fast, which is exactly wrong for passwords — an attacker can try
billions per second. bcrypt is deliberately slow with a tunable cost factor, and it salts
each hash automatically.

**40. What's a salt?**
A random value mixed into each password before hashing, so two users with the same password
get different hashes. It defeats rainbow tables. bcrypt generates and embeds it for you.

**41. How do you prevent SQL injection?**
Parameterized queries with `?` placeholders, or an ORM that does it. The database then treats
the input as a value, never as SQL. Never build a query by string concatenation.

**42. XSS vs CSRF?**
XSS is injecting script that runs in another user's browser — prevented by escaping output and
a CSP. CSRF is tricking a user's browser into firing an authenticated request from another
site — prevented by SameSite cookies or CSRF tokens. XSS steals the token; CSRF just uses it.

**43. What's IDOR?**
Changing an id in a URL — `/orders/12` to `/orders/13` — and seeing someone else's data,
because the code checked that you're logged in but not that you own the record. Fix it with an
ownership check on every fetch.

---

## Caching, scaling & architecture (44–56)

**44. What's cache-aside?**
Check the cache; on a hit return it, on a miss query the database, write it back with a TTL,
and return. On writes I delete the key rather than update it, so the next read repopulates
from the source of truth.

**45. Why delete the cache key on write instead of updating it?**
Two concurrent writers can interleave and leave a stale value permanently. Deleting is
self-healing — the next read rebuilds it correctly.

**46. What is a cache stampede and how do you fix it?**
A hot key expires and hundreds of concurrent requests all miss and hit the database at once.
Fix it with TTL jitter so keys don't expire together, plus a short lock so only one request
rebuilds the value.

**47. How do you invalidate a cached paginated list when one item changes?**
Put a version number in the key prefix and increment one counter on write. Every old key
becomes unreachable at once and expires on its own — much better than trying to enumerate
and delete hundreds of keys.

**48. What shouldn't you cache?**
Anything that must be exact right now — remaining stock at checkout, an account balance —
and anything user-specific you might accidentally serve to another user.

**49. Vertical vs horizontal scaling?**
Vertical is a bigger machine — trivial to do, but there's a ceiling and it's still a single
point of failure. Horizontal is more machines behind a load balancer — no real ceiling and
it survives a node dying, but it requires stateless servers.

**50. What breaks when you add a second server?**
In-memory sessions, so users get logged out at random. Locally stored uploads, so files 404.
And any in-process state like Socket.io rooms or rate-limit counters. Fix: sessions and shared
state in Redis, files in S3.

**51. What are read replicas and what's the catch?**
Writes go to the master, which streams its binlog to replicas that serve reads. Most apps are
read-heavy so it's a cheap win. The catch is replication lag — right after writing, a user
reading from a lagging replica may not see their own change, so route their reads to the
master briefly after a write.

**52. Your app is suddenly slow. Walk me through it.**
Measure first — find whether it's CPU, memory or the database, and check the slow query log.
Usually it's a missing index or an N+1. Then cache the hot reads, then scale vertically, then
horizontally with stateless servers, then add read replicas. I wouldn't re-architect before
measuring.

**53. Where would you use Redis besides caching?**
Sessions, rate limiting with INCR and EXPIRE, job queues via BullMQ, leaderboards with sorted
sets, pub/sub for broadcasting socket events across instances, and distributed locks.

**54. A user signs up — where does the welcome email go?**
On a queue. I create the user, enqueue the job, and respond immediately. That keeps the
response fast and means a broken email provider doesn't break signup.

**55. How would you send 10,000 emails?**
Enqueue them and let a pool of workers drain the queue with bounded concurrency so I stay
within the provider's rate limit. Each job retries with exponential backoff, and jobs that
exhaust their retries land in a dead letter queue. Jobs must be idempotent because retries can
re-run partial work.

**56. How do you handle file uploads?**
Not on the app server's disk — that breaks the moment there's a second instance. I'd use a
presigned S3 URL so the browser uploads directly to S3, store the key in the database, and
enqueue a job for thumbnails. I validate the type by magic bytes, not the extension, and I
generate the filename myself to avoid path traversal.

---

## Node-specific (57–60)

**57. Node is single-threaded — how does it handle concurrency?**
The event loop. I/O is delegated to the OS or the libuv thread pool and the result comes back
as a callback, so one thread handles thousands of concurrent connections. It only breaks down
for CPU-bound work, which blocks everything.

**58. What blocks the event loop, and what do you do about it?**
Synchronous CPU work — image resizing, big JSON parsing, bcrypt with a high cost, `readFileSync`.
Move it to a worker thread or, better, to a background job in a separate process.

**59. How do you handle errors in async Express routes?**
A thrown error in an async handler isn't caught by Express automatically — you have to catch
and call `next(err)`, or wrap handlers in an async wrapper. Then one error-handling middleware
with four arguments, registered last, formats the response.

**60. What is clustering / PM2 for?**
Node uses one core by default. The cluster module or PM2 in cluster mode forks one process per
CPU core behind a shared port, so you use the whole machine. Same requirement as horizontal
scaling: the processes must be stateless.

---

## Questions I was actually asked

> Add every question from every real interview here, with the answer you wish you'd given.
> Within a few interviews this becomes the most valuable section in the repo.

| Date | Company | Question | How it went |
|------|---------|----------|-------------|
| | | | |
