# 04 — Indexing & Query Optimization

> **How it's asked:** "This query takes 8 seconds. How do you fix it?" / "What is an
> index and what does it cost?" / "What is the N+1 problem?"
> **This is the single highest-ROI topic on the list.** Most MERN candidates cannot answer
> it, and every backend role touches it in week one.

---

## What an index actually is

A **B+ tree** kept sorted on the indexed column(s), where the leaf nodes point back to the
rows. Without one, MySQL does a **full table scan** — reads every row and throws most away.

- Lookup goes from O(n) to O(log n). On a 1M-row table that's ~1,000,000 reads → ~20.
- **The cost:** every `INSERT`, `UPDATE`, and `DELETE` must also update every index on the
  table. Indexes take disk space and slow writes.

> **Say this:** *"An index is a sorted B+ tree that turns a full scan into a tree traversal.
> It's a read-speed-for-write-speed trade — so I index what I filter, join, and sort on, and
> nothing else."*

### Clustered vs secondary (InnoDB specific — good depth to show)

- The **primary key is the clustered index**: the actual row data lives in its leaf nodes.
  There is exactly one, and rows are physically ordered by it.
- Every **secondary index** stores the indexed column plus the **primary key value**. So
  looking up by a secondary index and needing other columns costs a second hop back into
  the clustered index — a **bookmark lookup**.

That second hop is why **covering indexes** matter (below), and why a fat primary key makes
*every* secondary index bigger.

---

## Which columns to index

Index the columns that appear in:

| Clause | Example | Index |
|--------|---------|-------|
| `WHERE` | `WHERE email = ?` | `INDEX(email)` |
| `JOIN ... ON` | `ON orders.user_id = users.id` | `INDEX(user_id)` |
| `ORDER BY` | `ORDER BY created_at DESC` | `INDEX(created_at)` |
| `GROUP BY` | `GROUP BY category_id` | `INDEX(category_id)` |

**Do not index:**
- Low-cardinality columns on their own — `gender`, `is_active`, `status` with 3 values. The
  optimizer will ignore the index and scan anyway. (They're still useful as the *later*
  columns of a composite index.)
- Columns you never filter on.
- Every column "just in case" — you're paying on every single write.

---

## Composite indexes and the leftmost prefix rule

**This is the most commonly asked indexing question.**

```sql
INDEX idx_a_b_c (category_id, is_active, price)
```

That one index can serve:

| Query filters on | Uses index? |
|------------------|:-----------:|
| `category_id` | yes |
| `category_id, is_active` | yes |
| `category_id, is_active, price` | yes |
| `is_active` alone | **no** |
| `price` alone | **no** |
| `is_active, price` | **no** |

The index is sorted by `category_id` first, then `is_active` within that, then `price`.
It's a phone book sorted by last name then first name: you can't find everyone named
"Vikram" without scanning the whole book.

**Ordering rule:** equality columns first, then range, then sort.

```sql
-- WHERE category_id = ? AND price BETWEEN ? AND ? ORDER BY created_at
INDEX (category_id, price, created_at)
--     equality      range   sort
```

A range condition stops the index from being used for anything to its right — so once you
hit `price BETWEEN`, `created_at` can't be used for sorting from the index. If sorting
matters more than the range, flip them.

### Covering index

If the index contains **every column the query needs**, MySQL answers entirely from the
index and never touches the table. `EXPLAIN` shows `Using index`.

```sql
SELECT id, name, price FROM products WHERE category_id = 5;
INDEX idx_cover (category_id, name, price);   -- id is implicit (it's the PK)
```

---

## Reading EXPLAIN

```sql
EXPLAIN SELECT * FROM orders WHERE user_id = 42 ORDER BY created_at DESC LIMIT 10;
```

The columns that matter:

| Column | Look for | Alarm |
|--------|----------|-------|
| `type` | `const`, `eq_ref`, `ref`, `range` | **`ALL`** = full table scan |
| `key` | the index actually used | `NULL` = no index used |
| `rows` | rows MySQL estimates it will read | a number near your table size |
| `Extra` | `Using index` (covering — great) | **`Using filesort`**, **`Using temporary`** |

`type` from best to worst: `const` → `eq_ref` → `ref` → `range` → `index` → `ALL`.

- **`Using filesort`** — MySQL couldn't get the order from an index and is sorting in
  memory or on disk. Fix by adding the `ORDER BY` column to the index in the right position.
- **`Using temporary`** — it built a temp table, usually for `GROUP BY` or `DISTINCT`.
- **`Using index`** is the good one — that's a covering index.

Use `EXPLAIN ANALYZE` (MySQL 8.0.18+) to get *actual* timings instead of estimates.

---

## Things that silently kill your index

```sql
-- Function on the column: index unusable
WHERE YEAR(created_at) = 2026
-- fix:
WHERE created_at >= '2026-01-01' AND created_at < '2027-01-01'

-- Leading wildcard: index unusable (can't binary-search "ends with")
WHERE name LIKE '%shoe%'
-- 'shoe%' IS fine. For real search use FULLTEXT, or Elasticsearch/Meilisearch.

-- Type mismatch: implicit conversion kills the index
WHERE phone = 9876543210        -- phone is VARCHAR
-- fix:
WHERE phone = '9876543210'

-- OR across different columns often defeats the optimizer
WHERE email = ? OR phone = ?
-- fix: UNION of two indexed queries

-- Negations scan
WHERE status != 'delivered'
-- fix: WHERE status IN ('pending','paid','shipped')

-- SELECT * defeats covering indexes and drags unused blobs over the wire
```

---

## The N+1 problem

**Guaranteed follow-up for a MERN candidate.** You fetch 50 posts, then loop and fetch each
author — 1 query + 50 queries = 51 round trips.

```js
// N+1 — Sequelize
const posts = await Post.findAll({ limit: 50 });
for (const post of posts) {
  post.author = await User.findByPk(post.userId);   // 50 more queries
}

// Fixed — one JOIN
const posts = await Post.findAll({
  limit: 50,
  include: [{ model: User, as: 'author', attributes: ['id', 'name'] }],
});
```

```js
// N+1 — Mongoose
const posts = await Post.find().limit(50);
for (const p of posts) p.author = await User.findById(p.userId);

// Fixed
const posts = await Post.find().limit(50).populate('author', 'name email');
```

**The general fix when you can't join** (e.g. two different data stores): collect the ids
and do one batched query.

```js
const posts   = await Post.findAll({ limit: 50 });
const userIds = [...new Set(posts.map(p => p.userId))];
const users   = await User.findAll({ where: { id: userIds } });   // 1 query
const byId    = new Map(users.map(u => [u.id, u]));
posts.forEach(p => { p.author = byId.get(p.userId); });
```

That's 2 queries instead of 51. Being able to write this from memory is a strong signal.

---

## The debugging routine — say this when they ask "the query is slow"

Don't jump to "add an index." Walk the steps:

1. **Measure first** — enable the slow query log, find the actual offender. Don't guess.
2. **`EXPLAIN` it** — is `type: ALL`? Is `key: NULL`? How many `rows`?
3. **Check for an index-killer** — function on the column, leading wildcard, type mismatch.
4. **Add or fix the index** — leftmost prefix, equality → range → sort ordering.
5. **Reduce the data** — `SELECT` only needed columns, paginate, drop the `OFFSET 100000`.
6. **Check for N+1** in the application layer — often the real cause, invisible in the DB.
7. **Then cache** — see [07 — Caching](07-caching-and-redis.md). Caching a bad query hides
   the problem instead of fixing it.
8. **Only then** consider read replicas, denormalization, or a summary table.

The order is the answer. Anyone can say "add an index" — saying *"first I'd measure, then
EXPLAIN"* is what separates you.

---

## Say this in the interview

> "An index is a B+ tree kept sorted on the indexed columns, so a lookup becomes a tree
> traversal instead of a full table scan. The trade-off is write cost — every insert and
> update has to maintain every index — so I index what I filter, join, and sort on, and
> nothing else.
>
> For composite indexes the key thing is the leftmost prefix rule: an index on
> (category_id, is_active, price) can serve a query filtering on category_id, or
> category_id and is_active, but not one filtering on price alone. I order the columns
> equality first, then range, then the sort column.
>
> To debug a slow query I don't start by adding indexes — I check the slow query log to find
> the real offender, then run EXPLAIN. If type is ALL and key is NULL it's a full scan. I
> also check whether something is silently disabling the index, like wrapping the column in
> a function such as YEAR(created_at), or a leading wildcard LIKE, or a string-versus-number
> type mismatch.
>
> And in a Node app the slowness is very often N+1 — fetching a list and then querying
> inside a loop. That doesn't show up as one slow query, it shows up as fifty fast ones. I
> fix it with a join, or by batching the ids into a single WHERE IN query."

**Rehearse until:** you can explain leftmost prefix with the phone book analogy, name four
index-killers, and write the N+1 batch fix from memory.

---

## My practice — EXPLAIN output from my own project

<!-- Day 6 & 8: paste real EXPLAIN output from your project here, before and after. -->
