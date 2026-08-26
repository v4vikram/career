# 07 — Sorting

> **Kab pehchano:** "intervals", "k-th largest", "custom order mein sort karo",
> ya jab sort karne se problem aasan ho jaye (jaise 3Sum).
>
> ⚠️ **JS ka `.sort()` ek trap hai.** Ye pehla sawaal ban sakta hai.

---

## JS `.sort()` ka trap — ye zaroor pata hona chahiye

```js
[10, 9, 80, 1].sort();
// ❌ [1, 10, 80, 9]  ← ye galat lagta hai par sahi hai
```
**Kyun:** default `.sort()` har element ko **string** bana ke lexicographically sort
karta hai. `"10" < "9"` kyunki `"1" < "9"`.

```js
[10, 9, 80, 1].sort((a, b) => a - b);   // ✅ [1, 9, 10, 80]  ascending
[10, 9, 80, 1].sort((a, b) => b - a);   // ✅ [80, 10, 9, 1]  descending
```

**Numbers sort karte waqt comparator hamesha do.** Interview mein ye bhoolna
turant pakda jaata hai.

Do aur baatein:
- `.sort()` **in-place** hai — original array badal jaata hai. Bachana ho to `[...arr].sort()`.
- Modern JS mein `.sort()` **stable** hai — barabar elements ka order preserve rehta hai.

### Custom comparator
```js
arr.sort((a, b) => a.age - b.age);                    // number field
arr.sort((a, b) => a.name.localeCompare(b.name));     // string field
arr.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
//                 ↑ pehle score desc, tie ho to name asc
```

---

## Algorithms — theory jo poochi jaati hai

| Algorithm | Avg | Worst | Space | Stable |
|-----------|:---:|:-----:|:-----:|:------:|
| Bubble | O(n²) | O(n²) | O(1) | ✅ |
| Insertion | O(n²) | O(n²) | O(1) | ✅ |
| **Merge Sort** | O(n log n) | O(n log n) | **O(n)** | ✅ |
| **Quick Sort** | O(n log n) | **O(n²)** | O(log n) | ❌ |

**Do sawaal jo aate hain:**

**"Quick sort ka worst case kab hota hai?"**
Jab pivot hamesha sabse chhota ya sabse bada element chune — jaise already sorted
array mein pehla element pivot ho. Tab O(n²). **Random pivot** ya median-of-three
se bachte hain.

**"Merge sort better hai ya quick sort?"**
Quick sort practically tez hai (better cache locality, in-place). Merge sort
guaranteed O(n log n) deta hai aur stable hai, par O(n) extra space leta hai.
Linked list ke liye merge sort better hai.

### Merge sort ka code (likhne ko bola ja sakta hai)
```js
function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

function merge(a, b) {
  const out = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] <= b[j]) out.push(a[i++]);
    else out.push(b[j++]);
  }
  return [...out, ...a.slice(i), ...b.slice(j)];   // bacha hua add karo
}
```

---

## Problems

### 1. Sort Colors  ·  Medium  ·  *Dutch National Flag*
Sirf 0, 1, 2 hain. **One pass, O(1) space** — sort use kiye bina.
```js
function sortColors(nums) {
  let low = 0, mid = 0, high = nums.length - 1;
  while (mid <= high) {
    if (nums[mid] === 0) {
      [nums[low], nums[mid]] = [nums[mid], nums[low]];
      low++; mid++;
    } else if (nums[mid] === 1) {
      mid++;
    } else {                                    // 2 hai
      [nums[mid], nums[high]] = [nums[high], nums[mid]];
      high--;                                   // ⚠️ mid++ NAHI karna
    }
  }
  return nums;
}
```
**`high` wale case mein `mid++` nahi karte** — jo element swap hoke aaya hai wo abhi
check nahi hua. Ye exact bug interviewer dekhta hai.

### 2. Merge Intervals  ·  Medium  ·  ⭐ *bohot poocha jaata hai*
```js
function merge(intervals) {
  intervals.sort((a, b) => a[0] - b[0]);        // start ke hisaab se sort — ye step key hai
  const out = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const last = out[out.length - 1];
    if (intervals[i][0] <= last[1]) {           // overlap hai
      last[1] = Math.max(last[1], intervals[i][1]);
    } else {
      out.push(intervals[i]);
    }
  }
  return out;
}
```
**Sort kiye bina ye problem mushkil hai, sort ke baad trivial.** Yahi lesson hai.
**O(n log n)** — sorting hi dominate karti hai.

### 3. Meeting Rooms  ·  Easy
Saari meetings attend kar sakte ho?
```js
function canAttendMeetings(intervals) {
  intervals.sort((a, b) => a[0] - b[0]);
  for (let i = 1; i < intervals.length; i++) {
    if (intervals[i][0] < intervals[i - 1][1]) return false;   // overlap
  }
  return true;
}
```

### 4. Kth Largest Element  ·  Medium
```js
function findKthLargest(nums, k) {
  nums.sort((a, b) => b - a);
  return nums[k - 1];
}
```
**O(n log n).** Interviewer bole "better?" → *"min-heap of size k se O(n log k),
ya Quickselect se average O(n) ho sakta hai."* 6 LPA pe sort wala answer accept hota
hai, bas better option ka naam le dena.

---

## Checklist

- [ ] `.sort((a,b) => a-b)` — comparator kabhi nahi bhoolta
- [ ] Pata hai `.sort()` in-place hai
- [ ] Merge sort likh sakta hoon
- [ ] Quick sort ka worst case aur kyun, bata sakta hoon
- [ ] Interval problems mein **pehla step hamesha sort** hai
- [ ] Sort Colors mein `high` wale case pe `mid++` nahi karta

## Say this in the interview

> "Ye intervals ka sawaal hai, to main pehle start time ke hisaab se sort karunga —
> uske baad sirf ek pass mein consecutive intervals compare karke merge kar sakta
> hoon. **O(n log n)** hoga, sorting dominate karegi.
> JS mein ek dhyaan rakhta hoon — `.sort()` default mein strings ki tarah sort karta
> hai, to numbers ke liye comparator dena zaroori hai."

---

## Mere solutions

<!-- Day 17-18 -->
