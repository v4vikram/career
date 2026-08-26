# 01 — Big-O & JS Basics

> **Kyun pehle:** har solution ke baad interviewer poochega "time complexity kya hai?"
> Agar sahi solution likh ke bhi complexity galat batayi, to wo minus point hai.
> Ye file baaki 9 patterns ki foundation hai.

---

## Big-O — jo yaad rakhna hai

| Complexity | Naam | Kahan milta hai |
|------------|------|-----------------|
| O(1) | Constant | Hash map lookup, array index access, push/pop |
| O(log n) | Logarithmic | Binary search, balanced tree ki height |
| O(n) | Linear | Ek loop poore array pe |
| O(n log n) | Linearithmic | Sorting (`.sort()`, merge sort, quick sort avg) |
| O(n²) | Quadratic | Nested loop — do loops ek dusre ke andar |
| O(2ⁿ) | Exponential | Naive recursion (bina memo ke Fibonacci), subsets |

**Interview mein 90% answers in teen mein se hote hain: O(n), O(n log n), O(n²).**
Agar tumhara answer O(n²) hai, interviewer O(n) maang raha hai — aur usually
**hash map** ya **two pointers** us O(n²) ko O(n) banata hai.

### Rules jo galti karwate hain

```js
// ❌ "do loops hain to O(n²)" — GALAT
for (let i = 0; i < n; i++) { ... }   // O(n)
for (let j = 0; j < n; j++) { ... }   // O(n)
// Ye sequential hain → O(n) + O(n) = O(2n) = O(n)

// ✅ Nested hone pe O(n²)
for (let i = 0; i < n; i++) {
  for (let j = 0; j < n; j++) { ... }  // O(n × n) = O(n²)
}
```

- **Constants drop karo:** O(2n) → O(n). O(n/2) → O(n).
- **Chhote terms drop karo:** O(n² + n) → O(n²).
- **Alag inputs = alag variables:** do arrays pe loop → O(n + m), O(n²) nahi.

---

## JS array methods ki complexity — ye zaroor poocha jaata hai

| Method | Complexity | Note |
|--------|:----------:|------|
| `arr[i]` | O(1) | Index access |
| `push()` / `pop()` | O(1) | End se — isi liye stack ke liye perfect |
| `shift()` / `unshift()` | **O(n)** | ⚠️ Start se — saare elements shift hote hain |
| `slice()` | O(n) | Naya array banata hai |
| `splice()` | O(n) | Original ko modify karta hai |
| `indexOf()` / `includes()` | **O(n)** | ⚠️ Loop ke andar mat use karo → O(n²) ban jayega |
| `sort()` | O(n log n) | |
| `map` / `filter` / `forEach` / `reduce` | O(n) | |
| `concat()` / spread `[...a]` | O(n) | |

### Do sabse badi galtiyan

```js
// ❌ TRAP 1: loop ke andar includes() → O(n²)
for (const x of arr) {
  if (seen.includes(x)) { ... }     // includes खुद O(n) hai
}

// ✅ Set use karo → O(n)
const seen = new Set();
for (const x of arr) {
  if (seen.has(x)) { ... }          // has() O(1)
  seen.add(x);
}
```

```js
// ❌ TRAP 2: queue ke liye shift() → O(n²)
while (queue.length) { const node = queue.shift(); ... }

// ✅ Pointer use karo → O(n)
let head = 0;
while (head < queue.length) { const node = queue[head++]; ... }
```

**`shift()` ka O(n) hona** — ye chhota lagta hai par BFS/queue wale sawaalon mein
interviewer exactly yahi dekhta hai.

---

## Map vs Object vs Set

| | Kab use karo | Lookup |
|---|---|---|
| `Object {}` | Simple string keys, JSON jaisa data | O(1) |
| `Map` | Keys kisi bhi type ki ho, insertion order chahiye, size chahiye | O(1) |
| `Set` | Sirf "ye dekha hai ya nahi" — duplicates hatane | O(1) |

```js
const map = new Map();
map.set('a', 1);
map.get('a');                       // 1
map.has('a');                       // true
map.set('a', (map.get('a') || 0) + 1);   // frequency count ka pattern

const set = new Set([1, 2, 2, 3]);  // {1, 2, 3} — duplicates apne aap gaye
[...new Set(arr)]                   // array se duplicates hatane ka one-liner
```

**Frequency map** — ye pattern 02, 04, 05 mein baar-baar aayega:
```js
const freq = new Map();
for (const ch of str) freq.set(ch, (freq.get(ch) || 0) + 1);
```

---

## Space complexity

Sirf **extra** space count hota hai — input array count nahi hota.

```js
// O(1) space — sirf kuch variables
let sum = 0;
for (const x of arr) sum += x;

// O(n) space — input ke size ka naya structure
const seen = new Set(arr);
```

**Recursion mein call stack bhi space hai.** n-level deep recursion = O(n) space,
bhale hi tumne koi array na banaya ho. Ye follow-up question banta hai.

---

## Say this in the interview

> "Iska brute force O(n²) hoga kyunki har element ke liye poore array pe dobara loop
> chalana padega. Isko main hash map se O(n) kar sakta hoon — ek hi pass mein har
> element ko store karta jaunga aur lookup O(1) mein ho jayega. Space O(n) ho jayega,
> to ye classic time-space tradeoff hai."

**Rehearse until:** koi bhi solution likhne ke baad, bina soche time aur space
complexity dono bol pao — aur ye bata pao ki O(n²) ko O(n) kaise banaoge.

---

## Mere notes

<!-- Day 1: yahan apne solutions ki complexity likhna, jo confuse kare wo note karna -->
