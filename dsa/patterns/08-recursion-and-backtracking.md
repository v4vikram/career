# 08 — Recursion & Backtracking

> **Kab pehchano:** "saare combinations", "saare subsets", "saare permutations",
> "saare paths" — jahan **sab possibilities** chahiye, wahan backtracking.
> Aur tree/linked list ke sawaal to natural recursion hote hain.

---

## Recursion ke do hisse — bas do

```js
function solve(input) {
  if (/* base case */) return /* simplest answer */;   // 1. kab rukna hai
  return solve(/* chhota input */);                    // 2. chhote problem pe bharosa
}
```

**Sabse zaroori mindset:** ye mat sochne baitho ki poora call stack kaise chalega.
Bas maano ki `solve(n-1)` **sahi answer de dega**, aur us answer se apna answer bana lo.
Ye "leap of faith" hi recursion samajhne ka tareeka hai.

```js
function factorial(n) {
  if (n <= 1) return 1;              // base case
  return n * factorial(n - 1);       // maan lo factorial(n-1) sahi hai
}

function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);    // ⚠️ O(2ⁿ) — memo ke bina bohot slow
}
```

**Fibonacci pe follow-up guaranteed hai:** *"ye slow kyun hai?"*
Kyunki same subproblems baar-baar compute hote hain. **Memoization** se O(n):
```js
function fib(n, memo = new Map()) {
  if (n <= 1) return n;
  if (memo.has(n)) return memo.get(n);
  memo.set(n, fib(n - 1, memo) + fib(n - 2, memo));
  return memo.get(n);
}
```

> **Space:** recursion mein call stack bhi space leta hai. n-deep recursion = **O(n) space**,
> chahe tumne koi array na banaya ho. Ye bolna zaroori hai.
> Bohot deep ho to **"stack overflow ho sakta hai, isliye iterative better hoga"** — ye
> line interviewer sunna chahta hai.

---

## Backtracking template — ise ratna hai

```js
function backtrack(path, choices, result) {
  if (/* path complete hai */) {
    result.push([...path]);        // ⚠️ COPY — [...path], seedha path nahi
    return;
  }
  
  for (const choice of choices) {
    path.push(choice);             // 1. choose
    backtrack(path, /* updated */, result);   // 2. explore
    path.pop();                    // 3. UN-choose ← yahi "backtrack" hai
  }
}
```

**Do baar galti hoti hai:**
1. `result.push(path)` likh dena — **reference** push ho jaata hai, aur `pop()` ke
   baad saare results khali ho jaate hain. Hamesha `[...path]` — copy.
2. `path.pop()` bhool jana — tab paths aapas mein mix ho jaate hain.

---

## Problems

### 1. Reverse a String (recursively)  ·  Easy  ·  *warm-up*
```js
function reverse(s) {
  if (s.length <= 1) return s;
  return reverse(s.slice(1)) + s[0];
}
```

### 2. Subsets  ·  Medium  ·  ⭐
`[1,2,3]` → `[[], [1], [1,2], [1,2,3], [1,3], [2], [2,3], [3]]`
```js
function subsets(nums) {
  const res = [], path = [];
  function backtrack(start) {
    res.push([...path]);                  // har node ek valid subset hai
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]);
      backtrack(i + 1);                   // i+1 — aage se hi choose karo
      path.pop();
    }
  }
  backtrack(0);
  return res;
}
```
**`start` parameter hi duplicates rokta hai.** Uske bina `[1,2]` aur `[2,1]` dono
aayenge. **O(2ⁿ)** — har element ya to hai ya nahi.

### 3. Permutations  ·  Medium  ·  ⭐
`[1,2,3]` → saare 6 orders.
```js
function permute(nums) {
  const res = [], path = [], used = new Array(nums.length).fill(false);
  function backtrack() {
    if (path.length === nums.length) { res.push([...path]); return; }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;              // ye already path mein hai
      used[i] = true;  path.push(nums[i]);
      backtrack();
      path.pop();      used[i] = false;   // dono undo karne hain
    }
  }
  backtrack();
  return res;
}
```
**Subsets vs Permutations ka farak:**
- Subsets → `start` use hota hai (order matter nahi karta)
- Permutations → `used[]` array (order matter karta hai, har element ek baar)

**O(n!)** — isliye n chhota hi hoga.

### 4. Combination Sum  ·  Medium
Candidates repeat kar sakte ho, sum target ho.
```js
function combinationSum(candidates, target) {
  const res = [], path = [];
  function backtrack(start, remaining) {
    if (remaining === 0) { res.push([...path]); return; }
    if (remaining < 0) return;                     // pruning
    for (let i = start; i < candidates.length; i++) {
      path.push(candidates[i]);
      backtrack(i, remaining - candidates[i]);     // i, i+1 nahi — reuse allowed
      path.pop();
    }
  }
  backtrack(0, target);
  return res;
}
```
**`backtrack(i, ...)` — `i+1` nahi**, kyunki same number dobara use kar sakte hain.
Ye ek character ka farak poora answer badal deta hai.

### 5. Generate Parentheses  ·  Medium
```js
function generateParenthesis(n) {
  const res = [];
  function backtrack(str, open, close) {
    if (str.length === n * 2) { res.push(str); return; }
    if (open < n)     backtrack(str + '(', open + 1, close);
    if (close < open) backtrack(str + ')', open, close + 1);  // close < open hona zaroori
  }
  backtrack('', 0, 0);
  return res;
}
```
**Rule:** `(` tab tak daal sakte ho jab tak `n` se kam hain. `)` sirf tab jab
already khule hue `(` zyada hain. Isi se invalid strings ban hi nahi paati.

---

## Checklist

- [ ] Base case pehle likhta hoon
- [ ] Backtracking template bina dekhe likh sakta hoon
- [ ] `result.push([...path])` — copy karta hoon, reference nahi
- [ ] `path.pop()` kabhi nahi bhoolta
- [ ] Subsets (`start`) aur Permutations (`used[]`) ka farak pata hai
- [ ] Recursion ke space mein call stack count karta hoon

## Say this in the interview

> "Ye 'saare combinations' wala sawaal hai, to main backtracking use karunga.
> Har step pe ek choice loonga, us choice ke saath aage recurse karunga, aur wapas
> aake wo choice undo kar dunga — yahi backtrack karna hai. Base case tab jab path
> poora ho jaye, tab main uski **copy** result mein daal dunga — reference nahi,
> warna undo karne pe result kharab ho jayega.
> Complexity O(2ⁿ) hogi subsets ke liye aur O(n!) permutations ke liye, plus recursion
> stack ke liye O(n) space."

---

## Mere solutions

<!-- Day 19-20 -->
