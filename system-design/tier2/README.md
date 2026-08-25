# Tier 2 — After the 6 LPA Offer

> **Locked. Do not start these until the offer is signed.**
>
> This isn't arbitrary. Every hour spent on Kafka before you're hired is an hour not spent
> on indexing, transactions, and your project pitch — the things that actually decide a
> 6 LPA interview. These topics start mattering at roughly 10–15 LPA, and by then you'll
> have production experience to hang them on, which makes them far easier to learn.
>
> The folder exists now so that growth doesn't need a restructure. Same repo, same workflow,
> just more files.

---

## Unlock order (8–15 LPA band)

Roughly ordered by return on effort, same as Tier 1 was.

| # | Topic | Why it matters at that band |
|---|-------|----------------------------|
| 11 | **Message queues & event-driven architecture** | Kafka vs RabbitMQ vs SQS, at-least-once vs exactly-once, consumer groups, event sourcing, the outbox pattern |
| 12 | **Database sharding & partitioning** | Shard keys, consistent hashing, cross-shard joins, rebalancing, when it's genuinely necessary |
| 13 | **Microservices** | Service boundaries, API gateway, service discovery, the saga pattern for distributed transactions, why the monolith was probably fine |
| 14 | **Observability** | Structured logging, metrics (Prometheus/Grafana), distributed tracing, SLIs/SLOs, alerting that doesn't cry wolf |
| 15 | **CDN & edge** | Cache hierarchies, cache keys, purging, edge functions, geo-routing |
| 16 | **Consistency models** | Strong vs eventual, read-your-writes, quorum reads/writes, vector clocks |
| 17 | **Rate limiting at scale** | Token bucket vs leaky bucket vs sliding window, distributed counters |
| 18 | **Search infrastructure** | Elasticsearch internals, inverted indexes, relevance scoring, indexing pipelines |
| 19 | **CI/CD & infrastructure** | Docker, Kubernetes basics, blue-green and canary deploys, IaC, zero-downtime migrations |
| 20 | **System design at scale** | Design Twitter / Uber / Netflix — fan-out strategies, geospatial indexing, video pipelines |

---

## When to actually unlock

Start Tier 2 when **any** of these is true:

- You've signed the 6 LPA offer and completed your notice period
- You're being asked to work on something in this list at work — learn it in context, it
  sticks far better
- You're targeting 10 LPA+ roles and Tier 1 answers are genuinely automatic

**Not** when Tier 1 feels boring. Boring means you're close to fluent — that's the point.

---

## How to add a topic here

Exactly the same as Tier 1, so there's nothing new to learn about the repo:

1. `tier2/11-message-queues.md`
2. Same file shape: how it's asked → concepts → code → **Say this in the interview**
3. Add a row to the table above and a line in the root [README](../README.md)

No new folders. No reorganising. The structure is already the structure.
