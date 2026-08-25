# 01 — Request Lifecycle & HTTP

> **How it's asked:** "What happens when you type google.com and press enter?"
> It looks like a warm-up question. It isn't. Interviewers use it to find out how deep
> your mental model goes, and every later question hangs off this one.

---

## The full path, in order

```
Browser
  │  1. URL parsed → scheme, host, path, query
  ▼
DNS resolution                    (browser cache → OS cache → router → ISP → root/TLD/authoritative)
  │  returns an IP: 142.250.x.x
  ▼
TCP handshake                     (SYN → SYN-ACK → ACK)  ~1 round trip
  │
  ▼
TLS handshake (https only)        (certificate check, key exchange)  ~1-2 round trips
  │
  ▼
HTTP request sent                 GET /search?q=node HTTP/1.1
  │                               Host, Cookie, Authorization, Accept headers
  ▼
Load balancer / reverse proxy     (Nginx) → picks one of N app servers
  │
  ▼
Node/Express server               middleware chain → route handler
  │                                 ├─ cache hit?  → return from Redis
  │                                 └─ cache miss  → query MySQL/MongoDB
  ▼
Response sent back                200 OK + headers + JSON/HTML body
  │
  ▼
Browser renders                   parse HTML → CSSOM → DOM → render tree → paint
```

**The one-line version to open with:** *"The URL is resolved to an IP via DNS, a TCP
(and TLS) connection is opened, an HTTP request goes to a load balancer which routes it
to an app server, the server hits cache or database, and the response comes back and is
rendered."* Then let them pick which part to drill into.

---

## HTTP methods — and the two properties that matter

| Method | Purpose | Safe? | Idempotent? |
|--------|---------|:-----:|:-----------:|
| GET | Read a resource | ✅ | ✅ |
| POST | Create a resource / trigger an action | ❌ | ❌ |
| PUT | Replace a resource entirely | ❌ | ✅ |
| PATCH | Partially update a resource | ❌ | ❌ |
| DELETE | Remove a resource | ❌ | ✅ |

- **Safe** = doesn't change server state. GET must never modify data. (A `GET /deleteUser/5`
  endpoint is a classic junior mistake — crawlers and prefetchers will fire it.)
- **Idempotent** = calling it 5 times has the same effect as calling it once.
  `PUT /users/5 {name:"A"}` five times → still one user named A. `POST /orders` five times
  → five orders. **This is why payment endpoints need an idempotency key.**

> **Follow-up they love:** *"Is DELETE idempotent if the second call returns 404?"*
> Yes. Idempotency is about the **resulting server state**, not the response code.
> After every call the resource is gone — that's the same state.

---

## Status codes you must know cold

| Code | Meaning | When you'd actually return it |
|------|---------|-------------------------------|
| 200 | OK | Successful GET/PUT/PATCH |
| 201 | Created | Successful POST — include a `Location` header |
| 204 | No Content | Successful DELETE, or a PUT with nothing to return |
| 301 / 302 | Moved permanently / temporarily | URL shortener redirect, http→https |
| 400 | Bad Request | Validation failed, malformed body |
| 401 | Unauthorized | **Not logged in** / bad or missing token |
| 403 | Forbidden | **Logged in but not allowed** — a user hitting an admin route |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate email on signup, version conflict |
| 422 | Unprocessable Entity | Semantically invalid (some teams use this over 400) |
| 429 | Too Many Requests | Rate limit hit |
| 500 | Internal Server Error | Unhandled exception — a bug |
| 502 / 503 | Bad Gateway / Unavailable | Upstream server down, deploy in progress |

**401 vs 403 is asked constantly.** 401 = *"I don't know who you are."*
403 = *"I know exactly who you are, and no."*

---

## Headers that come up

| Header | Direction | Why it matters |
|--------|-----------|----------------|
| `Authorization: Bearer <jwt>` | request | How you send a token |
| `Content-Type: application/json` | both | Express won't parse the body without it |
| `Cookie` / `Set-Cookie` | both | Sessions, refresh tokens, `HttpOnly` flag |
| `Cache-Control` | response | `max-age`, `no-store` — browser/CDN caching |
| `ETag` / `If-None-Match` | both | Conditional GET → 304 Not Modified, saves bandwidth |
| `Access-Control-Allow-Origin` | response | CORS — the #1 thing MERN devs debug |

### CORS in one paragraph
The browser blocks a page on `localhost:3000` from reading a response from
`localhost:5000` unless that server explicitly says it's allowed. It's enforced by the
**browser**, not the server — Postman doesn't care. For non-simple requests (custom
headers, PUT/DELETE) the browser first sends an `OPTIONS` **preflight**. If you send
cookies you need `credentials: true` on both sides, and then `Access-Control-Allow-Origin`
**cannot be `*`** — it must name the exact origin.

---

## Where Express fits

```js
app.use(express.json());          // 1. parse JSON body
app.use(cors({ origin: 'https://myapp.com', credentials: true }));
app.use(morgan('dev'));           // 2. log
app.use('/api', rateLimiter);     // 3. rate limit
app.use('/api/orders', authMiddleware, orderRoutes);  // 4. auth, then route

// 5. error handler — 4 args, and it must be registered LAST
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});
```

Middleware runs **in registration order**. Each one either responds or calls `next()`.
The error handler is the one with four arguments, and it only catches errors passed to
`next(err)` — in async handlers you must catch and forward yourself (or use
`express-async-errors`).

---

## HTTP/1.1 vs HTTP/2 (one-liner, in case it comes up)

HTTP/1.1 sends one request at a time per connection (head-of-line blocking), so browsers
open ~6 connections per domain. HTTP/2 multiplexes many requests over **one** connection
and compresses headers. Practical consequence: bundling and image-spriting matter much
less on HTTP/2.

---

## Say this in the interview

> "When you hit enter, the browser resolves the domain to an IP through DNS — checking its
> own cache, the OS, then the ISP resolver. It opens a TCP connection, and for HTTPS does a
> TLS handshake to verify the certificate and agree on keys. Then it sends the HTTP request
> with headers like Host, Cookie and Authorization.
>
> That request usually lands on a load balancer or reverse proxy like Nginx, which forwards
> it to one of several Node instances. In Express it goes through the middleware chain —
> body parsing, CORS, auth — and reaches the route handler. The handler typically checks
> Redis first, and only queries MySQL on a cache miss.
>
> The response comes back with a status code and JSON, and the browser parses it or renders
> the HTML — building the DOM and CSSOM, then painting.
>
> The two properties I'd highlight are safety and idempotency: GET must never change state,
> and PUT and DELETE should be safe to retry, which is why retries and payment flows depend
> on getting those right."

**Rehearse until:** you can say the whole path without the diagram, and you can immediately
answer "401 or 403?" for any scenario they throw at you.
