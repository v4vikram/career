# DSA + JS — Rapid Fire Q&A

> Har jawab wo hai **jo actually bolna hai** — 2-3 line, ratta nahi.
> Recall day pe khud se poocho, cold. Jo atke us pe mark lagao.
>
> **Sabse neeche apne interview ke sawaal add karte jao** — wahi tumhara asli edge hai.

---

## Complexity (1-8)

**1. `arr.shift()` ki complexity kya hai?**
O(n). Pehla element hatane pe baaki saare ek jagah shift hote hain. Isi liye queue ke
liye main `shift()` avoid karta hoon aur index pointer use karta hoon — warna BFS O(n²) ho jaata hai.

**2. `push`/`pop` ki?**
Dono O(1). End se kaam karte hain, koi shifting nahi. Isi liye stack ke liye perfect hain.

**3. Do sequential loops = O(n²)?**
Nahi. Sequential loops jodte hain — O(n) + O(n) = O(n). O(n²) tab hota hai jab loop
**nested** ho.

**4. Loop ke andar `includes()` use karne se kya hota hai?**
`includes()` khud O(n) hai, to poora O(n²) ho jaata hai. Set use karo — `has()` O(1) hai.

**5. Space complexity mein input count hota hai?**
Nahi, sirf **extra** space count hota hai. Par recursion ka **call stack** count hota hai —
n-deep recursion O(n) space hai bhale koi array na banaya ho.

**6. O(n²) ko O(n) kaise banate ho?**
Usually **hash map** se (lookup O(1)) ya **two pointers** se (agar sorted hai).
Ye pehli cheez hai jo main try karta hoon.

**7. Map, Object aur Set mein farak?**
Object simple string keys ke liye. Map mein keys kisi bhi type ki ho sakti hain,
insertion order preserve rehta hai aur `.size` milta hai. Set sirf uniqueness ke liye.
Teeno mein lookup O(1).

**8. `[...new Set(arr)]` kya karta hai?**
Array se duplicates hata deta hai. O(n).

---

## Arrays & Hashing (9-15)

**9. Two Sum kaise solve karoge?**
Hash map mein value→index store karta jaunga. Har element pe `target - current`
dhoondhunga. Mil gaya to indices return. O(n) time, O(n) space.

**10. Two Sum mein map me add kab karte ho — check se pehle ya baad?**
**Baad mein.** Pehle add kar diya to element khud ke saath pair bana lega.

**11. Anagram check — sort ya hash map?**
Hash map **O(n)** hai, sort **O(n log n)**. Isliye hash map. Aur length check pehle
kar lo — free early return hai.

**12. Kadane's algorithm ek line mein?**
Har step pe decide karo — "yahan se naya subarray shuru karun ya pichle mein jodun?"
`current = Math.max(nums[i], current + nums[i])`.

**13. Kadane mein `maxSum = 0` se shuru kyun nahi karte?**
Saare numbers negative ho to answer 0 aa jayega, jo galat hai. `nums[0]` se initialise karo.

**14. Product of Array Except Self bina division ke?**
Do pass — pehle left se prefix products, phir right se suffix products multiply karo.
O(n) time, O(1) extra space.

**15. Top K Frequent — better than sorting?**
Sorting O(n log n) deti hai. Bucket sort se O(n) ho sakta hai, ya min-heap of size k
se O(n log k).

---

## Two Pointers & Sliding Window (16-24)

**16. Two pointers kab use karte ho?**
Jab array **sorted** ho, ya pair/triplet dhoondhna ho, ya palindrome ho, ya in-place
modify karna ho.

**17. Sorted array mein pair dhoondhne ke liye hash map ya two pointers?**
Two pointers — kyunki space **O(n) se O(1)** ho jaata hai. Hash map tabhi jab unsorted
ho aur original indices chahiye.

**18. Container With Most Water — chhoti line kyun hatate ho?**
Width to har step pe kam ho hi rahi hai, to area badhane ka ek hi tarika hai — height
badhao. Badi line hatane se area kabhi nahi badhega.

**19. Sliding window kab pehchante ho?**
"Subarray" ya "substring" + "longest/shortest/maximum/minimum".

**20. Window ka size kaise nikalte ho?**
`right - left + 1`. `+1` bhoolna sabse common bug hai.

**21. Longest aur shortest window mein farak?**
Longest → `while` window ko **valid banane** ke liye chalta hai, answer `while` ke **baad**
update hota hai. Shortest → `while` **jab tak valid hai** chalta hai, answer `while` ke
**andar** update hota hai.

**22. Sliding window O(n) kaise hai jab andar `while` loop hai?**
Har element **ek baar andar** aata hai aur **ek baar bahar** jaata hai — total 2n
operations, matlab O(n). Nested loop nahi hai.

**23. 3Sum mein duplicates kaise handle karte ho?**
Pehle sort karo. Phir outer loop mein same element skip karo, aur pair milne ke baad
dono pointers pe bhi duplicates skip karo.

**24. 3Sum ki complexity?**
O(n²). Ek loop pehla number fix karta hai, andar two-pointer O(n) chalta hai.
Sorting O(n log n) hai jo dominate nahi karti.

---

## Binary Search & Sorting (25-32)

**25. Binary search mein `left <= right` ya `left < right`?**
Standard search mein `left <= right` — warna last element kabhi check nahi hota.

**26. `left = mid` likhne se kya hota hai?**
**Infinite loop.** Hamesha `mid + 1` ya `mid - 1` karo.

**27. `Math.floor` kyun zaroori hai?**
Bina uske `mid` decimal aa jayega, jo valid index nahi hai.

**28. Rotated sorted array mein search ka core idea?**
Mid pe todne pe **ek half hamesha sorted hota hai.** Pata karo kaunsa, dekho target
usmein hai ya nahi, us hisaab se side choose karo.

**29. JS ka `.sort()` bina comparator ke kya karta hai?**
Elements ko **string** bana ke sort karta hai. `[10, 9]` galat order mein aa jaata hai.
Numbers ke liye hamesha `(a, b) => a - b` do.

**30. `.sort()` original array badalta hai?**
Haan, **in-place** hai. Bachana ho to `[...arr].sort()`.

**31. Quick sort ka worst case kab?**
Jab pivot hamesha sabse chhota/bada element ho — jaise already sorted array. Tab O(n²).
Random pivot se bachte hain.

**32. Merge sort vs Quick sort?**
Quick practically tez hai aur in-place. Merge guaranteed O(n log n) aur stable hai,
par O(n) extra space leta hai. Linked list ke liye merge better.

---

## Recursion & Backtracking (33-38)

**33. Recursion ke do hisse?**
Base case (kab rukna hai) aur recursive case (chhote problem pe bharosa karke apna
answer banao).

**34. Naive Fibonacci slow kyun hai?**
Same subproblems baar-baar compute hote hain — O(2ⁿ). Memoization se O(n).

**35. Backtracking mein `result.push(path)` galat kyun hai?**
Wo **reference** push karta hai. Baad mein `path.pop()` hone pe result bhi khali ho
jaata hai. Hamesha copy — `[...path]`.

**36. Subsets aur Permutations mein farak?**
Subsets mein `start` index use hota hai (order matter nahi karta). Permutations mein
`used[]` array (order matter karta hai, har element exactly ek baar).

**37. Combination Sum mein `backtrack(i)` ya `backtrack(i+1)`?**
`i` — kyunki same number dobara use kar sakte hain. `i+1` tab jab har element ek hi baar.

**38. Recursion ka space?**
Call stack ki depth. n-deep = O(n). Bohot deep ho to stack overflow ho sakta hai,
isliye iterative better hota hai.

---

## Linked List & Trees (39-46)

**39. Reverse Linked List ke 4 steps?**
`next` save karo → `curr.next = prev` → `prev = curr` → `curr = next`. Aakhir mein
**`prev` return karo, `head` nahi.**

**40. Cycle detect karne ka O(1) space wala tarika?**
Floyd's — slow ek kadam, fast do kadam. Mil gaye to cycle hai. Set use karte to
O(n) space lagta.

**41. `while (fast && fast.next)` mein dono check kyun?**
Sirf `fast` check karoge to `fast.next.next` pe crash hoga jab `fast.next` null ho.

**42. Dummy node kab use karte ho?**
Jab head khud badal sakta ho ya delete ho sakta ho. Dummy se wo edge case handle
karne ki zaroorat hi nahi padti.

**43. Middle node kaise nikalte ho?**
Fast & slow. Fast end pe pahunchega tab slow exactly beech mein hoga.

**44. BST ka inorder traversal kya deta hai?**
**Sorted order.** Ye ek line bohot poochi jaati hai.

**45. Validate BST mein sirf children compare karna kyun galat hai?**
Kyunki poore subtree ke liye range maintain karni padti hai. Ek node parent se to sahi
ho sakta hai par grandparent se galat. Min/max range pass karo.

**46. DFS ya BFS — kab kya?**
Depth/height/path sum → DFS (recursion natural). Level-by-level ya shortest path
(unweighted) → BFS (queue).

---

## Interview mein behaviour (47-50)

**47. Problem sunte hi sabse pehle kya karte ho?**
Clarify karta hoon — input range, duplicates ho sakte hain, sorted hai kya, empty
input pe kya return karna hai.

**48. Optimal solution nahi soojh raha to?**
**Brute force bolta hoon** aur uski complexity batata hoon. Phir loudly sochta hoon
ki kaunsa data structure isko better karega. Chup rehna sabse bura hai.

**49. Code likhne ke baad?**
Ek example pe **dry run** karta hoon, phir edge cases check karta hoon — empty array,
ek element, saare same, negative numbers.

**50. Complexity kab batate ho?**
**Bina poore.** Solution khatam hote hi time aur space dono bol deta hoon.

---

## Mere interviews ke sawaal

<!-- Har interview ke baad jo poocha gaya, yahan add karo — company ka naam bhi.
     Ye section 5 interview ke baad tumhara sabse valuable page ban jayega. -->

| Date | Company | Sawaal | Answer aaya? |
|------|---------|--------|:------------:|
| | | | |
