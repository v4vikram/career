# 05 — Strings

> **Kab pehchano:** anagram, palindrome, reverse, character frequency, prefix/suffix.
> Zyadatar string problems asal mein **hashing (02)** ya **two pointers (03)** hi hain —
> bas input string hai. Ye file JS ki string-specific traps pe focus karti hai.

---

## JS strings — do cheezein jo interview mein pakadti hain

### 1. Strings immutable hain
```js
let s = "hello";
s[0] = "H";        // kuch nahi hota, error bhi nahi
console.log(s);    // "hello"
```
Modify karna hai to **array mein convert karo**:
```js
const arr = s.split('');
arr[0] = 'H';
s = arr.join('');   // "Hello"
```
**Isi liye:** loop mein `result += char` karna **O(n²)** hai — har baar nayi string
banti hai. Array mein `push` karo, phir `join('')` — wo **O(n)** hai.

```js
// ❌ O(n²)
let out = '';
for (const c of s) out += c;

// ✅ O(n)
const parts = [];
for (const c of s) parts.push(c);
const out = parts.join('');
```

### 2. `slice` vs `substring` vs `splice`
| Method | Kya karta hai | Negative index? |
|--------|---------------|:---------------:|
| `slice(a, b)` | Portion nikalta hai | ✅ `slice(-3)` = last 3 |
| `substring(a, b)` | Portion nikalta hai | ❌ negative → 0 ban jaata hai |
| `splice()` | **Sirf arrays pe**, original modify karta hai | ✅ |

**`slice` use karo.** `substring` argument swap kar deta hai agar `a > b` — confusing hai.

---

## Kaam ke methods

```js
s.toLowerCase()              // case-insensitive comparison
s.split('')                  // array of chars
[...s]                       // ✅ better — emoji/unicode safe
s.split('').reverse().join('')   // reverse
s.replace(/[^a-z0-9]/gi, '')     // sirf alphanumeric rakho
s.charCodeAt(0)              // 'a' → 97
String.fromCharCode(97)      // 97 → 'a'
s.trim()                     // aage-peeche ki space hatao
s.includes('ab')             // O(n·m)
s.startsWith / endsWith
```

**Character ko index mein badalna** (26 size ke array ke liye):
```js
const idx = ch.charCodeAt(0) - 'a'.charCodeAt(0);   // 'a'→0, 'b'→1 ... 'z'→25
```

---

## Problems

### 1. Reverse String  ·  Easy  ·  *in-place karna hai*
```js
function reverseString(s) {     // s ek char array hai
  let l = 0, r = s.length - 1;
  while (l < r) {
    [s[l], s[r]] = [s[r], s[l]];
    l++; r--;
  }
  return s;
}
```
`.reverse()` bhi chalega, par interviewer **two pointers wala** dekhna chahta hai.

### 2. Valid Anagram  ·  Easy
→ [Pattern 02](02-arrays-and-hashing.md) mein poora solution hai. Frequency map.

### 3. Valid Palindrome II  ·  Easy  ·  *ek character hata sakte ho*
```js
function validPalindrome(s) {
  const check = (l, r) => {
    while (l < r) {
      if (s[l] !== s[r]) return false;
      l++; r--;
    }
    return true;
  };
  let l = 0, r = s.length - 1;
  while (l < r) {
    if (s[l] !== s[r]) {
      // ya to left wala hatao, ya right wala — dono try karo
      return check(l + 1, r) || check(l, r - 1);
    }
    l++; r--;
  }
  return true;
}
```
**Mismatch pe do hi options hote hain** — ye insight interviewer sunna chahta hai.

### 4. Longest Common Prefix  ·  Easy
```js
function longestCommonPrefix(strs) {
  if (!strs.length) return '';
  let prefix = strs[0];
  for (const s of strs) {
    while (!s.startsWith(prefix)) {
      prefix = prefix.slice(0, -1);      // ek character chhota karo
      if (!prefix) return '';
    }
  }
  return prefix;
}
```

### 5. Isomorphic Strings  ·  Easy
`"egg"` aur `"add"` → true. Har character ka consistent mapping ho.
```js
function isIsomorphic(s, t) {
  if (s.length !== t.length) return false;
  const mapST = new Map(), mapTS = new Map();
  for (let i = 0; i < s.length; i++) {
    const a = s[i], b = t[i];
    if (mapST.has(a) && mapST.get(a) !== b) return false;
    if (mapTS.has(b) && mapTS.get(b) !== a) return false;
    mapST.set(a, b);
    mapTS.set(b, a);
  }
  return true;
}
```
**Dono taraf ka map chahiye.** Sirf ek se `"badc"` / `"baba"` galat pass ho jayega.
Ye exactly wo edge case hai jo interviewer test karta hai.

### 6. String Compression  ·  Medium
`"aabcccccaaa"` → `"a2b1c5a3"`
```js
function compress(s) {
  const out = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    let count = 0;
    while (i < s.length && s[i] === ch) { count++; i++; }
    out.push(ch, count);
  }
  const result = out.join('');
  return result.length < s.length ? result : s;   // choti wali lautao
}
```

---

## Checklist

- [ ] Pata hai strings immutable hain, aur `+=` loop mein O(n²) hai
- [ ] Array mein push karke `join('')` karta hoon
- [ ] `charCodeAt` se index nikalna aata hai
- [ ] Isomorphic mein **dono** maps banata hoon
- [ ] Length check pehle karta hoon — free early return hai

## Say this in the interview

> "String problems mein main pehle length check karta hoon — wo free early return deta
> hai. Phir character frequency chahiye to hash map banata hoon, aur palindrome jaisa
> kuch ho to two pointers. JS mein ek dhyaan rakhta hoon — strings immutable hain,
> to loop ke andar concatenate karne se O(n²) ho jaata hai. Isliye main array mein
> push karke aakhir mein join karta hoon, jo O(n) hai."

---

## Mere solutions

<!-- Day 11-13 -->
