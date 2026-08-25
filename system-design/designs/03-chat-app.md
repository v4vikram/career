# Design 03 — Chat Application

> **Why practice this one:** it's the standard way interviewers test whether you understand
> that REST can't push, and the multi-server WebSocket problem is a genuinely good
> discriminator. Also very commonly asked because "real-time chat" is on half of all MERN
> resumes — **including possibly yours, so be ready.**

---

## 1. Clarify

- 1-to-1 only, or group chats? → **both**
- Message history persisted? → **yes**
- Delivery receipts / typing indicators / online status? → **yes, sent + seen**
- Media messages? → **images, via S3**
- Scale? → **10k concurrent users**

## 2. Estimate

```
10,000 concurrent WebSocket connections
Each idle connection ≈ 10–40 KB of server memory → ~100–400 MB for 10k
One Node instance can hold roughly 10-30k connections before it gets uncomfortable
→ ~1-2 instances needed, but 2+ for redundancy → the multi-server problem is unavoidable
```

**That last line is the whole design.** Say it early: *"as soon as I have more than one
server, connections are spread across them, and that's the central problem."*

---

## 3. Why WebSockets, not REST

| Approach | How | Verdict |
|----------|-----|---------|
| **Polling** | `GET /messages` every 2s | Wasteful — mostly empty responses, and still up to 2s late |
| **Long polling** | Request held open until a message arrives | Works, was the old standard, heavy on connections |
| **SSE** | Server-sent events, one-way push | Good for notifications/feeds; **can't send upstream** |
| **WebSocket** | Full-duplex, persistent TCP | **This.** Both directions, low latency, low overhead |

> *"Chat is bidirectional and latency-sensitive, so WebSockets. I'd use Socket.io because it
> handles reconnection, fallbacks, and rooms, and it has a Redis adapter for scaling across
> instances. SSE would be enough for something one-way like a notification feed."*

---

## 4. Data model

```sql
CREATE TABLE conversations (
  id         BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  type       ENUM('direct','group') NOT NULL,
  name       VARCHAR(120) NULL,                   -- groups only
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE conversation_members (
  conversation_id BIGINT UNSIGNED NOT NULL,
  user_id         INT UNSIGNED NOT NULL,
  last_read_at    DATETIME NULL,                  -- powers the unread badge
  PRIMARY KEY (conversation_id, user_id),         -- M:N junction
  INDEX idx_user (user_id)                        -- "my conversations"
) ENGINE=InnoDB;

CREATE TABLE messages (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  conversation_id BIGINT UNSIGNED NOT NULL,
  sender_id       INT UNSIGNED NOT NULL,
  body            TEXT NULL,
  media_url       VARCHAR(512) NULL,
  created_at      DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX idx_conv_created (conversation_id, created_at)   -- THE index for this app
) ENGINE=InnoDB;
```

**`INDEX (conversation_id, created_at)` is the one that matters** — every single message
fetch is "the latest N messages in this conversation," and this composite index serves both
the filter and the sort. Point at it.

**MySQL or MongoDB here?** Messages are append-heavy, self-contained, and never joined —
a genuinely good fit for MongoDB, and at real scale (billions of rows) Cassandra is the
classic choice. But conversations and membership are relational. Say:
*"I'd keep users, conversations and membership in MySQL, and I'd be comfortable putting the
messages themselves in MongoDB — they're append-only documents that are only ever queried
by conversation and time."* That's [topics/09](../topics/09-sql-vs-nosql.md) applied.

---

## 5. The message flow

```
User A types and hits send
   │
   ▼  socket.emit('message:send', { conversationId, body, tempId })
Node server
   ├─ verify JWT on the socket, verify A is a member of that conversation
   ├─ INSERT into messages
   ├─ emit 'message:ack' back to A   { tempId, realId, createdAt }   ← removes the spinner
   └─ io.to(`conv:${id}`).emit('message:new', message)               ← to everyone in the room
   │
   ▼
Recipients online  → receive instantly
Recipients offline → push notification (FCM), and they fetch on next open
```

**The `tempId` detail is worth mentioning:** the client renders the message immediately with
a temporary id (optimistic UI) and reconciles when the ack arrives with the real id. It's
what makes chat feel instant.

---

## 6. The multi-server problem — the core of this question

```
User A ──▶ Server 1          User B ──▶ Server 2
```

A sends a message. Server 1 emits to its own connected sockets. **B is connected to Server
2 and receives nothing.** In-memory Socket.io rooms are per-process — the same statelessness
problem as [topics/08](../topics/08-scaling-basics.md).

**Fix: a Redis Pub/Sub adapter.**

```js
import { createAdapter } from '@socket.io/redis-adapter';
io.adapter(createAdapter(pubClient, subClient));
```

Now `io.to(room).emit(...)` publishes to Redis, every server instance is subscribed, and
each delivers to whichever of those sockets it happens to hold. One line of code, and being
able to explain *why* it's needed is the point of the whole question.

**The load balancer also needs `sticky: true`** if you allow the HTTP long-polling fallback,
because the handshake must land on the same instance. Pure WebSocket connections don't need
it once upgraded.

---

## 7. Online presence

```js
// on connect
await redis.setex(`presence:${userId}`, 60, serverId);
// heartbeat every 30s refreshes the TTL
// on disconnect: redis.del(...)   — but the TTL is the real safety net
```

**Why a TTL rather than just deleting on disconnect:** if a server crashes, its
`disconnect` handlers never run and those users would appear online forever. The TTL
expires them automatically. This is a small detail that reads as real experience.

## 8. Read receipts and typing

- **Typing** — `socket.emit('typing')`, broadcast to the room, **never persisted**.
  Ephemeral, high-frequency, worthless after two seconds. Throttle it client-side.
- **Sent / Delivered / Seen** — update `conversation_members.last_read_at` and broadcast.
  Don't write a row per message per user; a single watermark timestamp gives you both the
  seen state and the unread count.

```sql
-- unread count, no extra table
SELECT COUNT(*) FROM messages
 WHERE conversation_id = ? AND created_at > ? /* last_read_at */;
```

## 9. Loading history

**Cursor pagination, not offset** — a chat scrolls upward forever and new messages arrive
constantly, so offsets shift under you ([topics/02](../topics/02-rest-api-design.md)).

```
GET /api/v1/conversations/:id/messages?before=<messageId>&limit=50
→ WHERE conversation_id = ? AND id < ? ORDER BY id DESC LIMIT 50
```

Cache the most recent ~50 messages per conversation in Redis — that's what opening a chat
loads, and it's the hottest read in the app.

---

## 10. Edge cases to raise yourself

| Case | Handling |
|------|----------|
| Recipient offline | Persist, then push notification via FCM/APNs |
| Network drops mid-send | Client retries with the same `tempId`; server dedupes on it |
| Duplicate delivery | Client dedupes by message id — assume at-least-once, not exactly-once |
| Message ordering | Server-assigned `created_at(3)` and id decide order, never client time — clocks lie |
| Media | Presigned S3 upload first, then send the message with the URL ([topics/10](../topics/10-background-jobs-and-uploads.md)) |
| Very large group | Fan-out cost grows with members; cap group size, or use a fan-out worker |
| Auth on the socket | Verify the JWT during the handshake, not per message |

---

## Say this in the interview (the 90-second version)

> "Chat is bidirectional and latency-sensitive, so polling is wrong — I'd use WebSockets via
> Socket.io, which also gives me reconnection handling and rooms.
>
> The data model is conversations, a conversation_members junction table, and messages. The
> important index is a composite on conversation_id and created_at, because every read is
> 'the last fifty messages in this conversation.' I'd paginate history with a cursor rather
> than an offset, since new messages keep arriving and offsets shift.
>
> The interesting problem is that as soon as I run more than one Node instance, users are
> connected to different servers — so if A is on server 1 and B is on server 2, emitting to
> a room only reaches the sockets on server 1. The fix is the Socket.io Redis adapter, which
> uses pub/sub so every instance broadcasts to its own connected sockets.
>
> For presence I'd store a key per user in Redis with a short TTL refreshed by a heartbeat,
> rather than relying only on the disconnect event — if a server crashes, its disconnect
> handlers never fire and those users would look online forever.
>
> Typing indicators are broadcast but never persisted. For read receipts I keep a
> last_read_at watermark per member rather than a row per message per user, which gives me
> both the seen state and the unread count cheaply.
>
> If the recipient is offline, the message is persisted and I send a push notification. And
> I'd treat delivery as at-least-once and dedupe on the client by message id, rather than
> trying to guarantee exactly-once."

---

## My attempt

<!-- Day 24: cover the page, 20-min timer, out loud, then compare. -->
