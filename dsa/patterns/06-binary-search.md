# 06 — Binary Search

> **Kab pehchano:** input **sorted** hai → almost always binary search.
> Ya sawaal keh raha hai "minimum/maximum possible X dhoondho" → search on answer.
> **O(n) → O(log n).**
>
> ⚠️ Yahan galti logic mein nahi, **off-by-one** mein hoti hai. Template yaad karo.

---

## Template — ise ratna hai

```js
function binarySearch(nums, target) {
  let left = 0, right = nums.length - 1;      // right = LAST INDEX
  
  while (left <= right) {                      // <= zaroori hai
    const mid = Math.floor((left + right) / 2);
    
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) left = mid + 1;    // +1 — warna infinite loop
    else right = mid - 1;                      // -1
  }
  return -1;
}
```

### Teen cheezein jo bug deti hain

| Galti | Nateeja | Sahi |
|-------|---------|------|
| `while (left < right)` | Last element kabhi check nahi hota | `left <= right` |
| `left = mid` (bina +1) | **Infinite loop** | `left = mid + 1` |
| `(left + right) / 2` bina floor | Decimal index | `Math.floor(...)` |

> **Bada overflow wala jawab (bonus):** `mid = left + Math.floor((right - left) / 2)`.
> JS mein overflow practically nahi hota, par Java/C++ mein hota hai — ye bolna
> extra point deta hai.

---

## Variant — "First/Last occurrence" (duplicates hain)

Yahan `while (left < right)` use hota hai aur `return left`:

```js
// pehla index jahan condition true ho
function findFirst(nums, target) {
  let left = 0, right = nums.length - 1, ans = -1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) {
      ans = mid;
      right = mid - 1;         // mila, par aur left mein dhoondho
    } else if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return ans;
}
```
**Pattern:** mil gaya to record karo, par **rukna mat** — us taraf dhoondhte raho.

---

## Problems

### 1. Binary Search  ·  Easy
Seedha template. Pehle yahi likho.

### 2. Search Insert Position  ·  Easy
Nahi mila to kahan insert hota?
```js
function searchInsert(nums, target) {
  let left = 0, right = nums.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return left;      // loop khatam hone pe left hi insert position hai
}
```
**`return left`** — ye yaad rakhne wali baat hai.

### 3. Find Minimum in Rotated Sorted Array  ·  Medium
```js
function findMin(nums) {
  let left = 0, right = nums.length - 1;
  while (left < right) {                     // yahan < hai, <= nahi
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] > nums[right]) left = mid + 1;   // minimum right half mein hai
    else right = mid;                              // mid khud answer ho sakta hai
  }
  return nums[left];
}
```
**`nums[right]` se compare karo, `nums[left]` se nahi** — `left` se compare karne pe
duplicate edge cases toot jaate hain.

### 4. Search in Rotated Sorted Array  ·  Medium  ·  ⭐ *bohot poocha jaata hai*
```js
function search(nums, target) {
  let left = 0, right = nums.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;
    
    if (nums[left] <= nums[mid]) {          // left half sorted hai
      if (nums[left] <= target && target < nums[mid]) right = mid - 1;
      else left = mid + 1;
    } else {                                 // right half sorted hai
      if (nums[mid] < target && target <= nums[right]) left = mid + 1;
      else right = mid - 1;
    }
  }
  return -1;
}
```
**Core insight:** rotated array ko mid pe todo — **ek half hamesha sorted hoga.**
Pata karo kaunsa sorted hai, dekho target usmein hai ya nahi, us hisaab se jao.
Ye ek line interview mein bolni hai.

### 5. Koko Eating Bananas  ·  Medium  ·  *"search on answer"*
Answer khud pe binary search — array pe nahi. Ye advanced pattern hai, par concept
samajh lo: agar "minimum X jisse kaam ho jaye" poocha ho, to X ki range pe binary
search chalti hai.
```js
function minEatingSpeed(piles, h) {
  let left = 1, right = Math.max(...piles);
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    const hours = piles.reduce((sum, p) => sum + Math.ceil(p / mid), 0);
    if (hours <= h) right = mid;     // ye speed chal gayi, aur kam try karo
    else left = mid + 1;             // nahi chali, tez khao
  }
  return left;
}
```

---

## Checklist

- [ ] Basic template bina dekhe likh sakta hoon
- [ ] `left <= right` aur `mid + 1` / `mid - 1` yaad hai
- [ ] `Math.floor` lagana nahi bhoolta
- [ ] Rotated array wali "ek half hamesha sorted hai" insight yaad hai
- [ ] "Sorted" sunte hi O(log n) ka khayal aata hai

## Say this in the interview

> "Array sorted hai to main binary search use karunga — O(n) ki jagah O(log n).
> Left aur right pointer rakhunga, mid nikalunga, aur har step pe aadha search space
> hata dunga. Dhyaan rakhunga ki condition `left <= right` ho aur update `mid + 1`
> ya `mid - 1` ho — warna infinite loop ban jaata hai. Space O(1) rahega."

---

## Mere solutions

<!-- Day 15-16 -->
