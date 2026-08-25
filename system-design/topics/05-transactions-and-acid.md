# 05 — Transactions, ACID & Concurrency

> **How it's asked:** "What is ACID?" / "Two users book the last seat at the same time —
> what happens?" / "How do you make sure money isn't debited twice?"
> The ACID definition is memorisable and everyone has it. The **race condition** question is
> where candidates fall apart, and it's the one that actually matters.

---

## ACID

| Property | Means | Concretely |
|----------|-------|------------|
| **Atomicity** | All or nothing | Debit A and credit B both happen, or neither does |
| **Consistency** | Constraints always hold | FKs, UNIQUE, CHECK are never violated by a commit |
| **Isolation** | Concurrent txns don't corrupt each other | Two bookings don't both get the last seat |
| **Durability** | Committed = survives a crash | Written to the redo log and flushed to disk |

```sql
START TRANSACTION;
  UPDATE accounts SET balance = balance - 500 WHERE id = 1;
  UPDATE accounts SET balance = balance + 500 WHERE id = 2;
COMMIT;   -- or ROLLBACK
```

**Note:** MyISAM does **not** support transactions or foreign keys. InnoDB does. This is
why InnoDB is the default and the only sane choice — a quick way to show you know MySQL.

---

## The three concurrency problems

| Problem | What happens |
|---------|--------------|
| **Dirty read** | You read a row another transaction changed but hasn't committed. It rolls back — you acted on data that never existed. |
| **Non-repeatable read** | You read the same row twice in one transaction and get different values, because someone committed an `UPDATE` in between. |
| **Phantom read** | You run the same `WHERE` twice and get a *different number of rows*, because someone `INSERT`ed. |

## Isolation levels — which problems each one prevents

| Level | Dirty read | Non-repeatable | Phantom |
|-------|:----------:|:--------------:|:-------:|
| READ UNCOMMITTED | possible | possible | possible |
| READ COMMITTED | prevented | possible | possible |
| **REPEATABLE READ** (MySQL default) | prevented | prevented | prevented in InnoDB* |
| SERIALIZABLE | prevented | prevented | prevented |

\* Standard SQL says REPEATABLE READ allows phantoms. **InnoDB prevents them anyway** using
next-key locking (row locks plus gap locks). Knowing that MySQL's default is REPEATABLE
READ — while PostgreSQL's is READ COMMITTED — is a genuinely strong detail to drop.

Higher isolation = more locking = less concurrency. SERIALIZABLE is correct and slow;
you reach for it rarely.

---

## The race condition — the question that actually matters

**Scenario:** one seat left. Two users book simultaneously.

```js
// BROKEN — both requests read stock = 1 before either writes
const product = await db.query('SELECT stock FROM products WHERE id = ?', [id]);
if (product.stock > 0) {
  await db.query('UPDATE products SET stock = stock - 1 WHERE id = ?', [id]);
  // stock is now -1. You sold a seat you don't have.
}
```

The gap between the read and the write is the bug. **Wrapping it in a transaction alone
does not fix it** — that's the trap answer. A transaction gives atomicity; this needs
isolation of that specific row. Three real fixes:

### Fix 1 — Atomic conditional update (simplest, use this by default)

```sql
UPDATE products SET stock = stock - 1 WHERE id = ? AND stock > 0;
-- then check affectedRows: 0 means someone beat you to it
```

One statement, so the database does the check and the write under one row lock. No gap.

```js
const [result] = await db.query(
  'UPDATE products SET stock = stock - 1 WHERE id = ? AND stock > 0', [id]
);
if (result.affectedRows === 0) throw new Error('Out of stock');
```

### Fix 2 — Pessimistic locking: `SELECT ... FOR UPDATE`

When you need to read, compute something non-trivial, then write.

```sql
START TRANSACTION;
  SELECT stock FROM products WHERE id = 5 FOR UPDATE;   -- locks the row
  -- any other transaction touching row 5 now waits here
  UPDATE products SET stock = stock - 1 WHERE id = 5;
COMMIT;                                                  -- lock released
```

Correct and easy to reason about. Cost: real contention — everyone queues on a hot row.
Keep the transaction as short as humanly possible. **Never do network I/O (a payment
gateway call) while holding a lock.**

### Fix 3 — Optimistic locking: a version column

Best when conflicts are *rare* and you don't want the lock overhead.

```sql
UPDATE products
   SET stock = stock - 1, version = version + 1
 WHERE id = 5 AND version = 7;      -- 7 = the version I read earlier
-- affectedRows = 0 → someone else changed it → retry the whole operation
```

> **Say this:** *"Pessimistic locking when writes collide often, like inventory on a flash
> sale. Optimistic locking when collisions are rare, like two admins editing the same
> product — you avoid holding locks and just retry on the rare conflict."*

---

## Transactions in Node

**Sequelize**
```js
const t = await sequelize.transaction();
try {
  const [updated] = await Product.update(
    { stock: sequelize.literal('stock - 1') },
    { where: { id: productId, stock: { [Op.gt]: 0 } }, transaction: t }
  );
  if (updated === 0) throw new Error('Out of stock');

  const order = await Order.create({ userId, totalAmount }, { transaction: t });
  await OrderItem.bulkCreate(items, { transaction: t });

  await t.commit();
  return order;
} catch (err) {
  await t.rollback();     // every statement above is undone
  throw err;
}
```

**Raw mysql2 — must use one connection**
```js
const conn = await pool.getConnection();
try {
  await conn.beginTransaction();
  await conn.query('UPDATE products SET stock = stock - 1 WHERE id = ? AND stock > 0', [id]);
  await conn.query('INSERT INTO orders SET ?', [order]);
  await conn.commit();
} catch (err) {
  await conn.rollback();
  throw err;
} finally {
  conn.release();         // always, or you leak the pool
}
```

**The gotcha:** a transaction lives on **one connection**. If you grab statements from the
pool independently they land on different connections and there is no transaction at all.
Pass the connection (or the Sequelize `transaction` object) into every call.

---

## Deadlocks

Two transactions each hold a lock the other wants.

```
Txn A: locks row 1 → wants row 2
Txn B: locks row 2 → wants row 1     → InnoDB kills one with error 1213
```

**Prevention:**
- **Always acquire locks in a consistent order** — e.g. always update the lower account id
  first. This is the main answer.
- Keep transactions short; do validation and API calls *before* `START TRANSACTION`.
- Retry on error 1213 with a small backoff — deadlocks are normal, not a bug to eliminate.

---

## Idempotency — the payment question

*"The user's network dropped and they clicked Pay twice. How do you avoid charging twice?"*

Client generates a unique key and sends it with the request:

```js
// POST /api/v1/orders   header: Idempotency-Key: 8f2c...
CREATE TABLE idempotency_keys (
  key_value  VARCHAR(64) PRIMARY KEY,     -- UNIQUE does the work
  user_id    INT UNSIGNED NOT NULL,
  order_id   INT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

First request inserts the key and processes. A retry hits the primary key conflict, so you
return the **stored original response** instead of charging again. This ties straight back
to idempotency in [01 — HTTP](01-http-request-lifecycle.md).

---

## Say this in the interview

> "ACID is atomicity, consistency, isolation and durability — atomicity means all
> statements commit or none do, and isolation is what stops concurrent transactions from
> corrupting each other. MySQL's InnoDB defaults to REPEATABLE READ, and unlike the standard
> it also prevents phantom reads using next-key locking.
>
> On the last-seat problem: the bug is the gap between reading the stock and writing it —
> both requests read 1 before either writes. Wrapping it in a transaction alone doesn't fix
> that. The simplest correct fix is to make it a single atomic statement — UPDATE products
> SET stock = stock - 1 WHERE id = ? AND stock > 0 — and then check affected rows, because
> zero means someone got there first.
>
> If I genuinely need to read, compute, then write, I'd use SELECT FOR UPDATE to take a row
> lock for the duration of the transaction. That's pessimistic locking, and I'd keep the
> transaction very short and never call a payment gateway while holding the lock. Where
> conflicts are rare I'd use optimistic locking with a version column and retry instead.
>
> For double-clicking Pay, the answer is an idempotency key — a unique key from the client
> stored with a unique constraint, so the retry returns the original result rather than
> creating a second charge."

**Rehearse until:** you can talk through the last-seat problem — the bug, and all three
fixes with their trade-offs — without notes. That single answer carries this whole topic.
