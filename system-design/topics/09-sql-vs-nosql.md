# 09 — SQL vs NoSQL (MySQL vs MongoDB)

> **How it's asked:** "You've used both MySQL and MongoDB — how do you decide?" /
> "Why not just use MongoDB for everything?"
> **For a MERN + MySQL role this question is close to guaranteed**, because the job
> description literally names both. A vague answer here is very costly; a crisp one is a
> strong differentiator, because most candidates only ever say "MongoDB is flexible."

---

## The core difference

| | MySQL (relational) | MongoDB (document) |
|---|---|---|
| Data model | Tables, rows, fixed columns | Collections, JSON-like documents |
| Schema | Enforced by the database | Enforced by your app (Mongoose), or not at all |
| Relationships | JOINs, foreign keys | Embed, or reference + `$lookup` (weaker) |
| Transactions | Mature, the whole point of InnoDB | Supported since 4.0, but costlier and less idiomatic |
| Scaling | Vertical + read replicas; sharding is manual work | Sharding built in from the start |
| Best at | Structured, related data with integrity rules | Flexible, self-contained, denormalized documents |

---

## The honest decision rule

The real question isn't "SQL or NoSQL" — it's **how related is your data, and how much do
you need the database itself to guarantee?**

**Choose MySQL when:**
- Entities have real relationships you query across — users → orders → items → products
- **Money or inventory is involved.** Multi-row transactions with real isolation.
- The schema is known and should be enforced — you *want* the insert to fail
- You need complex reporting: aggregates, multi-table joins, `GROUP BY`
- Data integrity matters more than write throughput

**Choose MongoDB when:**
- Documents are self-contained and read as a whole — a CMS page, a product with wildly
  varying attributes, a user's activity feed
- The shape genuinely varies per record and you'd otherwise have 40 nullable columns
- You're ingesting high-volume writes where each record stands alone — logs, events, IoT
- You need to iterate on the shape fast in an early-stage product
- You want horizontal sharding without building it yourself

---

## The answer that gets you the job

Don't pick a side. **Say you'd use both, and where.**

> *"For an e-commerce app I'd put users, products, orders and payments in MySQL, because
> those are highly relational and an order has to be transactional — stock decrement and
> order creation must commit together or not at all. But I'd put product reviews, activity
> logs, and a CMS-style content collection in MongoDB, because those are self-contained
> documents with a variable shape and no cross-entity integrity requirement. Using both
> isn't indecision — it's picking the right guarantee for each kind of data."*

That's called **polyglot persistence**, and naming it is worth doing.

---

## Modelling the same thing in both

**Blog post with comments and tags.**

MySQL — normalized, four tables:
```sql
posts(id, user_id, title, body, created_at)
comments(id, post_id, user_id, body, created_at)
tags(id, name)
post_tags(post_id, tag_id)
```
Reading a post with comments and tags = a query with joins. Adding a comment = one small
insert. Renaming a tag = **one** update, everywhere.

MongoDB — embedded:
```js
{
  _id: ObjectId("..."),
  title: "Scaling Node",
  body: "...",
  author: { _id: ObjectId("..."), name: "Vikram" },   // denormalized snapshot
  tags: ["node", "scaling"],
  comments: [                                          // embedded
    { _id: ObjectId("..."), user: "Amit", body: "Great post", createdAt: ISODate() }
  ],
  createdAt: ISODate()
}
```
Reading the whole post = **one** query, no joins — genuinely fast. But: the author's name
is duplicated across every post they wrote, and a document has a **16 MB limit**, so a post
with 50,000 comments breaks. That's the real trade.

### Embed vs reference — the rule to state

- **Embed** when the child is always read with the parent, is bounded in size, and doesn't
  change independently. (Order items inside an order. An address inside a user.)
- **Reference** when the child is queried on its own, is unbounded, or is shared across many
  parents. (Comments on a viral post. Products in an order.)

Being able to say *"embed for bounded one-to-few, reference for unbounded one-to-many"*
is exactly the right level of depth.

---

## Things people get wrong about MongoDB

Correcting these makes you sound like you've actually shipped with it:

1. **"MongoDB has no schema."** It has no *enforced* schema — which means the enforcement
   moved into your application, where it's easier to get wrong. Mongoose schemas exist for
   precisely this reason, and MongoDB also supports JSON Schema validation.
2. **"MongoDB is faster."** For a single-document read, yes. For anything requiring `$lookup`
   across collections, MySQL's join engine is far more mature. "Faster" depends entirely on
   the access pattern.
3. **"MongoDB can't do transactions."** Outdated — multi-document ACID transactions have
   existed since 4.0 (4.2 across shards). They're just more expensive and less idiomatic,
   and needing them often signals the data was relational all along.
4. **"NoSQL means no indexes."** MongoDB needs indexes exactly as much as MySQL does, and an
   unindexed `find()` is a full collection scan — same failure mode as
   [04 — indexing](04-indexing-and-query-optimization.md).

---

## CAP theorem — the one-liner

In a distributed system you can guarantee at most two of **C**onsistency, **A**vailability,
**P**artition tolerance. Since network partitions *will* happen, P isn't optional — so the
real choice is **CP or AP**.

- **CP** — refuse to answer rather than answer wrongly. Banking, inventory.
- **AP** — always answer, possibly with stale data. Feeds, product catalogs, DNS.

**Don't volunteer CAP unprompted** at this band — it can read as memorised. If asked, give
those three lines and the two examples, and stop.

---

## Quick reference — other stores, one line each

Useful if they ask "what else would you use?"

| Store | Use it for |
|-------|-----------|
| **Redis** | Cache, sessions, rate limiting, queues, leaderboards |
| **Elasticsearch / Meilisearch** | Full-text search, typo tolerance, faceting — never `LIKE '%x%'` at scale |
| **S3 / Cloudinary** | Files, images, video. Never in a database. |
| **ClickHouse / BigQuery** | Analytics over huge event tables (OLAP, not OLTP) |

**OLTP vs OLAP** in one line: OLTP is many small reads and writes serving the app (MySQL);
OLAP is few enormous aggregation queries serving reporting (a warehouse). Running heavy
reports against your production MySQL is the mistake this distinction exists to prevent.

---

## Say this in the interview

> "I don't think of it as picking a winner — I look at how related the data is and what
> guarantees I need from the database itself.
>
> MySQL when entities are genuinely relational and integrity matters. In an e-commerce app,
> users, products and orders go in MySQL, because placing an order has to decrement stock
> and create the order atomically — that's a multi-row transaction, and I want the database
> enforcing foreign keys and uniqueness rather than my application code.
>
> MongoDB when documents are self-contained and the shape varies. Product reviews, activity
> logs, CMS content — things read as a whole document, where I'd otherwise end up with a
> table full of nullable columns. The win is reading the whole thing in one query with no
> joins.
>
> The trade-off with embedding is duplication and the 16 MB document limit — so I embed for
> bounded one-to-few relationships like order items, and reference for unbounded ones like
> comments on a popular post.
>
> In practice I'd use both in one system, which is polyglot persistence — the transactional
> core in MySQL and the flexible, high-volume, self-contained data in MongoDB."

**Rehearse until:** you can answer "why both?" with the e-commerce split in under 60
seconds, and you can state the embed-vs-reference rule instantly.
