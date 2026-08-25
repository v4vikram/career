# Design 02 — E-commerce Backend

> **The most likely design question for a MERN + MySQL role**, because it's the domain most
> Indian product companies and agencies actually build. It also lets you demonstrate
> transactions, which is the highest-value thing you can show.

---

## 1. Clarify

- Single vendor or marketplace? → **single vendor**, keeps it scoped
- Payments? → **integrate a gateway (Razorpay/Stripe), don't store card data**
- Guest checkout? → **yes**
- Scale? → **10k products, 1k orders/day**

## 2. Estimate

```
1,000 orders/day ≈ 0.01 writes/sec — writes are trivial
Product browsing is the real traffic: assume 100k page views/day ≈ 1-3 req/sec, peak ~15
Catalog reads >> everything else  → cache the catalog hard
```

**The insight:** reads dominate, but the *writes are the hard part*, because that's where
money and stock correctness live. Say that — it frames the rest of your answer.

## 3. Core APIs

```
Catalog (public, cacheable)
  GET  /api/v1/products?category=&minPrice=&sort=&page=      → paginated
  GET  /api/v1/products/:slug
  GET  /api/v1/categories

Cart                                                           [auth or guest session]
  GET    /api/v1/cart
  POST   /api/v1/cart/items      { productId, quantity }
  PATCH  /api/v1/cart/items/:productId  { quantity }
  DELETE /api/v1/cart/items/:productId

Checkout                                                       [auth]
  POST /api/v1/orders            { addressId }  header: Idempotency-Key
     → 201 { orderId, orderNumber, amount, paymentSessionId }
  POST /api/v1/payments/webhook  ← from the gateway, NOT from the browser

Orders                                                         [auth + owner]
  GET  /api/v1/orders
  GET  /api/v1/orders/:orderNumber
```

## 4. Schema

Full `CREATE TABLE` statements in
[topics/03 — worked example](../topics/03-mysql-schema-design.md#worked-example--e-commerce-schema).
The points to call out unprompted:

- `order_items` **snapshots** `product_name` and `unit_price` — an invoice must not change
  when the product is later renamed or repriced
- `shipping_addr` is a **JSON snapshot**, not a foreign key, for the same reason
- `cart_items` has a **composite PK** `(cart_id, product_id)` so adding twice increments
  quantity instead of duplicating a row
- `orders.total_amount` is denormalized deliberately, so an invoice total is one read

---

## The checkout transaction — the heart of the answer

**This is what the question is really testing.** Spend your time here.

```js
async function placeOrder(userId, idempotencyKey) {
  // 1. Idempotency FIRST, outside the main work — the user may double-click Pay
  const existing = await IdempotencyKey.findByPk(idempotencyKey);
  if (existing) return existing.response;          // return the original result

  const t = await sequelize.transaction();
  try {
    const items = await CartItem.findAll({ where: { cartId }, transaction: t });
    if (!items.length) throw new BadRequest('Cart is empty');

    let total = 0;
    for (const item of items) {
      // 2. Atomic conditional decrement — the ONLY safe way to reserve stock
      const [updated] = await Product.update(
        { stock: sequelize.literal(`stock - ${item.quantity}`) },
        { where: { id: item.productId, stock: { [Op.gte]: item.quantity } },
          transaction: t }
      );
      if (updated === 0) throw new Conflict(`Insufficient stock for ${item.productId}`);

      const product = await Product.findByPk(item.productId, { transaction: t });
      total += product.price * item.quantity;
    }

    // 3. Create the order in the SAME transaction
    const order = await Order.create(
      { userId, total, status: 'pending', orderNumber: generateOrderNumber() },
      { transaction: t }
    );
    await OrderItem.bulkCreate(
      items.map(i => ({ orderId: order.id, productId: i.productId,
                        productName: i.name, unitPrice: i.price, quantity: i.quantity })),
      { transaction: t }
    );

    await IdempotencyKey.create({ key: idempotencyKey, orderId: order.id }, { transaction: t });
    await t.commit();

    // 4. Everything slow happens AFTER the commit, off the request
    await emailQueue.add('order-confirmation', { orderId: order.id });
    return order;
  } catch (err) {
    await t.rollback();     // stock decrements are undone automatically
    throw err;
  }
}
```

**Four things to say out loud about this code:**

1. **Stock is decremented with a conditional `UPDATE ... WHERE stock >= quantity`**, and I
   check affected rows. A read-then-write would let two concurrent checkouts both pass the
   check and oversell. See [topics/05](../topics/05-transactions-and-acid.md).
2. **Order creation and stock decrement share one transaction** — a rollback returns the
   stock automatically. That's exactly what atomicity is for.
3. **The idempotency key** stops a double-clicked Pay button from creating two orders.
4. **No network I/O inside the transaction.** No payment call, no email — those hold row
   locks open for hundreds of milliseconds and cause deadlocks under load.

---

## Payments — the flow that matters

```
1. POST /orders          → order created, status = pending, stock reserved
2. Server creates a payment session with the gateway → returns its id to the client
3. Browser completes payment on the GATEWAY's page   (you never see card data — PCI)
4. Gateway → POST /api/v1/payments/webhook           (server-to-server)
5. Verify the webhook signature, then set status = paid, enqueue confirmation email
6. A scheduled job cancels orders still 'pending' after 15 min and restores stock
```

**The three points that show you've thought about it:**

- **Never trust the browser's "payment succeeded" callback.** The user can fabricate it.
  The webhook is the source of truth, and you **verify its signature**.
- **Webhooks are retried by the gateway and can arrive twice or out of order** — so webhook
  handling must be idempotent too. Check the current status before transitioning.
- **Never store card numbers.** The gateway's hosted page keeps you out of PCI-DSS scope
  entirely.

---

## Making the catalog fast

```
GET /products?category=shoes&page=1
   → Redis:  products:v3:cat:5:page:1     TTL 1h
   → miss → MySQL with INDEX (category_id, is_active, price)
```

- Cache list pages and product details; bump a **version counter** (`products:v`) on any
  product write, which invalidates every list page at once without enumerating keys — see
  [topics/07](../topics/07-caching-and-redis.md)
- **Never cache stock.** Show a cached product but read stock live at checkout; overselling
  because of a cached count is a real-money bug
- Images on **S3 + CDN**, never served from Node
- Search: `LIKE '%query%'` can't use an index. For real search use MySQL `FULLTEXT` at small
  scale, Elasticsearch/Meilisearch beyond that

---

## Edge cases to raise yourself

| Case | Handling |
|------|----------|
| Price changed while in cart | Recalculate at checkout from the live price; tell the user |
| Product deleted while in cart | Soft delete only; show "unavailable" and skip it |
| Payment succeeds, webhook never arrives | Reconciliation job polls the gateway for pending orders |
| Payment fails | Order stays pending; the cancel job restores stock after 15 min |
| Two admins edit the same product | Optimistic locking with a version column |
| Guest checkout | Cart keyed by session id in Redis, merged into the user's cart on login |
| Refund | New `refunds` row + a status transition. Never mutate the original order row |

---

## Say this in the interview (the 90-second version)

> "I'd start by separating the read path from the write path, because they have completely
> different problems. Browsing the catalog is high-traffic but easy — I'd cache product
> lists and detail pages in Redis and put images behind a CDN, with a composite index on
> category, active flag and price for the listing query.
>
> The hard part is checkout. Placing an order has to decrement stock and create the order
> atomically, so it's one transaction. For the stock decrement I'd use a conditional update
> — UPDATE products SET stock = stock - qty WHERE id = ? AND stock >= qty — and check
> affected rows, because reading the stock and then writing it lets two concurrent checkouts
> both pass the check and oversell. If anything fails, the rollback restores the stock
> automatically.
>
> I'd also require an idempotency key on the order endpoint, so a double-clicked Pay button
> returns the original order rather than creating a second one. And I'd keep all network
> calls out of the transaction — no payment API call, no email — because holding row locks
> across a network call causes deadlocks under load.
>
> For payments, the browser never tells my server the payment succeeded; I rely on the
> gateway's webhook, verify its signature, and make the handler idempotent because gateways
> retry. A scheduled job cancels orders still pending after fifteen minutes and returns the
> stock.
>
> One schema detail I'd point out — order_items stores the product name and price as they
> were at purchase time rather than joining to products, so an old invoice doesn't change
> when we run a sale."

---

## My attempt

<!-- Day 23: cover the page, 20-min timer, out loud, then compare. -->
