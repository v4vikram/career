# System Design — MERN + MySQL (6 LPA Track)

My personal system design notes. Written to answer the questions that actually get
asked in Node / Express / React / MongoDB / MySQL interviews in India — not to
memorise FAANG-scale distributed systems theory.

**Target:** 6 LPA backend / fullstack role
**Sprint:** 4 weeks (started 2026-08-25 → interview-ready ~2026-09-22)
**Stack I answer from:** Node.js, Express, React, MongoDB, MySQL, Redis

---

## How I use this repo

1. Open **[ROADMAP.md](ROADMAP.md)** — it tells me what to study today. I never decide.
2. Read the topic file top to bottom. Every file ends with a **"Say this in the interview"**
   block — that is the part I rehearse out loud.
3. Tick the box in the table below when I can explain it *without reading*.
4. `git add . && git commit -m "day N: <topic>" && git push`

> **The only rule:** notes go in the numbered file they belong to.
> No new folders. No reorganising. If something genuinely doesn't fit,
> it goes at the bottom of [interview/qa-bank.md](interview/qa-bank.md) and I move on.

---

## Tier 1 — the 10 topics that get me the job

Ordered so each one builds on the last. Every topic here shows up in real 6 LPA interviews.

| # | Topic | How it gets asked | Done |
|---|-------|-------------------|:----:|
| 01 | [Request lifecycle & HTTP](topics/01-http-request-lifecycle.md) | "What happens when I type a URL and hit enter?" | [ ] |
| 02 | [REST API design](topics/02-rest-api-design.md) | "Design the APIs for a blog / cart / booking" | [ ] |
| 03 | [MySQL schema design](topics/03-mysql-schema-design.md) | "Design the tables for an e-commerce site" | [ ] |
| 04 | [Indexing & query optimization](topics/04-indexing-and-query-optimization.md) | "This query is slow. Fix it." | [ ] |
| 05 | [Transactions & ACID](topics/05-transactions-and-acid.md) | "Two people book the last seat. What happens?" | [ ] |
| 06 | [Auth & security](topics/06-auth-and-security.md) | "How does JWT work? Where do you store it?" | [ ] |
| 07 | [Caching & Redis](topics/07-caching-and-redis.md) | "How would you make this endpoint faster?" | [ ] |
| 08 | [Scaling basics](topics/08-scaling-basics.md) | "Your app has 10x users tomorrow. Now what?" | [ ] |
| 09 | [SQL vs NoSQL](topics/09-sql-vs-nosql.md) | "Why MySQL here and MongoDB there?" | [ ] |
| 10 | [Background jobs & file uploads](topics/10-background-jobs-and-uploads.md) | "How do you send 10,000 emails?" | [ ] |

## Design walkthroughs

Practice answering a full "design X" question in 20 minutes.

| # | Design | Covers | Done |
|---|--------|--------|:----:|
| 01 | [URL shortener](designs/01-url-shortener.md) | hashing, read-heavy, caching, DB choice | [ ] |
| 02 | [E-commerce backend](designs/02-ecommerce-backend.md) | schema, transactions, stock races, orders | [ ] |
| 03 | [Chat application](designs/03-chat-app.md) | WebSockets, message storage, real-time | [ ] |

## Interview prep

| File | What it's for | Done |
|------|---------------|:----:|
| [interview/qa-bank.md](interview/qa-bank.md) | 60 rapid-fire Q&A with the answer to actually say | [ ] |
| [interview/project-pitch.md](interview/project-pitch.md) | My own project, explained as a system design answer | [ ] |

---

## Tier 2 — after I'm hired

Locked until the 6 LPA offer is signed. See **[tier2/README.md](tier2/README.md)**.
Message queues, sharding, microservices, observability, CDNs, consistency models.
Deliberately not started — they don't move the needle at this band and they eat
time I need for Tier 1.

---

## Progress log

Newest first. One line per session, so I can see the streak.

| Date | Did | Notes |
|------|-----|-------|
| 2026-08-25 | Repo set up, roadmap written | Day 0 |
