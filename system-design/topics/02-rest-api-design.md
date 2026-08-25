# 02 — REST API Design

> **How it's asked:** "Design the REST APIs for a blog / cart / booking system."
> This is the highest-frequency system design question at the 6 LPA band, because it's
> exactly what you'd do on day one of the job. Get this one clean and you look senior.

---

## The rules, in priority order

### 1. URLs are nouns. Verbs live in the HTTP method.

| ❌ Wrong | ✅ Right |
|---------|---------|
| `POST /createUser` | `POST /users` |
| `GET /getUserById/5` | `GET /users/5` |
| `POST /updateUser/5` | `PATCH /users/5` |
| `GET /deleteUser/5` | `DELETE /users/5` |

### 2. Plural, lowercase, hyphenated.
`/users`, `/order-items`, not `/User` or `/order_items`.

### 3. Nesting shows ownership — but stop at two levels.

```
GET  /users/5/orders          ✅  orders belonging to user 5
GET  /users/5/orders/12/items ❌  too deep — use /orders/12/items
```

Once a resource has its own id, address it directly.

### 4. Filtering, sorting, pagination are query params, not paths.

```
GET /products?category=shoes&minPrice=500&sort=-createdAt&page=2&limit=20
```

`-createdAt` = descending. Never invent `/products/sortedByPrice`.

---

## Pagination — offset vs cursor

**Offset (what you'll build first):**
```
GET /products?page=2&limit=20     →  SQL: LIMIT 20 OFFSET 20
```
Simple, lets you jump to any page. Breaks down two ways: `OFFSET 100000` makes MySQL scan
and discard 100,000 rows, and if a row is inserted while the user pages, they see an item
twice.

**Cursor / keyset (what you say to sound senior):**
```
GET /products?limit=20&after=eyJpZCI6MTIzfQ
→  SQL: WHERE (created_at, id) < (?, ?) ORDER BY created_at DESC, id DESC LIMIT 20
```
Constant time at any depth, stable under inserts. Cost: no "jump to page 47".

> **Say this:** *"Offset pagination for admin tables where people jump around, cursor
> pagination for infinite scroll feeds — because offset gets slower the deeper you go."*

**Always return metadata:**
```json
{
  "data": [ ... ],
  "pagination": { "page": 2, "limit": 20, "total": 340, "totalPages": 17 }
}
```

---

## One consistent response shape

Pick a shape and never deviate — the frontend should never have to guess.

**Success**
```json
{ "success": true, "data": { "id": 5, "name": "Vikram" } }
```

**Error**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is already registered",
    "details": [{ "field": "email", "issue": "duplicate" }]
  }
}
```

Rules that matter:
- The **HTTP status code carries the outcome**. Never return `200 OK` with
  `{"success": false}` — that's the single most common junior API mistake.
- `code` is a stable machine-readable string the frontend can switch on. `message` is for
  humans and can change freely.
- Never leak stack traces or SQL errors to the client. Log them, return a generic 500.

---

## Versioning

```
/api/v1/users        ← URL versioning. Do this.
```

It's visible, cacheable, and trivial to route in Express (`app.use('/api/v1', v1Routes)`).
Header-based versioning (`Accept: application/vnd.api.v2+json`) is cleaner in theory and
a support burden in practice.

**Rule:** version bumps are for *breaking* changes only. Adding a new optional field is
not breaking — removing or renaming one is.

---

## Worked example — blog API

```
Auth
  POST   /api/v1/auth/register          201 → { user, accessToken }
  POST   /api/v1/auth/login             200 → { user, accessToken }  (refresh in HttpOnly cookie)
  POST   /api/v1/auth/refresh           200 → { accessToken }
  POST   /api/v1/auth/logout            204

Posts
  GET    /api/v1/posts                  200 → paginated list
         ?page=1&limit=10&tag=node&author=5&sort=-createdAt&search=express
  POST   /api/v1/posts                  201 → created post          [auth]
  GET    /api/v1/posts/:slug            200 → single post
  PATCH  /api/v1/posts/:id              200 → updated post          [auth + owner]
  DELETE /api/v1/posts/:id              204                         [auth + owner or admin]

Comments  (nested — a comment has no meaning without its post)
  GET    /api/v1/posts/:id/comments     200 → paginated
  POST   /api/v1/posts/:id/comments     201                         [auth]
  DELETE /api/v1/comments/:id           204   ← direct, has its own id  [auth + owner]

Likes  (toggle-style action on a sub-resource)
  PUT    /api/v1/posts/:id/like         200 → { liked: true,  count: 42 }   [auth]
  DELETE /api/v1/posts/:id/like         200 → { liked: false, count: 41 }   [auth]
```

**Why `PUT`/`DELETE` for like instead of `POST /posts/5/toggleLike`:**
it's idempotent. Double-tap on a flaky network can't produce a wrong count.

---

## When REST isn't the right answer

Be ready for *"when would you not use REST?"*:

- **GraphQL** — when clients need wildly different field sets and you're suffering
  over-fetching / under-fetching across many screens. Cost: caching and rate limiting get harder.
- **WebSockets** — anything genuinely real-time (chat, live tracking). REST can't push.
- **gRPC** — high-throughput internal service-to-service calls. Not for browsers.

At this band, saying *"REST for CRUD, WebSockets for real-time, and I'd consider GraphQL
only if the client fetch patterns really justified it"* is exactly the right depth.

---

## Checklist for any API you design

- [ ] Nouns in URLs, verbs as methods
- [ ] Correct status codes (201 on create, 204 on delete, 401 vs 403)
- [ ] Pagination on every list endpoint — no unbounded `GET /users`
- [ ] Consistent success and error envelope
- [ ] Validation at the edge (Zod / Joi / express-validator), not in the DB layer
- [ ] Auth middleware on every mutating route
- [ ] Rate limiting on auth and write endpoints
- [ ] Versioned under `/api/v1`
- [ ] No secrets, stack traces, or internal IDs leaked in responses

---

## Say this in the interview

> "I'd design resource-oriented endpoints — URLs are nouns and the HTTP method carries the
> action, so `POST /posts` to create and `PATCH /posts/:id` to update rather than
> `/createPost`. I nest only where there's real ownership, like `/posts/:id/comments`, and
> once a resource has its own id I address it directly instead of nesting deeper.
>
> Every list endpoint is paginated — offset pagination for admin screens, cursor-based for
> feeds, because offset degrades as it goes deeper. Filtering and sorting are query params.
>
> I keep one response envelope across the whole API and let the HTTP status carry the
> outcome — I never return 200 with an error body. Errors have a stable machine-readable
> code plus a human message, and I make sure nothing internal leaks out.
>
> Everything sits under `/api/v1`, and I only bump the version for breaking changes."

**Rehearse until:** someone can name any domain — food delivery, hotel booking, LMS — and
you can produce 10 correct endpoints in under three minutes.

---

## My practice — blog API

<!-- Day 2-3: design the blog API here yourself BEFORE reading the worked example above. -->
