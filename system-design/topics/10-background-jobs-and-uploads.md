# 10 — Background Jobs, Queues & File Uploads

> **How it's asked:** "A user signs up and you need to send a welcome email — where does
> that happen?" / "How would you handle 10,000 emails?" / "How do you handle image uploads?"
> Short topic, high yield: the answer is a single principle applied consistently, and
> getting it right signals you've built something real.

---

## The principle

**Anything the user doesn't need in order to get their response should not happen during the
request.**

```js
// Wrong — user waits 3 seconds for an email they don't need to see
app.post('/register', async (req, res) => {
  const user = await User.create(req.body);
  await sendWelcomeEmail(user.email);      // 3s, and if SMTP is down the signup 500s
  res.status(201).json({ user });
});

// Right — respond immediately, do the slow thing after
app.post('/register', async (req, res) => {
  const user = await User.create(req.body);
  await emailQueue.add('welcome', { userId: user.id });   // ~5ms, just enqueues
  res.status(201).json({ user });
});
```

Two separate wins: the response is fast, **and** a failing email provider no longer breaks
signup. That second point is the one to say out loud — it's about coupling, not just speed.

**Move to a queue:** emails and SMS, image/video processing, PDF and report generation,
third-party API calls, bulk imports, webhooks you send, anything scheduled.

---

## Job queue with BullMQ (Redis-backed)

```js
// producer — in your route
import { Queue } from 'bullmq';
const emailQueue = new Queue('emails', { connection: { host, port } });

await emailQueue.add('welcome', { userId: user.id }, {
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 },   // 2s, 4s, 8s
  removeOnComplete: 100,
  removeOnFail: 1000,
});

// worker — a SEPARATE process, not your API server
import { Worker } from 'bullmq';
new Worker('emails', async job => {
  const user = await User.findByPk(job.data.userId);
  await mailer.send(user.email, welcomeTemplate(user));
}, { connection: { host, port }, concurrency: 5 });
```

**Run the worker as its own process.** If it shares the API process, a CPU-heavy job blocks
the event loop and your API latency spikes — a great thing to mention, because it connects
queues to how Node actually works.

### What a queue gives you that a `setTimeout` doesn't

| Feature | Why it matters |
|---------|----------------|
| **Retries with backoff** | Transient SMTP or API failures recover on their own |
| **Persistence** | Jobs survive a server restart; `setTimeout` does not |
| **Concurrency control** | Cap at 5 workers so you don't get rate-limited by the provider |
| **Scheduling / repeat** | Cron-style recurring jobs |
| **Dead letter queue** | Jobs that fail all attempts are kept for inspection, not lost |
| **Observability** | You can see depth, failures, and throughput |

**Jobs must be idempotent.** A retry may run a job that partly succeeded — so
"charge the card" must check whether it already charged. Same reasoning as
[05 — idempotency keys](05-transactions-and-acid.md).

### 10,000 emails

> *"I wouldn't loop and send. I'd enqueue 10,000 jobs — or one batch job that fans out —
> and let a pool of workers drain the queue with bounded concurrency, say 10 at a time, so
> I stay inside the provider's rate limit. Each job retries with exponential backoff on
> failure, and anything that exhausts its retries lands in a dead letter queue I can inspect.
> The API request that triggered it returns immediately."*

---

## File uploads

### Never store uploads on the app server's disk

It breaks horizontal scaling (server 2 can't serve a file on server 1's disk — see
[08](08-scaling-basics.md)), it's lost when the container restarts, and it doesn't back up.
**Use S3 / Cloudinary and store only the URL or key in your database.**

### Two approaches

**1. Through your server** (`multer` → S3)
```
browser → Node (buffers the whole file) → S3
```
Simple, and you can validate the file. But the file occupies a Node process and its memory
for the whole upload — a 50 MB video will hurt.

**2. Presigned URL — the better answer**
```
1. browser → GET /api/v1/uploads/presign?type=image/jpeg
2. server verifies auth, returns a short-lived signed S3 URL
3. browser → PUT the file DIRECTLY to S3    (never touches Node)
4. browser → POST /api/v1/products { imageKey }
```

```js
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

app.get('/api/v1/uploads/presign', authenticate, async (req, res) => {
  const key = `uploads/${req.user.id}/${crypto.randomUUID()}.jpg`;
  const url = await getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: req.query.type }),
    { expiresIn: 300 }      // 5 minutes
  );
  res.json({ url, key });
});
```

Your server never handles the bytes at all — it stays fast no matter how large the file.
**Saying "presigned URL" is a strong signal**; most candidates only know `multer`.

### Then process asynchronously

```
upload to S3 → POST /products { imageKey } → enqueue "generate-thumbnails"
             → worker: download, resize to 3 sizes (sharp), upload back, update the row
```

Never resize images inside the request. `sharp` is CPU-bound and will block the event loop.

### Upload security checklist

- [ ] **Validate the MIME type by inspecting the file's magic bytes**, not by trusting the
      extension or the client-supplied `Content-Type` — both are trivially spoofed
- [ ] Cap file size (in multer, and again in the S3 presigned policy)
- [ ] **Generate the stored filename yourself** (UUID) — never use the user's, which can
      contain `../` path traversal
- [ ] Serve user uploads from a separate domain/bucket, so a malicious HTML upload can't run
      script against your app's origin
- [ ] Keep the bucket private; serve reads through presigned GET URLs or a CDN

---

## Scheduled jobs

```js
await queue.add('daily-report', {}, { repeat: { pattern: '0 2 * * *' } });  // 2am daily
```

**Don't use `node-cron` in the API process once you scale horizontally** — every instance
fires the job, so a nightly email goes out three times. Use the queue's repeatable jobs
(coordinated through Redis), a distributed lock, or an external scheduler. This is a sharp
little detail that shows you've thought about multi-instance deployments.

---

## When you'd reach for a real message broker

At this band, **BullMQ on Redis is the right answer** and you should say so. But know the
boundary:

- **BullMQ / Redis** — job queues inside one application. Simple, fast, good enough for the
  vast majority of products.
- **RabbitMQ** — complex routing, multiple consumers, delivery guarantees between services.
- **Kafka** — high-throughput event streaming, replayable logs, many independent consumers
  reading the same stream.

> *"I'd use BullMQ unless there were multiple services that needed to consume the same
> events independently — that's when a real broker starts to earn its operational cost."*

---

## Say this in the interview

> "My rule is that anything the user doesn't need in their response shouldn't happen during
> the request. So on signup I create the user, enqueue a welcome-email job, and respond
> immediately. That keeps the response fast, and just as importantly it decouples signup
> from the email provider — if SMTP is down, registration still works.
>
> I'd use BullMQ backed by Redis, with the workers running as separate processes so a
> CPU-heavy job doesn't block the API's event loop. Jobs get retries with exponential
> backoff, and anything that exhausts its retries goes to a dead letter queue. I make jobs
> idempotent, because a retry might re-run something that already partly succeeded.
>
> For uploads I don't store files on the app server — that breaks as soon as there's more
> than one instance. I'd use presigned S3 URLs so the browser uploads directly to S3 and my
> server never handles the bytes, then store just the key in MySQL and enqueue a job to
> generate thumbnails. I validate the file type by its magic bytes rather than the
> extension, and I generate the stored filename myself to avoid path traversal."

**Rehearse until:** you can explain the presigned URL flow in four steps, and give the
10,000-emails answer without hesitating.
