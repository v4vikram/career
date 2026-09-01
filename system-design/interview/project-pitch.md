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
> TimeWatch India's company website and internal admin dashboard — a B2B security &
> workforce-management company (biometric attendance, access control, X-ray baggage
> scanners). The public site serves prospective clients; the dashboard is used internally
> to manage the product catalog and blog content.

**2. The stack, with one reason** (1 sentence)
> "Next.js on the front end — with shadcn/ui for components and Zustand for state — Node
> and Express for the API, and MongoDB with Mongoose for the product catalog, because specs
> vary a lot across categories (an attendance terminal and an X-ray scanner have almost no
> fields in common), so a flexible document schema fit better than rigid relational tables."

**3. Scale or usage — any real number you have**
> "About ____ users / ____ products / ____ requests a day."
> *(No real users? Say so honestly and give the load you tested with. Never invent numbers —
> the follow-up questions will expose it instantly.)*
>
> **TODO before rehearsing:** check GA4 (if set up) or the nginx access log / `pm2 monit`
> for a real number. If nothing's tracked, the honest line is: *"No analytics dashboard set
> up yet, but it's serving real production client traffic, not a demo."* That's a fine
> answer — better than a guessed number that falls apart under a follow-up.

**4. The one interesting technical problem** (this is the whole answer — 3–4 sentences)
> Problem: Deploys used to overwrite the live app directly — if a bad deploy went out,
> that meant downtime while I manually SSH'd in, diagnosed it, and fixed it live.
> What I tried first: Manually redeploying over SSH whenever something broke.
> Why it didn't work: Slow and risky — there was no fast way to revert if the new code had
> an issue in production, and every deploy risked an outage.
> What I did instead: Built a CI/CD pipeline (GitHub Actions → VPS) that ships each deploy
> into its own timestamped release folder, links in the shared `.env` and persistent
> `public/` uploads, installs deps and runs a health-check boot *before* touching anything
> live, then does an atomic symlink swap to make it current and reloads PM2 (`pm2 reload`,
> not `restart`, for zero downtime). It keeps the last 5 releases on disk.
> Result: A bad deploy is now a symlink flip back to the previous release instead of
> emergency SSH firefighting — rollback takes seconds, and it hasn't caused live downtime
> since.

**5. What you'd do differently now** (1 sentence — shows growth, and they always ask)
> Uploaded files (product datasheets, images) currently live on the VPS disk via Multer —
> I'd move that to S3/Cloudinary so the app servers stay stateless and easier to scale
> horizontally later.

---

## Second story, ready if they ask "why Next.js?" or "any other technical challenge?"

This is a separate, real story from the same project — keep it in your pocket for a second
technical question so you're not repeating the deploy-pipeline one twice.

> **Problem:** The site was originally a client-side-rendered React app. Search engines
> struggled to index it properly and page-speed scores were poor — for a B2B company that
> depends on organic search for its product/solution pages, that directly hurt lead
> generation, not just a vanity metric.
>
> **What I did:** Rebuilt it in Next.js using SSG for the product and solution pages —
> since that content doesn't change per-request, pre-rendering means crawlers get full HTML
> immediately instead of waiting on client-side JS to hydrate. Alongside that I redesigned
> it to match the brand tightly — logo, fonts, theme, layout — kept it clean and simple
> rather than generic-template-looking, and built the admin panel so product/blog content
> can be updated without a code deploy. Also set up basic AEO/GEO so the content is
> structured to be citable by AI answer engines, not just ranked by traditional search.
>
> **Result (Lighthouse, production):** 96 Performance, 100 Best Practices, 92 SEO, 87
> Accessibility. The site is now ranking on its target keywords.
>
> **Honest "what's next" (reuse this if asked "what would you improve"):** Accessibility
> at 87 is the one score still short of the others — that's a concrete, specific next step
> (alt text coverage, contrast, focus states) rather than a vague "nothing."

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
> Your answer: Product specs are wildly different per category — an attendance device has
> fields like sensor type and recognition method, an X-ray scanner has tunnel size and
> throughput. Forcing that into fixed relational columns meant either a huge sparse table
> or a maze of category-specific joins. MongoDB let each product document carry only the
> fields relevant to its category, and Mongoose schemas still gave me validation on top.

**2. "How does authentication work in your project?"**
Walk the flow: login → token issued → where it's stored → how it's verified → how logout
works. [topics/06](../topics/06-auth-and-security.md).
> Your answer: Login checks the password with bcrypt, and on success the backend signs a
> JWT. The dashboard stores it in localStorage; an axios interceptor attaches it as
> `Authorization: Bearer <token>` on every request. A `protect` middleware on the backend
> verifies it with `jwt.verify` before any protected route runs; a 401 clears the stored
> token client-side and redirects to login. A few extra-sensitive internal routes also
> layer on an API-key check and a server IP allowlist on top of the JWT check.
> *(Known trade-off worth naming if pushed: localStorage is readable by any injected script,
> so it's vulnerable to XSS in a way an httpOnly cookie wouldn't be — an honest "what I'd
> harden next" if asked.)*

**3. "What happens if your traffic goes 10x tomorrow?"**
The ordered list from [topics/08](../topics/08-scaling-basics.md) — measure, optimise, cache,
scale up, scale out. Then name the specific thing in *your* project that breaks first.
> Your answer: The app tier is already stateless (JWT, no server-side sessions) and runs
> under PM2, so it could scale horizontally behind nginx without much rework. The first
> real bottleneck would be the single MongoDB instance — I'd add caching on the read-heavy
> product-listing endpoints first, then look at a MongoDB replica for reads before touching
> the app tier at all.

**4. "What was the hardest bug you hit?"**
Have one ready, told the same way: symptom → what you suspected → how you found the real
cause → fix. The debugging *method* is what's being graded.
> Your answer: Symptom: the same product category was showing up twice, as two separate
> groups, in the catalog navigation. I first suspected duplicate category documents in the
> DB. Tracing the aggregation pipeline showed the real cause: it grouped products by the
> *stored* `categorySlug`/`subCategorySlug` fields, and one older document had a stale slug
> left over from before a rename — same `categoryName`, different `categorySlug`, so
> Mongo's `$group` split it into a second group. Fix: stopped trusting stored slug fields as
> the grouping key entirely — group by `categoryName` only, then derive both slugs fresh
> with `slugify()` after grouping, so a stale field can never fork a category again.

**5. "What would you do differently?"**
Never "nothing." Pick one real thing and explain the trade-off you'd now make differently.
> Your answer: Move uploaded files off the VPS disk and onto S3/Cloudinary — right now an
> app server restart or a disk issue puts uploads at risk, and it also blocks easily running
> more than one app instance behind a load balancer.

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
