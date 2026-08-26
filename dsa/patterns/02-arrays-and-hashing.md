# 02 — Arrays & Hashing

> **Kab pehchano:** sawaal mein "count", "duplicate", "frequency", "kya ye pehle
> dekha hai?", "pair dhoondho" — kuch bhi ho, sabse pehle **hash map soncho**.
> Ye pattern sabse zyada aata hai. Isi se O(n²) → O(n) hota hai.

---

## Core idea

Brute force mein tum har element ke liye baaki poore array mein dhoondhte ho → O(n²).
Hash map us "dhoondhne" ko O(1) bana deta hai → poora solution O(n).

**Tradeoff:** time O(n²) → O(n), lekin space O(1) → O(n). Ye khud bolna hai.

---

## Template 1 — Frequency count

```js
function buildFreq(arr) {
  const freq = new Map();
  for (const x of arr) {
    freq.set(x, (freq.get(x) || 0) + 1);
  }
  return freq;
}
```
Ye teen line har jagah kaam aayengi. Yaad kar lo.

## Template 2 — "Seen before?" (Set)

```js
function hasDuplicate(arr) {
  const seen = new Set();
  for (const x of arr) {
    if (seen.has(x)) return true;   // mil gaya
    seen.add(x);
  }
  return false;
}
```

## Template 3 — Complement lookup (Two Sum ka dil)

```js
function twoSum(nums, target) {
  const seen = new Map();            // value → index
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];   // kya chahiye
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);            // baad mein add karo, warna khud se pair ban jayega
  }
  return [];
}
```

**Yahan ek line important hai:** `seen.set(...)` **check ke baad** aata hai.
Pehle add kar diya to element khud ke saath pair bana lega. Ye classic bug hai.

---

## Problems — solve karo, phir solution dekho

### 1. Two Sum  ·  Easy  ·  *guaranteed aata hai*
Array aur target diya hai, do indices lautao jinka sum target ho.
→ Template 3. **O(n) time, O(n) space.**

### 2. Contains Duplicate  ·  Easy
Array mein koi element repeat ho raha hai?
```js
const containsDuplicate = (nums) => new Set(nums).size !== nums.length;
```
One-liner hai, par interview mein Set wala loop likhna better — early return dikh jaata hai.

### 3. Valid Anagram  ·  Easy
Do strings — kya ek dusre ka anagram hai?
```js
function isAnagram(s, t) {
  if (s.length !== t.length) return false;      // ye check pehle — free optimization
  const freq = new Map();
  for (const ch of s) freq.set(ch, (freq.get(ch) || 0) + 1);
  for (const ch of t) {
    if (!freq.get(ch)) return false;            // hai hi nahi, ya 0 ho gaya
    freq.set(ch, freq.get(ch) - 1);
  }
  return true;
}
```
> **Follow-up jo poocha jaata hai:** "sort karke bhi ho sakta tha?" Haan —
> `s.split('').sort().join('') === t.split('').sort().join('')`, par wo **O(n log n)**
> hai. Hash map wala **O(n)** hai. Ye farak bolna.

### 4. Group Anagrams  ·  Medium
Anagrams ko group karo.
**Key insight:** har word ka *sorted version* uski key hai. `"eat"` aur `"tea"` dono → `"aet"`.
```js
function groupAnagrams(strs) {
  const map = new Map();
  for (const w of strs) {
    const key = w.split('').sort().join('');
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(w);
  }
  return [...map.values()];
}
```

### 5. Top K Frequent Elements  ·  Medium
Frequency map banao → phir top k nikalo.
```js
function topKFrequent(nums, k) {
  const freq = new Map();
  for (const n of nums) freq.set(n, (freq.get(n) || 0) + 1);
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])      // frequency ke hisaab se descending
    .slice(0, k)
    .map(([num]) => num);
}
```
Ye **O(n log n)** hai sorting ki wajah se. Bucket sort se O(n) ho sakta hai —
6 LPA pe sort wala answer chalega, bas bol dena ki "bucket sort se O(n) ho sakta hai".

### 6. Product of Array Except Self  ·  Medium  ·  *division allowed nahi*
Har index pe baaki sab ka product.
**Trick:** do pass — pehle left ka product, phir right ka.
```js
function productExceptSelf(nums) {
  const n = nums.length, res = new Array(n).fill(1);
  let prefix = 1;
  for (let i = 0; i < n; i++) { res[i] = prefix; prefix *= nums[i]; }
  let suffix = 1;
  for (let i = n - 1; i >= 0; i--) { res[i] *= suffix; suffix *= nums[i]; }
  return res;
}
```
**O(n) time, O(1) extra space** (output array count nahi hota).

### 7. Maximum Subarray (Kadane's)  ·  Medium  ·  *bohot poocha jaata hai*
Contiguous subarray ka maximum sum.
```js
function maxSubArray(nums) {
  let maxSum = nums[0], current = nums[0];
  for (let i = 1; i < nums.length; i++) {
    current = Math.max(nums[i], current + nums[i]);  // naya shuru karun ya jodun?
    maxSum = Math.max(maxSum, current);
  }
  return maxSum;
}
```
**Poora logic ek line mein:** har step pe decide karo — "ismein se naya subarray
shuru karun, ya pichle mein jodun?" **O(n) time, O(1) space.**

> ⚠️ `maxSum = 0` se shuru mat karna — saare negative numbers wale case mein galat
> answer dega. `nums[0]` se shuru karo. Ye edge case interviewer specially poochta hai.

---

## Checklist

- [ ] "Duplicate/count/seen?" sunte hi Set ya Map ka khayal aaya
- [ ] Two Sum bina dekhe likh sakta hoon
- [ ] Complement wale template mein `set()` **check ke baad** likhta hoon
- [ ] Kadane ko `nums[0]` se initialise karta hoon, `0` se nahi
- [ ] Har solution ke baad time + space dono bolta hoon

## Say this in the interview

> "Brute force mein main har element ke liye baaki array pe loop chalata, jo O(n²) hota.
> Isko hash map se O(n) kar sakta hoon — ek pass mein har element store karta jaunga aur
> lookup O(1) ho jayega. Space O(n) use hoga, ye time-space tradeoff hai.
> Edge cases dekh loon — empty array, ek hi element, aur saare negative numbers."

---

## Mere solutions

<!-- Day 2-4: yahan apne solutions likhna. Jo problem atki, uska reason bhi likhna. -->
