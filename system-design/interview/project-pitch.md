# My Project, Explained as a System Design Answer

> **"Tell me about a project you've built."**
>
> This is the **most asked question in every interview you will have**, and at the 6 LPA
> band it decides the outcome more than any "design Twitter" question. It's also the one
> place where you get to choose the ground — everything you've learned in this repo can be
> pulled into this answer.
>
> **The trap:** describing features. *"It has login, admin panel, cart, payment..."* — that's
> a product tour, and it sounds like everyone else.
> **The fix:** describe **decisions and trade-offs**. That's what a system design answer is.

---

## Fill this in for YOUR project

Pick the project you know best and can defend under questioning. One project, deeply, beats
three shallowly.

### The 60-second version (memorise this)

Fill each line, then say the whole thing out loud until it's smooth.

**1. What it is + who uses it** (1 sentence)
> _______________________________________________

**2. The stack, with one reason** (1 sentence)
> "React on the front end, Node and Express for the API, MySQL for _______ because
> _______, and Redis for _______."

**3. Scale or usage — any real number you have**
> "About ____ users / ____ products / ____ requests a day."
> *(No real users? Say so honestly and give the load you tested with. Never invent numbers —
> the follow-up questions will expose it instantly.)*

**4. The one interesting technical problem** (this is the whole answer — 3–4 sentences)
> Problem: _______________________________________________
> What I tried first: _______________________________________________
> Why it didn't work: _______________________________________________
> What I did instead: _______________________________________________
> Result (with a number if you have one): _______________________________________________

**5. What you'd do differently now** (1 sentence — shows growth, and they always ask)
> _______________________________________________

---

## What makes a good "interesting problem"

You need **one** of these, told properly. If your project doesn't have one yet, **build it
this week** — it's worth more than another topic file.

| Problem | What it lets you talk about |
|---------|----------------------------|
| A slow page you profiled and fixed | Indexing, EXPLAIN, N+1 — [topics/04](../topics/04-indexing-and-query-optimization.md) |
| Double-submission or a stock race | Transactions, locking, idempotency — [topics/05](../topics/05-transactions-and-acid.md) |
| Adding caching to a hot endpoint | Cache-aside, TTL, invalidation — [topics/07](../topics/07-caching-and-redis.md) |
| Moving emails or image processing to a queue | Async work, retries — [topics/10](../topics/10-background-jobs-and-uploads.md) |
| Auth with refresh tokens | JWT, HttpOnly cookies, revocation — [topics/06](../topics/06-auth-and-security.md) |
| Moving uploads from disk to S3 | Stateless servers, presigned URLs — [topics/08](../topics/08-scaling-basics.md) |

**The structure that always works:** *problem → what I tried → why it failed → what I did →
measurable result.* The "why it failed" step is what makes it sound real rather than
rehearsed. Nobody's first attempt works.

### Example of the right shape

> "The product listing page was taking about four seconds. I assumed it was the query, but
> when I checked, each individual query was fast — I was running one query for the products
> and then a separate query per product to fetch its category, so fifty products meant
> fifty-one round trips. I fixed it with a join in a single query, and added a composite
> index on category_id and price for the filter. That took it from around four seconds to
> under 300 milliseconds. Afterwards I added Redis caching on the listing with a one-hour
> TTL, invalidated whenever a product changes."

Four sentences. It demonstrates profiling, N+1, indexing, and caching — four topics — without
ever sounding like it's reciting them. **This is the target.**

---

## The five follow-ups you will get — prepare all five

**1. "Why did you choose MySQL over MongoDB?" (or vice versa)**
Never answer "because I know it." Give the data-model reason — see
[topics/09](../topics/09-sql-vs-nosql.md).
> Your answer: _______________________________________________

**2. "How does authentication work in your project?"**
Walk the flow: login → token issued → where it's stored → how it's verified → how logout
works. [topics/06](../topics/06-auth-and-security.md).
> Your answer: _______________________________________________

**3. "What happens if your traffic goes 10x tomorrow?"**
The ordered list from [topics/08](../topics/08-scaling-basics.md) — measure, optimise, cache,
scale up, scale out. Then name the specific thing in *your* project that breaks first.
> Your answer: _______________________________________________

**4. "What was the hardest bug you hit?"**
Have one ready, told the same way: symptom → what you suspected → how you found the real
cause → fix. The debugging *method* is what's being graded.
> Your answer: _______________________________________________

**5. "What would you do differently?"**
Never "nothing." Pick one real thing and explain the trade-off you'd now make differently.
> Your answer: _______________________________________________

---

## Rules for delivering it

- **Lead with the problem, not the tech.** "Users couldn't find products fast enough" is a
  better opening than "I used React and Node."
- **Numbers beat adjectives.** "From 4s to 300ms" lands; "much faster" doesn't.
- **Own what you did.** If it was a team project, be exact about your part. Claiming
  someone else's work collapses at the first follow-up.
- **Never bluff.** *"I haven't used that, but my understanding is..."* is a respected answer.
  A confident wrong answer is the fastest way to fail an interview.
- **Stop talking after 90 seconds.** Let them ask. The follow-ups are where you score, and
  you steer them toward what you know by choosing what you mention.
- **Have the repo open** in a browser tab if it's a live interview.

---

## Rehearsal log

Record yourself once. It's uncomfortable and it's the single fastest fix for rambling.

| Date | Version rehearsed | What to fix |
|------|-------------------|-------------|
| | | |
