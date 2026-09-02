# DSA — Chat Context

> **Naye chat mein is file ka poora content paste kar do.** Claude ko turant pata chal
> jayega main kaun hoon, kahan tak pahuncha hoon, aur kaise padhata hai mujhe.
> Session ke end mein bolna: *"CONTEXT.md update karo"*.

---

## Main kaun hoon

- Vikram — MERN developer, Timewatch mein kaam karta hoon
- **Target: 6 LPA backend/fullstack role**, India. Coding round clear karna hai
- Language: **JavaScript**
- Level: **beginner** DSA mein. Easy + easy-medium hi chahiye, hard nahi
- Repo: `career/` — do independent tracks, `system-design/` aur `dsa/`

## Mujhe kaise padhana hai — ye zaroori hai

- **Hinglish (Roman script) mein baat karo.** Pure Hindi/Devanagari nahi
- **Bina poochhe bade kaam mat karo.** Pehle poochho, phir karo
- **Padha ke nahi, karake samjhao.** Trace tables padhne se click nahi hota.
  **Concrete kahani chalti hai** — paise wali baat, phonebook, party ka darwaza.
  Ye teeno ne mujhe hash map samjhaya, jab tables fail ho gaye the
- **Ek waqt pe ek concept.** Complement + index tracking ek saath diya to atak gaya tha.
  Alag-alag do — pehle simple version (Set, true/false), phir upgrade (Map, indices)
- **Pamper mat karo.** Seedha bolo kahan galat hai
- **Mock: ek question ek baar.** Har answer pe feedback, phir agla
- **Mera code chala ke test karo** — "chal gaya" ko main "sahi hai" samajh leta hoon.
  Ye galti do baar ho chuki hai

---

## Status — 2 September 2026

### ✅ Basics — 15/29 solve kiye

**Array (11):** secondLargest · removeDuplicates · removeElm · reverseString ·
buyAndSell · mergeTwoSorted · twoSum · moveZeros · containerWater · consecutiveOnes ·
missingNumber
**String (4):** reverseWords · firstUniqChar · removeRepeatedChars · countVowelsAndConst
**JS-specific (0/7):** shuru nahi kiya

⚠️ **Ye sab pattern padhe bina, instinct se solve kiye the.** Isi liye Two Sum ka
main answer (hash map) nahi aaya tha — pattern-level tool haath mein hi nahi tha.

### 🟡 Hashing pattern — chal raha hai (~35%)

**Jo sach mein aa gaya:**
- `need = target - num` ka **kyun** — samjha sakta hoon, ratta nahi hai
- **Reverse lookup** ka idea — array `index → value` deta hai, Map `value → index`.
  **Ye khud nikala tha**, bataya nahi gaya
- "Dhoondho mat, calculate karo" — yahi O(n²) → O(n) ka engine hai

**Jo abhi baaki hai:**
- ❌ **Ek baar bhi blank file pe khud nahi likha** — sirf samjha hai
- ❌ 3 template mein se sirf 1 dekha (complement). Frequency aur seen-set baaki
- ❌ **Pehchan test hi nahi hui** — nayi problem dekh ke "ye hashing hai" bol paunga?

### ❌ 10 patterns — ek bhi nahi padha
01 Big-O · 02 Arrays & Hashing · 03 Two Pointers · 04 Sliding Window · 05 Strings ·
06 Binary Search · 07 Sorting · 08 Recursion · 09 Linked List · 10 Stack/Queue/Trees

---

## 🔴 Agla kaam — hashing ki 5 problems, khud se

| # | Problem | Template | Time laga |
|---|---------|----------|-----------|
| 1 | **Two Sum** — blank se, dobara | 3 (complement) | |
| 2 | **Contains Duplicate** | 2 (seen set) | |
| 3 | **Valid Anagram** | 1 (frequency) | |
| 4 | **First non-repeating char** — blank se, dobara | 1 | |
| 5 | **Group Anagrams** | 1 + dimaag | |

**Har problem se pehle 30 second ruko aur bolo: "konsa template lagega?"** — code baad mein.

### Atakne ka protocol (aaj 45 min padhne mein waste hue the)

| Kitni der | Kya karo |
|---|---|
| 10 min | Padhna band. **Kagaz nikalo**, 3-4 numbers se haath se trace karo |
| 20 min | Sirf **template** dekho, poora solution nahi |
| 30 min | Solution dekho — phir **turant band karke blank se likho** |

**Kabhi mat karo:** solution padh ke "samajh gaya" bol ke agli problem pe jaana.

### ⏱️ Time curve — ispe nazar rakhni hai

| Problem | Expected |
|---|---|
| 1st (Two Sum) | 60-120 min ← **yahin tha, normal hai** |
| 2nd | 20-30 min |
| 3rd | 15 min |
| 4th | 10 min |
| 5th | 20 min |

**Pehli pe 2 ghante = cost of entry, theek hai. Doosri pe bhi 2 ghante lage to
problem hai — Claude ko batana.**

---

## Wapas aake ye batana

- Kaunsi problem, **kitna time laga** (curve check)
- Kahan atka — aur **atakne se pehle kya socha tha** (isse gap pata chalta hai)

**5 nikal gaye → mock interview resume**, Two Sum se hi shuru.

## Files

`README.md` · `ROADMAP.md` (28-day, Day 0 = basics) · `basics-array-string.md` (29 Qs) ·
`patterns/01-10` · `practice/*.js` (yahan code likhta hoon) · `interview/qa-bank.md`
