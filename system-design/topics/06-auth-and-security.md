# 06 — Authentication, Authorization & Security

> **How it's asked:** "How does JWT work?" / "Where do you store the token?" / "Session vs
> JWT — which and why?" / "How do you handle logout with JWT?"
> **This comes up in essentially every MERN interview.** The storage question and the logout
> question are where most candidates get exposed.

---

## Authentication vs Authorization

- **Authentication** — *who are you?* → login, tokens. Fails with **401**.
- **Authorization** — *what are you allowed to do?* → roles, permissions. Fails with **403**.

---

## Password storage

```js
import bcrypt from 'bcrypt';

const hash = await bcrypt.hash(plainPassword, 12);       // 12 rounds
const ok   = await bcrypt.compare(plainPassword, hash);  // never decrypt — you can't
```

- **Hashing is one-way.** You never decrypt a password; you hash the attempt and compare.
- **Salt** — a random value mixed into each hash so two users with the same password get
  different hashes, which kills rainbow-table attacks. bcrypt generates and embeds the salt
  in the output string, so you don't manage it separately.
- **Cost factor** (rounds) — deliberately slow. 10–12 is the current sensible range; each
  +1 doubles the work. Slowness is the security property.
- **Never** MD5 or SHA-256 for passwords — they're built to be *fast*, which is exactly
  wrong here. Alternatives to bcrypt: argon2 (current best), scrypt.

---

## JWT — how it actually works

Three base64url segments joined by dots: `header.payload.signature`

```
eyJhbGciOiJIUzI1NiJ9 . eyJ1c2VySWQiOjUsInJvbGUiOiJhZG1pbiJ9 . dQ8s7Fm...
   {alg, typ}              {userId, role, iat, exp}            HMAC-SHA256
```

```
signature = HMAC_SHA256(base64(header) + "." + base64(payload), SECRET)
```

**The two things everyone gets wrong:**

1. **A JWT is signed, not encrypted.** The payload is base64 — anyone can decode and read
   it. Paste one into jwt.io and there's your data. So **never put anything sensitive in
   the payload** — no passwords, no card numbers, no PII beyond an id and a role.
2. **The signature proves it wasn't tampered with.** Change the payload and the signature
   no longer matches, because the attacker doesn't have the secret. That's the whole point.

**Standard claims:** `sub` (subject/user id), `iat` (issued at), `exp` (expiry),
`iss` (issuer), `aud` (audience).

```js
const token = jwt.sign(
  { sub: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '15m' }
);

const payload = jwt.verify(token, process.env.JWT_SECRET);  // throws if invalid/expired
```

---

## Session vs JWT — be able to argue both sides

| | Session (cookie + server store) | JWT |
|---|---|---|
| State | Server stores it (Redis/DB) | Stateless — server stores nothing |
| Scaling | Needs shared store across servers | Any server can verify with the secret |
| Revoke / logout | **Instant** — delete the session | **Hard** — token is valid until it expires |
| Size | Small cookie id | Larger, sent on every request |
| Mobile / third-party APIs | Awkward | Natural |

**The honest answer, and the one that impresses:**

> *"JWTs are often chosen for the wrong reason. 'Stateless' sounds like a win until you need
> to log someone out or ban an account immediately — then you need a blocklist, and you're
> stateful again. For a normal single-backend web app, sessions in Redis are simpler and
> revocation is free. I'd reach for JWTs when I have multiple services or mobile clients
> that make a shared session store awkward."*

Saying that shows judgment, not just recall.

---

## Where do you store the token? (the trap question)

| Location | XSS-safe? | CSRF-safe? | Verdict |
|----------|:---------:|:----------:|---------|
| `localStorage` | **No** — any injected script reads it | Yes | Common, and the weakest option |
| `sessionStorage` | **No** | Yes | Same problem, shorter life |
| JS-readable cookie | **No** | No | Worst of both |
| **`HttpOnly` + `Secure` + `SameSite` cookie** | **Yes** — JS cannot read it | Needs `SameSite`/CSRF token | **This one** |

```js
res.cookie('refreshToken', token, {
  httpOnly: true,                                  // JS can't touch it → XSS can't steal it
  secure: process.env.NODE_ENV === 'production',   // HTTPS only
  sameSite: 'strict',                              // blocks CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/v1/auth/refresh',                    // sent only where it's needed
});
```

**The pattern to describe:** short-lived **access token in memory** (a JS variable / React
state — never localStorage), long-lived **refresh token in an HttpOnly cookie**.

---

## Refresh token flow

```
1. POST /auth/login
     → 200 { accessToken }  (15 min, kept in memory)
     → Set-Cookie: refreshToken=...  (7 days, HttpOnly)

2. Requests carry:  Authorization: Bearer <accessToken>

3. Access token expires → API returns 401

4. Client automatically calls POST /auth/refresh
     → cookie is sent by the browser
     → server verifies the refresh token against its stored copy
     → 200 { accessToken }  + rotates the refresh token
     → client retries the original request

5. POST /auth/logout → delete the stored refresh token, clear the cookie
```

**Why the short access token:** if it leaks, it's useless in 15 minutes.
**Why store refresh tokens server-side:** so logout and "sign out everywhere" actually work.
**Rotation:** each refresh issues a new refresh token and invalidates the old one. If an old
one is reused, that's a theft signal — revoke the whole family.

In Express, implement step 4 as an **axios response interceptor** that catches 401, calls
refresh once, and replays the request. Queue concurrent 401s so you don't fire ten refreshes.

---

## "How do you log out with a JWT?"

Be direct — this is a known weakness of JWTs and interviewers want to see you know it:

> *"You can't truly revoke a stateless JWT, so you do one of three things: keep access
> tokens short enough that expiry is good enough; keep a blocklist of revoked token ids in
> Redis with a TTL matching the token's expiry and check it on each request; or store the
> refresh token server-side and delete it, so the session dies within one access-token
> lifetime. In practice I use short access tokens plus a server-side refresh token — the
> blocklist only for immediate bans."*

---

## Authorization — RBAC

```js
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });   // 403, not 401
  }
  next();
};

router.delete('/products/:id', authenticate, authorize('admin'), deleteProduct);
```

**Ownership checks matter as much as roles.** A logged-in user must not edit someone else's
post just because they have the `user` role:

```js
if (post.userId !== req.user.id && req.user.role !== 'admin') {
  return res.status(403).json({ error: 'Forbidden' });
}
```

Missing this is **IDOR** (Insecure Direct Object Reference) — changing `/orders/12` to
`/orders/13` and seeing someone else's order. It's one of the most common real-world bugs.

---

## Security checklist a MERN dev is expected to know

| Attack | What it is | Fix |
|--------|-----------|-----|
| **SQL Injection** | `' OR 1=1 --` in an input concatenated into SQL | **Parameterized queries** (`?` placeholders) or an ORM. Never string-concatenate. |
| **NoSQL Injection** | `{ email: { $gt: "" } }` posted as JSON to bypass login | Validate types; reject objects where you expect strings (`express-mongo-sanitize`) |
| **XSS** | Attacker injects `<script>` that runs for other users | Escape output, sanitize rich text (DOMPurify), CSP header. React escapes by default — the hole is `dangerouslySetInnerHTML` |
| **CSRF** | Another site makes the browser fire an authenticated request | `SameSite=Strict/Lax` cookies, CSRF tokens. Not an issue for pure `Authorization`-header APIs |
| **IDOR** | Changing an id in the URL to read others' data | Ownership check on every fetch — never trust the id alone |
| **Brute force** | Password guessing | Rate limit login, exponential backoff, lockout, CAPTCHA |
| **Secrets in code** | Keys committed to git | `.env` + `.gitignore`, secret manager in prod, rotate anything leaked |
| **Mass assignment** | `req.body` spread into a model, user sets `role: 'admin'` | Whitelist fields explicitly |

```js
// SQL injection — the difference
db.query(`SELECT * FROM users WHERE email = '${email}'`);        // vulnerable
db.query('SELECT * FROM users WHERE email = ?', [email]);        // safe
```

**Baseline Express hardening:**
```js
app.use(helmet());                                    // security headers
app.use(rateLimit({ windowMs: 15*60*1000, max: 100 }));
app.use(express.json({ limit: '10kb' }));             // cap body size
app.use(cors({ origin: allowedOrigins, credentials: true }));
// + validate every input with Zod/Joi at the route boundary
```

**Timing-safe login:** return the same generic error and take the same time for "user not
found" and "wrong password", or you've built a user-enumeration endpoint.

---

## Say this in the interview

> "For passwords I use bcrypt with a cost factor around 12. It's a one-way hash with a
> per-user salt built in, and the slowness is deliberate — you never use MD5 or SHA-256 for
> passwords because being fast is exactly the wrong property.
>
> A JWT is three base64 parts — header, payload, signature — where the signature is an HMAC
> of the first two with a server secret. It's signed, not encrypted, so anyone can read the
> payload. That means no sensitive data goes in it; the signature only guarantees it hasn't
> been tampered with.
>
> On storage, I don't put tokens in localStorage — any XSS reads them. I keep a short-lived
> access token in memory and the refresh token in an HttpOnly, Secure, SameSite cookie, so
> JavaScript can't touch it. When the access token expires the client silently calls the
> refresh endpoint and retries.
>
> The honest trade-off is revocation: a stateless JWT can't really be logged out. So I keep
> access tokens short and store refresh tokens server-side — deleting one ends the session
> within one access-token lifetime. For an immediate ban I'd add a Redis blocklist with a
> TTL matching the token expiry. And for a single-backend app I'd genuinely consider
> sessions in Redis instead, because revocation is free and it's simpler.
>
> For authorization I use role middleware, and separately I always check ownership — a user
> having the 'user' role doesn't mean they can edit post 13 just by changing the URL. That's
> IDOR, and it's one of the most common real bugs."

**Rehearse until:** you can answer "where do you store the JWT and why not localStorage"
and "how do you log out a JWT" instantly. Those two are the whole topic in interviews.
