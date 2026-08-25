# 03 — MySQL Schema Design & Normalization

> **How it's asked:** "Design the database for an e-commerce site." / "What is
> normalization?" / "How would you model users and roles?"
> For a MERN **+ MySQL** role this is the topic that separates you from the pile of
> candidates who only ever used Mongoose.

---

## Normalization — the version that's actually useful

Normalization = organising tables so each fact is stored **exactly once**.

### 1NF — no repeating groups, atomic values

```sql
-- violates 1NF
users(id, name, phone_numbers)   -- "9876543210, 9123456789" in one column

-- correct
users(id, name)
user_phones(id, user_id, phone)
```

### 2NF — 1NF + no partial dependency on a composite key

```sql
-- violates 2NF: PK is (order_id, product_id) but product_name depends on product_id alone
order_items(order_id, product_id, product_name, quantity)

-- correct
order_items(order_id, product_id, quantity, unit_price)
products(id, name)
```

### 3NF — 2NF + no transitive dependency (non-key depends on non-key)

```sql
-- violates 3NF: city and state depend on pincode, not on the user
users(id, name, pincode, city, state)

-- correct
users(id, name, pincode)
pincodes(pincode, city, state)
```

**3NF is where you stop.** BCNF/4NF/5NF exist; nobody at this band will ask you to apply
them. If they do ask, say: *"3NF covers almost everything in practice; BCNF handles rare
overlapping-candidate-key cases."*

### When you deliberately denormalize

Normalization optimises writes and correctness. Reads pay for it in JOINs. You break the
rules on purpose when:

- **A count is read constantly and computed expensively** — store `posts.comment_count`
  instead of running `COUNT(*)` on every page load.
- **You need a historical snapshot** — `order_items.unit_price` must be copied at purchase
  time. If you join to `products.price`, last year's invoices change when you run a sale.
  **This example alone shows you understand why the rules exist.**
- **A dashboard joins six tables on every load** — a summary table refreshed nightly.

> **Say this:** *"I normalize to 3NF by default, then denormalize deliberately where a read
> path proves too slow — and I accept that I now own keeping that duplicate in sync."*

---

## The three relationships

### 1 : 1 — foreign key with a UNIQUE constraint

```sql
CREATE TABLE user_profiles (
  id       INT PRIMARY KEY AUTO_INCREMENT,
  user_id  INT NOT NULL UNIQUE,          -- UNIQUE is what makes it 1:1
  bio      TEXT,
  avatar   VARCHAR(255),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

Use it to split rarely-read heavy columns off a hot table.

### 1 : N — foreign key on the "many" side

```sql
CREATE TABLE posts (
  id        INT PRIMARY KEY AUTO_INCREMENT,
  user_id   INT NOT NULL,                -- the many side holds the FK
  title     VARCHAR(255) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### M : N — a junction table

```sql
CREATE TABLE post_tags (
  post_id  INT NOT NULL,
  tag_id   INT NOT NULL,
  PRIMARY KEY (post_id, tag_id),         -- composite PK prevents duplicates
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id)  REFERENCES tags(id)  ON DELETE CASCADE
);
```

The composite primary key is the whole trick: it enforces uniqueness *and* gives you an
index on `(post_id, tag_id)` for free. Add a separate index on `(tag_id, post_id)` if you
also query "all posts with this tag" — see [04 — leftmost prefix](04-indexing-and-query-optimization.md).

---

## Choosing column types

| Need | Use | Not |
|------|-----|-----|
| Money | `DECIMAL(10,2)` | `FLOAT` — binary rounding loses paise |
| Timestamps | `DATETIME` or `TIMESTAMP` | `VARCHAR` |
| Fixed set of values | `TINYINT` + app enum, or `ENUM(...)` | `VARCHAR` free text |
| True/false | `TINYINT(1)` / `BOOLEAN` | `VARCHAR('yes')` |
| Email | `VARCHAR(255)` + `UNIQUE` | `TEXT` — can't be fully indexed |
| IDs | `INT UNSIGNED` / `BIGINT UNSIGNED` | `VARCHAR` UUIDs as PK |

**`DECIMAL` for money is a classic gotcha question.** `FLOAT` and `DOUBLE` are binary
approximations — `0.1 + 0.2 != 0.3`. Never store currency in them.

**`DATETIME` vs `TIMESTAMP`:** `TIMESTAMP` is 4 bytes, stored as UTC, auto-converts to the
session timezone, and runs out in 2038. `DATETIME` is 8 bytes and stores exactly what you
gave it. Default to `DATETIME` and store UTC yourself.

**UUID as primary key:** random UUIDs scatter inserts across the B-tree and fragment it,
because InnoDB clusters rows physically by primary key. If you need public non-guessable
ids, keep an `INT` PK for joins and add a separate indexed `uuid` column for URLs.

---

## Worked example — e-commerce schema

```sql
CREATE TABLE users (
  id            INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name          VARCHAR(120)  NOT NULL,
  email         VARCHAR(255)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  role          ENUM('customer','admin') NOT NULL DEFAULT 'customer',
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE categories (
  id         INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name       VARCHAR(100) NOT NULL,
  slug       VARCHAR(120) NOT NULL UNIQUE,
  parent_id  INT UNSIGNED NULL,                   -- self-reference = nested categories
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE products (
  id           INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  category_id  INT UNSIGNED NOT NULL,
  name         VARCHAR(255)  NOT NULL,
  slug         VARCHAR(280)  NOT NULL UNIQUE,
  price        DECIMAL(10,2) NOT NULL,
  stock        INT UNSIGNED  NOT NULL DEFAULT 0,
  is_active    TINYINT(1)    NOT NULL DEFAULT 1,
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  INDEX idx_category_active (category_id, is_active, price)   -- listing page
) ENGINE=InnoDB;

CREATE TABLE carts (
  id         INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id    INT UNSIGNED NOT NULL UNIQUE,        -- one active cart per user
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE cart_items (
  cart_id    INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  quantity   INT UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (cart_id, product_id),              -- same product can't be added twice
  FOREIGN KEY (cart_id)    REFERENCES carts(id)    ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

CREATE TABLE orders (
  id            INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id       INT UNSIGNED NOT NULL,
  order_number  VARCHAR(32)  NOT NULL UNIQUE,     -- public-facing id
  status        ENUM('pending','paid','shipped','delivered','cancelled')
                NOT NULL DEFAULT 'pending',
  total_amount  DECIMAL(10,2) NOT NULL,           -- denormalized on purpose
  shipping_addr JSON          NOT NULL,           -- snapshot, not a FK
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_created (user_id, created_at)    -- "my orders", newest first
) ENGINE=InnoDB;

CREATE TABLE order_items (
  id           INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  order_id     INT UNSIGNED NOT NULL,
  product_id   INT UNSIGNED NOT NULL,
  product_name VARCHAR(255)  NOT NULL,   -- snapshot: product may be renamed later
  unit_price   DECIMAL(10,2) NOT NULL,   -- snapshot: price may change later
  quantity     INT UNSIGNED  NOT NULL,
  FOREIGN KEY (order_id)   REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id),
  INDEX idx_order (order_id)
) ENGINE=InnoDB;
```

**The three decisions to point at unprompted:**

1. `order_items` snapshots name and price — an invoice must never change retroactively.
2. `shipping_addr` is a JSON snapshot, not a FK to an addresses table — same reason. If the
   user later edits their saved address, the old order must still show where it shipped.
3. `cart_items` uses a composite PK so "add to cart" twice increments quantity instead of
   creating a duplicate row.

---

## ON DELETE — pick deliberately

| Clause | Effect | Use for |
|--------|--------|---------|
| `CASCADE` | Delete children too | cart_items when the cart dies, comments when the post dies |
| `RESTRICT` (default) | Block the delete | products that appear in orders |
| `SET NULL` | Null out the FK | `categories.parent_id` when a parent is removed |

**Never `CASCADE` from products to order_items.** Deleting a product would silently erase
order history. In practice you don't delete products at all — you soft-delete them.

---

## Soft delete

```sql
ALTER TABLE products ADD COLUMN deleted_at DATETIME NULL;
-- every read then carries: WHERE deleted_at IS NULL
```

Pros: recoverable, preserves history and FK integrity. Cons: every query must remember the
filter, and `UNIQUE(email)` now blocks re-registering a deleted email — solve with a
composite `UNIQUE(email, deleted_at)` or a scheduled purge.

---

## Say this in the interview

> "I start by listing the entities and the relationships between them, then normalize to
> 3NF so each fact lives in exactly one place — one-to-many gets a foreign key on the many
> side, many-to-many gets a junction table with a composite primary key.
>
> Then I denormalize deliberately where it's justified. In an orders schema, order_items
> stores the product name and unit price as they were at the time of purchase rather than
> joining to products, because an invoice has to stay accurate even after the product is
> renamed or repriced. That isn't really a normalization violation — it's a genuinely
> different fact.
>
> On column types I'm careful about money — DECIMAL, never FLOAT — and I use an INT primary
> key rather than a UUID, because InnoDB clusters rows by primary key and random UUIDs
> fragment the index. If I need a non-guessable public id I add a separate indexed column
> for it.
>
> And I pick ON DELETE behaviour per relationship — cascade for things that can't exist on
> their own like cart items, but restrict or soft-delete for anything referenced by order
> history."

**Rehearse until:** you can produce a normalized six-table schema for any domain in ten
minutes, with types, keys, and one denormalization you can justify.

---

## My practice — schemas I've designed

<!-- Day 4-5: blog schema, then e-commerce schema. Write the real CREATE TABLE statements. -->
