# 03 — Two Pointers

> **Kab pehchano:** array **sorted** hai, ya "pair/triplet dhoondho", ya "palindrome",
> ya "array ko in-place modify karo". Do pointers O(n²) ko O(n) bana dete hain —
> aur hash map se better, kyunki **space O(1)** rehta hai.

---

## Do variants — dono yaad karo

### Variant A — Opposite ends (converging)
Dono taraf se andar aate hain. **Sorted array** aur **palindrome** ke liye.

```js
let left = 0, right = arr.length - 1;
while (left < right) {
  if (/* condition */) left++;
  else right--;
}
```

### Variant B — Same direction (fast & slow)
Dono aage badhte hain, alag speed se. **In-place removal/filtering** ke liye.

```js
let slow = 0;
for (let fast = 0; fast < arr.length; fast++) {
  if (/* keep this element */) {
    arr[slow] = arr[fast];
    slow++;
  }
}
return slow;   // naya length
```

**Sochne ka tareeka:** `slow` batata hai "answer kahan tak bana", `fast` batata hai
"main kahan dekh raha hoon".

---

## Problems

### 1. Valid Palindrome  ·  Easy
Sirf alphanumeric dekhna hai, case ignore karna hai.
```js
function isPalindrome(s) {
  s = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  let l = 0, r = s.length - 1;
  while (l < r) {
    if (s[l] !== s[r]) return false;
    l++; r--;
  }
  return true;
}
```
> **Follow-up:** "extra space use kiye bina?" To regex mat use karo — loop ke andar
> hi non-alphanumeric skip karo. Tab **O(1) space** ho jayega.

### 2. Two Sum II — Input Array is Sorted  ·  Medium
Sorted hai, isliye hash map ki zaroorat hi nahi.
```js
function twoSum(numbers, target) {
  let l = 0, r = numbers.length - 1;
  while (l < r) {
    const sum = numbers[l] + numbers[r];
    if (sum === target) return [l + 1, r + 1];   // 1-indexed
    if (sum < target) l++;                       // aur bada chahiye
    else r--;                                    // aur chhota chahiye
  }
  return [];
}
```
**Ye Two Sum se better hai — O(1) space.** Interviewer ye farak sunna chahta hai:
*"array sorted hai isliye main two pointers use karunga, hash map ki zaroorat nahi,
space O(n) se O(1) ho jayega."*

### 3. Move Zeroes  ·  Easy
Saare zeroes end mein, baaki ka order same.
```js
function moveZeroes(nums) {
  let slow = 0;
  for (let fast = 0; fast < nums.length; fast++) {
    if (nums[fast] !== 0) {
      [nums[slow], nums[fast]] = [nums[fast], nums[slow]];
      slow++;
    }
  }
  return nums;
}
```
Variant B ka perfect example. **O(n) time, O(1) space.**

### 4. Container With Most Water  ·  Medium
Do lines ke beech max paani.
```js
function maxArea(height) {
  let l = 0, r = height.length - 1, best = 0;
  while (l < r) {
    best = Math.max(best, Math.min(height[l], height[r]) * (r - l));
    if (height[l] < height[r]) l++;   // chhoti wali hatao
    else r--;
  }
  return best;
}
```
**Kyun chhoti wali hatate hain:** width to har step pe kam ho hi rahi hai. Height
badhane ka ek hi mauka hai — chhoti line hatao. Badi hatate to area kabhi nahi badhta.
Ye reasoning bolna — yahi asli answer hai.

### 5. 3Sum  ·  Medium  ·  *bohot poocha jaata hai*
Teen numbers jinka sum 0 ho, duplicates ke bina.
```js
function threeSum(nums) {
  nums.sort((a, b) => a - b);        // sort zaroori hai
  const res = [];
  for (let i = 0; i < nums.length - 2; i++) {
    if (nums[i] > 0) break;                        // sorted hai, aage sab positive
    if (i > 0 && nums[i] === nums[i - 1]) continue; // duplicate skip
    let l = i + 1, r = nums.length - 1;
    while (l < r) {
      const sum = nums[i] + nums[l] + nums[r];
      if (sum < 0) l++;
      else if (sum > 0) r--;
      else {
        res.push([nums[i], nums[l], nums[r]]);
        while (l < r && nums[l] === nums[l + 1]) l++;   // duplicates skip
        while (l < r && nums[r] === nums[r - 1]) r--;
        l++; r--;
      }
    }
  }
  return res;
}
```
**Structure:** ek loop fix karta hai pehla number, andar Two Sum II chalta hai.
**O(n²) time** — aur yahi optimal hai, isliye ghabrana nahi.
**Duplicate handling hi asli difficulty hai** — teeno `skip` lines pe dhyaan do.

---

## Kaunsa use karun — Hash map ya Two pointers?

| Situation | Use |
|-----------|-----|
| Array **sorted** hai | Two pointers — O(1) space |
| Array unsorted, indices chahiye | Hash map — sort karne se indices badal jayenge |
| Sort karne ki permission hai, space bachana hai | Sort + two pointers → O(n log n) |
| In-place modify karna hai | Two pointers (fast/slow) |

---

## Checklist

- [ ] Dono templates bina dekhe likh sakta hoon
- [ ] "Sorted" sunte hi two pointers ka khayal aata hai
- [ ] `while (l < r)` likhta hoon, `l <= r` nahi (pair chahiye, khud se pair nahi)
- [ ] 3Sum mein duplicate skip karna yaad hai
- [ ] Bol pata hoon ki two pointers hash map se O(1) space kyun better hai

## Say this in the interview

> "Array sorted hai, to main two pointers use karunga — ek start se, ek end se.
> Sum target se chhota hai to left badhaunga, bada hai to right ghataunga. Isse
> O(n) time mein ho jayega aur hash map wale approach se better hai kyunki space
> O(n) ki jagah O(1) rahega."

---

## Mere solutions

<!-- Day 5-6 -->
