# 04 — Sliding Window

> **Kab pehchano:** sawaal mein **"subarray"** ya **"substring"** ho, aur saath mein
> **longest / shortest / maximum / minimum / exactly k** — to ye sliding window hai.
> Two pointers ka hi upgrade hai, bas ab window ke **andar ka data** track karte hain.

---

## Do variants

### Variant A — Fixed size window (size k diya hua hai)

```js
function maxSumFixed(arr, k) {
  let sum = 0;
  for (let i = 0; i < k; i++) sum += arr[i];   // pehli window
  let best = sum;
  for (let i = k; i < arr.length; i++) {
    sum += arr[i] - arr[i - k];                // naya andar, purana bahar
    best = Math.max(best, sum);
  }
  return best;
}
```
**Asli trick ye line hai:** `sum += arr[i] - arr[i - k]`. Har baar poori window ka
sum dobara nahi jodte — ek add, ek remove. Isi se O(n·k) → **O(n)** hota hai.

### Variant B — Variable size window (condition ke hisaab se)

```js
let left = 0;
for (let right = 0; right < arr.length; right++) {
  // 1. window ko expand karo — right wala element andar lo
  
  while (/* window invalid ho gayi */) {
    // 2. left se shrink karo jab tak valid na ho jaye
    left++;
  }
  
  // 3. yahan window valid hai — answer update karo
}
```
**Ye 3-step structure yaad karo.** Har variable window problem isi shape ki hoti hai.

---

## Problems

### 1. Maximum Sum Subarray of Size K  ·  Easy
Seedha Variant A. Yahi se shuru karo.

### 2. Longest Substring Without Repeating Characters  ·  Medium  ·  ⭐ *sabse zyada poocha jaata hai*
```js
function lengthOfLongestSubstring(s) {
  const seen = new Set();
  let left = 0, best = 0;
  for (let right = 0; right < s.length; right++) {
    while (seen.has(s[right])) {      // duplicate mila
      seen.delete(s[left]);           // left se shrink karo
      left++;
    }
    seen.add(s[right]);
    best = Math.max(best, right - left + 1);
  }
  return best;
}
```
**Window ka size hamesha `right - left + 1` hota hai.** `+1` bhoolna sabse common bug hai.

Dry run `"abcabcbb"` pe:
```
right=0 'a' → window "a"      best=1
right=1 'b' → window "ab"     best=2
right=2 'c' → window "abc"    best=3
right=3 'a' → duplicate! left ko 1 tak badhao → window "bca"  best=3
```

### 3. Best Time to Buy and Sell Stock  ·  Easy
Technically window nahi, par soch wahi hai — **abhi tak ka minimum yaad rakho.**
```js
function maxProfit(prices) {
  let minPrice = Infinity, best = 0;
  for (const p of prices) {
    minPrice = Math.min(minPrice, p);      // sabse sasta ab tak
    best = Math.max(best, p - minPrice);   // aaj bechte to kitna profit
  }
  return best;
}
```
**O(n) time, O(1) space.**

### 4. Longest Repeating Character Replacement  ·  Medium
Max k characters badal sakte ho — longest same-character substring?
```js
function characterReplacement(s, k) {
  const count = new Map();
  let left = 0, maxFreq = 0, best = 0;
  for (let right = 0; right < s.length; right++) {
    count.set(s[right], (count.get(s[right]) || 0) + 1);
    maxFreq = Math.max(maxFreq, count.get(s[right]));
    
    // window size - sabse zyada wale ka count = kitne badalne padenge
    while ((right - left + 1) - maxFreq > k) {
      count.set(s[left], count.get(s[left]) - 1);
      left++;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}
```
**Key line:** `(window size) - maxFreq` = kitne characters replace karne padenge.
Wo `k` se zyada ho gaya to window shrink karo.

### 5. Minimum Size Subarray Sum  ·  Medium
Sum ≥ target wala **sabse chhota** subarray.
```js
function minSubArrayLen(target, nums) {
  let left = 0, sum = 0, best = Infinity;
  for (let right = 0; right < nums.length; right++) {
    sum += nums[right];
    while (sum >= target) {                     // valid hai — chhota karne ki koshish
      best = Math.min(best, right - left + 1);
      sum -= nums[left];
      left++;
    }
  }
  return best === Infinity ? 0 : best;
}
```

> **Longest vs Shortest ka farak — ye important hai:**
> - **Longest** chahiye → `while` window ko *valid banane* ke liye chalta hai, answer `while` ke **baad** update hota hai.
> - **Shortest** chahiye → `while` *jab tak valid hai* chalta hai, answer `while` ke **andar** update hota hai.

---

## Checklist

- [ ] "Subarray/substring + longest/shortest" sunte hi window ka khayal aaya
- [ ] Dono templates bina dekhe likh sakta hoon
- [ ] Window size `right - left + 1` likhta hoon — `+1` nahi bhoolta
- [ ] Longest aur shortest mein answer kahan update hota hai, ye pata hai
- [ ] Longest Substring Without Repeating bina dekhe aa jata hai

## Say this in the interview

> "Ye subarray wala sawaal hai aur longest chahiye, to main sliding window use karunga.
> Right pointer se window expand karunga, aur jab window invalid ho jayegi to left se
> shrink karunga jab tak valid na ho jaye. Har valid position pe answer update karunga.
> Har element ek baar andar aata hai aur ek baar bahar jaata hai, isliye **O(n) time**,
> aur window ka data store karne ke liye O(k) space."

---

## Mere solutions

<!-- Day 8-10 -->
