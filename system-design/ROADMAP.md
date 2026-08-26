# 28-Day Sprint — Tier 1

**Start:** 2026-08-25 · **Interview-ready:** 2026-09-22
**Budget:** ~1.5 hrs/day. On a bad day do the *30-min fallback* and still tick the box.

The order is deliberate: HTTP → APIs → database → auth → performance → scale → practice.
Each week ends with a recall day, because re-reading is not learning. Saying it out loud is.

---

## Week 1 — Foundations & the database (Aug 25 – Aug 31)

| Day | Date | Task | 30-min fallback |
|-----|------|------|-----------------|
| 1 | Aug 25 | Read [01 — Request lifecycle & HTTP](topics/01-http-request-lifecycle.md). Draw the browser→DNS→server→DB path on paper from memory. | Read the "Say this" block, redraw the diagram |
| 2 | Aug 26 | Read [02 — REST API design](topics/02-rest-api-design.md). Then design the full API for a blog (posts, comments, likes) in a new section at the bottom of that file. | Just the status-code + naming tables |
| 3 | Aug 27 | Finish the blog API. Add pagination + error format. Compare against the file's worked example. | Write 5 endpoints with correct verbs |
| 4 | Aug 28 | Read [03 — MySQL schema design](topics/03-mysql-schema-design.md). Normalize the blog into tables. | 1NF/2NF/3NF definitions + one example each |
| 5 | Aug 29 | Schema for e-commerce: users, products, categories, cart, orders. Write the actual `CREATE TABLE` statements. | Just the M:N junction-table pattern |
| 6 | Aug 30 | Read [04 — Indexing & query optimization](topics/04-indexing-and-query-optimization.md). Run `EXPLAIN` on 3 real queries in your own project. | B-tree + leftmost prefix rule |
| 7 | Aug 31 | **Recall day.** Close the laptop. Explain topics 01–04 out loud, 5 min each. Whatever you stumble on, reread only that. | Pick the 2 weakest |

## Week 2 — Correctness & auth (Sep 1 – Sep 7)

| Day | Date | Task | 30-min fallback |
|-----|------|------|-----------------|
| 8 | Sep 1 | Finish [04 — Indexing](topics/04-indexing-and-query-optimization.md): the N+1 section. Find an N+1 in your own code. | Read the N+1 section only |
| 9 | Sep 2 | Read [05 — Transactions & ACID](topics/05-transactions-and-acid.md). | ACID + the 4 isolation levels |
| 10 | Sep 3 | Transactions part 2: the double-booking problem, `SELECT ... FOR UPDATE`, optimistic vs pessimistic locking. | The last-seat worked example |
| 11 | Sep 4 | Read [06 — Auth & security](topics/06-auth-and-security.md). JWT vs session — be able to argue both sides. | JWT structure + where to store it |
| 12 | Sep 5 | Auth part 2: refresh tokens, bcrypt, RBAC. Implement a refresh-token flow in any side project. | Read the refresh-token flow diagram |
| 13 | Sep 6 | Security checklist: OWASP items a MERN dev is expected to know (SQLi, XSS, CSRF, rate limiting). | The checklist table |
| 14 | Sep 7 | **Recall day.** Explain 05 + 06 out loud. Then do the first 20 questions in [qa-bank](interview/qa-bank.md) cold. | 10 questions |

## Week 3 — Performance & scale (Sep 8 – Sep 14)

| Day | Date | Task | 30-min fallback |
|-----|------|------|-----------------|
| 15 | Sep 8 | Read [07 — Caching & Redis](topics/07-caching-and-redis.md). | Cache-aside pattern + TTL |
| 16 | Sep 9 | Caching part 2: invalidation strategies, what NOT to cache. Add Redis caching to one endpoint in your project. | The invalidation section |
| 17 | Sep 10 | Read [08 — Scaling basics](topics/08-scaling-basics.md). Vertical vs horizontal, load balancers, stateless servers. | The stateless-server rule + why sessions break |
| 18 | Sep 11 | Scaling part 2: read replicas, master-slave, replication lag, connection pooling. | Read replica diagram |
| 19 | Sep 12 | Read [09 — SQL vs NoSQL](topics/09-sql-vs-nosql.md). This is *guaranteed* to be asked in a MERN + MySQL interview. | The decision table |
| 20 | Sep 13 | Read [10 — Background jobs & uploads](topics/10-background-jobs-and-uploads.md). | Why you never send email in the request |
| 21 | Sep 14 | **Recall day.** Explain 07–10 out loud. Questions 21–40 in the qa-bank, cold. | 10 questions |

## Week 4 — Practice & pitch (Sep 15 – Sep 21)

This is the week that converts knowledge into offers. Do not skip it to read more theory.

| Day | Date | Task | 30-min fallback |
|-----|------|------|-----------------|
| 22 | Sep 15 | [Design 01 — URL shortener](designs/01-url-shortener.md). Time yourself: 20 min, whiteboard style, out loud. | Read the walkthrough |
| 23 | Sep 16 | [Design 02 — E-commerce backend](designs/02-ecommerce-backend.md). Same drill. | Read the walkthrough |
| 24 | Sep 17 | [Design 03 — Chat app](designs/03-chat-app.md). Same drill. | Read the walkthrough |
| 25 | Sep 18 | Fill in [interview/project-pitch.md](interview/project-pitch.md) with **your own** project. This is the single most-asked question. | Write the 60-second version only |
| 26 | Sep 19 | Rehearse the project pitch until it's smooth. Record yourself once. Then answer the 5 follow-up questions in that file. | Rehearse the 60-second version 5x |
| 27 | Sep 20 | Full qa-bank, all 60, cold. Mark every one you fumble. | Questions 41–60 |
| 28 | Sep 21 | Reread only what you marked yesterday. Update your resume with the vocabulary from these notes. | The marked ones |

---

## After day 28

- Start applying. Do not extend the sprint — you learn faster from real interviews than from a 5th recall day.
- After every interview, add the questions you were asked to [interview/qa-bank.md](interview/qa-bank.md). That file becomes your edge.
- Tier 2 stays locked until the offer. See [tier2/README.md](tier2/README.md).

## If you fall behind

Don't restart. Skip to the current day's date and carry the missed topic into a recall day.
A half-finished sprint that reaches Week 4 beats a perfect Week 1 you never left.
