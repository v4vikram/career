# Basics — Array & String

> **Kis liye:** ye wo "normal" questions hain jo 6 LPA interviews mein — khaaskar
> service companies (TCS, Infosys, Wipro, Cognizant) aur chhoti product companies mein —
> LeetCode mediums se **zyada** poochhe jaate hain. Pehle round aur telephonic mein
> yahi aate hain.
>
> **Kab karo:** [ROADMAP.md](ROADMAP.md) shuru karne se **pehle**. 2-3 din, roz ~1 ghanta.
> Ye warm-up hai — inke baad patterns aasan lagenge.

**Rule:** har question ko **10 minute se zyada mat do.** Atko to approach column dekh lo,
**code khud likho.** Har solution ke baad complexity bolo.

---

## Array basics (12)

| # | Question | Approach | Time / Space | Done |
|---|----------|----------|:------------:|:----:|
| 1 | **Reverse array in-place** | Two pointers — `l=0, r=n-1`, swap, andar aao | O(n) / O(1) | [ ] |
| 2 | **Second largest element** | Ek pass, do variables — `largest`, `second`. **Sort mat karo** | O(n) / O(1) | [ ] |
| 3 | **Missing number (1 to n)** | Expected sum `n*(n+1)/2` − actual sum | O(n) / O(1) | [ ] |
| 4 | **Rotate array by k** | Poora reverse → pehle k reverse → baaki reverse | O(n) / O(1) | [ ] |
| 5 | **Remove duplicates from sorted array** | Fast-slow pointer — `arr[slow] = arr[fast]` jab alag ho | O(n) / O(1) | [ ] |
| 6 | **Merge two sorted arrays** | Do pointers, chhota uthate jao (Merge Sort ka merge) | O(n+m) | [ ] |
| 7 | **Max & min in one pass** | Ek loop, do variables — do alag loop mat chalao | O(n) / O(1) | [ ] |
| 8 | **Move negatives to one side** | Two pointers — Move Zeroes jaisa | O(n) / O(1) | [ ] |
| 9 | **Find duplicates in array** | Set mein daalte jao, pehle se hai to duplicate | O(n) / O(n) | [ ] |
| 10 | **Count occurrences of element** | Frequency map (`Map`) | O(n) / O(n) | [ ] |
| 11 | **Check array is sorted** | Ek loop — `arr[i] < arr[i-1]` mila to `false` | O(n) / O(1) | [ ] |
| 12 | **Leaders in array** | **Daaye se** chalo, ab tak ka max yaad rakho | O(n) / O(1) | [ ] |

**Sirf #4 aur #12 trick wale hain** — baaki 10 seedhe hain.

### Gotchas

**#2 Second largest** — `arr.sort()[n-2]` mat likhna. Wo O(n log n) hai aur duplicates
pe galat deta hai (`[5,5,3]` → second largest `3` hona chahiye, `5` nahi). Ek pass mein
`largest` aur `second` dono track karo, aur `arr[i] !== largest` check lagao.

**#4 Rotate by k** — `k` array se bada ho sakta hai. `k = k % n` pehle kar lo, warna
index out of range.

**#7 Max & min** — interviewer specially dekhta hai ki tumne **do alag loop to nahi
chalaye**. Ek hi loop mein dono nikaalo.

**#11 Check sorted** — poochho ki **ascending ya descending**, ya "dono chalega"?
Ye clarifying question achha impression banata hai.

**#12 Leaders** — leader = jiske **daaye taraf sab chhote** hain. Left se chaloge to
O(n²) ho jayega. **Right se chalo** — O(n) mein ho jata hai. Ye insight hi answer hai.

---

## String basics (10)

| # | Question | Approach | Time / Space | Done |
|---|----------|----------|:------------:|:----:|
| 1 | **Reverse words in a sentence** | `trim().split(/\s+/)` → two pointers ya `.reverse()` → join | O(n) | [ ] |
| 2 | **First non-repeating character** | Pass 1 frequency map, Pass 2 **string pe** loop | O(n) / O(n) | [ ] |
| 3 | **Remove duplicate characters** | Set se track karo, naya ho to push | O(n) / O(n) | [ ] |
| 4 | **Count vowels & consonants** | Ek loop, `'aeiou'.includes(ch)` — lowercase pehle | O(n) / O(1) | [ ] |
| 5 | **Two strings rotation hain?** | `s1.length === s2.length && (s1+s1).includes(s2)` | O(n) | [ ] |
| 6 | **Toggle case** | Har char — upper hai to lower, warna upper | O(n) | [ ] |
| 7 | **Capitalize each word** | `split(' ')` → har word ka `[0].toUpperCase() + slice(1)` → join | O(n) | [ ] |
| 8 | **Longest word in sentence** | `split(' ')` → loop, sabse lamba yaad rakho | O(n) | [ ] |
| 9 | **Remove extra spaces** | `trim().replace(/\s+/g, ' ')` | O(n) | [ ] |
| 10 | **Character frequency print** | Frequency map — [Pattern 02](patterns/02-arrays-and-hashing.md) ka 3-line template | O(n) / O(n) | [ ] |

**#5 sabse zyada poochha jaata hai** — `s1+s1` wali trick yaad rakho, bina uske log O(n²) likhte hain.

### Gotchas — ye padhe bina mat solve karna

**#1 Reverse words — `split(" ")` tootta hai.** Multiple spaces pe empty strings aa jaati hain:
```js
"Hi  i am".split(" ")   →   ["Hi", "", "i", "am"]    // beech mein "" aa gaya
```
Isliye **`trim().split(/\s+/)`** use karo. `\s+` matlab "ek ya zyada space".
Interviewer ka follow-up hamesha yahi hota hai: *"multiple spaces ho to?"*

**#2 First non-repeating — ye asli trap hai.** Frequency **object se** nikalo, par
**order string se** lo:
```js
// ❌ GALAT — Object.keys pe loop
for (let key of Object.keys(freq)) if (freq[key] === 1) return key;

// ✅ SAHI — original string pe loop
for (let ch of w) if (freq[ch] === 1) return ch;
return null;                       // sab repeat ho to explicit
```
**Kyun:** JS objects mein **integer-jaisi keys sabse pehle** aati hain, chahe baad mein
daali ho:
```js
Object.keys({a:1, v:2, "1":1})   →   ["1", "a", "v"]    // "1" aage aa gaya!
```
To `"avvkk1"` pe galat version `"1"` deta hai, jabki sahi answer `"a"` hai.
**Digit na ho to bug chhup jaata hai** — isiliye digit wale input se test karo.
> Ya `Map` use karo — usmein insertion order guaranteed hai, ye problem hoti hi nahi.

**#4 Vowels** — `'aeiou'.includes(ch)` se pehle `ch.toLowerCase()` karo, warna capital
`A` miss ho jayega.

**#5 Rotation** — length check **pehle** lagao. Bina uske `"abc"` aur `"ab"` pe galat
result aa sakta hai.

**#7 Capitalize** — khaali string aur double space handle karo, warna `word[0]` pe
`undefined` aa jayega.

---

## JS-specific (7) — MERN interview mein ye bahut aate hain

Ye "DSA" se zyada "JS coding round" wale hain, par array/string ke hi hain.

| # | Question | Approach | Done |
|---|----------|----------|:----:|
| 1 | **Flatten nested array** (bina `.flat()`) | Recursion — `Array.isArray(x)` ? recurse : push | [ ] |
| 2 | **Remove duplicates from array** | `[...new Set(arr)]` — aur Set-wala loop bhi likh ke dikhao | [ ] |
| 3 | **Chunk an array** | Loop with `i += size`, `slice(i, i+size)` | [ ] |
| 4 | **Group array of objects by key** | `reduce` — accumulator object mein key ke andar push | [ ] |
| 5 | **Sum using `reduce`** | `arr.reduce((a, b) => a + b, 0)` — initial value **zaroori** hai | [ ] |
| 6 | **Sort array of objects** | `arr.sort((a, b) => a.age - b.age)` — strings ke liye `localeCompare` | [ ] |
| 7 | **Find max bina `Math.max`** | Ek loop, `max` variable — `arr[0]` se initialise karo, `0` se nahi | [ ] |

**#5 mein initial value `0` chhodna** khaali array pe `TypeError` deta hai. Hamesha do.
**#7 mein `max = 0`** saare negative numbers pe galat answer deta hai — `arr[0]` se shuru karo.
(Yahi galti [Kadane's](patterns/02-arrays-and-hashing.md) mein bhi hoti hai.)

---

## Kaise nipatao

- **2-3 din**, roz ~1 ghanta — 8-10 questions per din
- Har question **10 minute max**. Atko to approach dekh lo, code khud likho
- Har solution ke baad **complexity bolo** — yahi aadat interview mein bachati hai
- **Har solution ko 3 edge case se test karo:** khaali input, sab same, aur ek weird
  input (digit ya extra space wala). #2 ka bug isi tarah pakda jaata hai
- Ye 29 nipatne ke baad seedhe **[ROADMAP.md](ROADMAP.md) Day 1**

> In mein se 6-7 ka logic patterns mein already hai (two pointers, frequency map),
> to ye warm-up jaisa lagega — extra bojh nahi.

---

## Mere solutions

<!-- Yahan apne solutions likhna. Jo atka, uska reason bhi likhna — wahi revision ke kaam aata hai. -->
