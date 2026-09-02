# System Design — Chat Context

> **Naye chat mein is file ka poora content paste kar do.** Claude ko turant pata chal
> jayega main kaun hoon, kahan tak pahuncha hoon, aur kaise padhata hai mujhe.
> Session ke end mein bolna: *"CONTEXT.md update karo"*.

---

## Main kaun hoon

- Vikram — MERN developer, Timewatch mein kaam karta hoon (Next.js/MERN)
- **Target: 6 LPA backend/fullstack role**, India
- Stack: Node, Express, React, MongoDB, **MySQL**, Redis
- Repo: `career/` — do independent tracks, `system-design/` aur `dsa/`

## Mujhe kaise padhana hai — ye zaroori hai

- **Hinglish (Roman script) mein baat karo.** Pure Hindi/Devanagari nahi
- **Bina poochhe bade kaam mat karo.** Pehle poochho, phir karo
- **Padha ke nahi, karake samjhao.** Tables aur traces padhne se mujhe click nahi hota.
  Concrete analogy (paise, phonebook) + khud likhwana — isse hota hai
- **Ek waqt pe ek concept.** Do cheezein ek saath doge to confuse ho jaunga
- **Pamper mat karo.** Galat hai to seedha bolo, kahan galat hai wo batao
- **Mock interview: ek question ek baar.** Saare ek saath mat poochho —
  har answer ke baad feedback chahiye, tabhi seekhta hoon
- Structure complicate mat karo, aur repo/git ka jhanjhat mujhe mat do — wo tum sambhalo

---

## Status — 2 September 2026

### Padha hua (3/10 topics)

| # | Topic | Halat |
|---|-------|-------|
| 01 | Request lifecycle & HTTP | Padh liya — **self-test baaki** |
| 02 | REST API design | Padh liya — **self-test baaki** |
| 03 | MySQL schema design | Padh liya — kuch hissa aur pakka karna hai |

### Baaki (7/10) — abhi shuru nahi kiya
04 Indexing & query optimization · 05 Transactions & ACID · 06 Auth & security ·
07 Caching & Redis · 08 Scaling basics · 09 SQL vs NoSQL · 10 Background jobs & uploads

### Aur kya ho chuka hai
- `interview/project-pitch.md` **bhar diya hai** (Roadmap ka Day 25 ka kaam, pehle ho gaya)
- `interview/qa-bank.md` — 60 questions ready, **abhi tak use nahi kiya**
- 3 design walkthroughs (URL shortener, e-commerce, chat app) — **abhi tak nahi chhue**

---

## 🔴 Agla kaam — 01-03 ka self-test (45 min, pending)

Files band, kagaz-pen. **Padhna nahi, produce karna hai.**

1. **Topic 01 (10 min)** — browser se DB tak poora path likho. Phir 5 scenario pe
   status code batao: token nahi bheja / logged in par admin route / duplicate email /
   rate limit / validation fail.
   **Pass:** 7 steps (DNS, TCP, TLS, load balancer, middleware, cache, DB) + 5/5 codes
2. **Topic 02 (5 min)** — *food delivery* ke 10 endpoints, 3 min mein.
   **Pass:** nouns in URL, sahi verbs, 201/204, pagination, `/api/v1`
3. **Topic 03 (12 min)** — usi domain ka 6-table schema, types + keys ke saath.
   **Pass:** 3NF, ek M:N junction table composite PK ke saath, ek denormalization
   jo justify kar sakun, money pe DECIMAL, ON DELETE soch-samajh kar
4. **Q&A (15 min)** — `interview/qa-bank.md` se **Q1-12, 18, 19, 25** cold.
   (Ye 15 exactly topics 01-03 cover karte hain. Q13-17 indexing, Q20-24 transactions —
   wo abhi padhe nahi.) **Pass: 12/15 bina atke**

**Sabse zaroori:** bolke karo, dimaag mein nahi. Phone pe record karo, khud suno.

**Result ke hisaab se:**
- Pass → topic **04** shuru
- Ek test fail → sirf **us hisse** ko dobara padho, poori file nahi
- Do se zyada fail → topic dobara, par har section ke baad file band karke khud ko bolo

> **90% perfect mat karo.** 12/15 aur thoda hakla ke bhi bol paana 6 LPA ke liye kaafi
> hai. Perfect karne ke chakkar mein 04-10 ka time kha jaunga — wo abhi zero pe hain.

---

## Files

`README.md` (index) · `ROADMAP.md` (28-day sprint) · `topics/01-10` ·
`designs/` (3 walkthroughs) · `interview/qa-bank.md` · `interview/project-pitch.md`
