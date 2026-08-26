# 09 — Linked List

> **Kab pehchano:** sawaal mein linked list ho. Bas.
> **Reverse Linked List** aur **Detect Cycle** — ye do to guaranteed poochte hain.
>
> Yahan sirf teen techniques hain: **pointer reversal**, **fast & slow**, **dummy node**.

---

## Node ka structure

```js
class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
}
```

**Traverse karne ka basic loop:**
```js
let curr = head;
while (curr) {
  // curr.val use karo
  curr = curr.next;
}
```

---

## Technique 1 — Pointer reversal

### Reverse Linked List  ·  Easy  ·  ⭐ *ye guaranteed aata hai*
```js
function reverseList(head) {
  let prev = null, curr = head;
  while (curr) {
    const next = curr.next;   // 1. agla yaad rakho (warna kho jayega)
    curr.next = prev;         // 2. arrow ulta karo
    prev = curr;              // 3. prev aage
    curr = next;              // 4. curr aage
  }
  return prev;                // ⚠️ prev return karo, head nahi
}
```

**Ye 4 lines ratni hain.** Dry run `1 → 2 → 3`:
```
start:   prev=null  curr=1
step 1:  null ← 1   prev=1  curr=2
step 2:  null ← 1 ← 2   prev=2  curr=3
step 3:  null ← 1 ← 2 ← 3   prev=3  curr=null
return prev = 3   →   3 → 2 → 1 ✅
```

**Do galtiyan:** `next` save karna bhool jana (list kho jaati hai), aur `head`
return kar dena (jo ab last node hai).

**O(n) time, O(1) space.** Recursive bhi ho sakta hai par wo O(n) space leta hai —
ye farak bolna.

---

## Technique 2 — Fast & Slow pointers (Floyd's)

`slow` ek kadam, `fast` do kadam. Isse cycle aur middle dono milte hain.

### Middle of the Linked List  ·  Easy
```js
function middleNode(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {     // ⚠️ dono check karo
    slow = slow.next;
    fast = fast.next.next;
  }
  return slow;                     // fast end pe pahuncha, slow beech mein
}
```

### Linked List Cycle  ·  Easy  ·  ⭐
```js
function hasCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;   // mil gaye = cycle hai
  }
  return false;
}
```
**Kyun kaam karta hai:** cycle hai to fast, slow ko round maar ke pakad hi lega —
jaise circular track pe tez daudne wala. Cycle nahi hai to fast `null` pe pahunch jayega.
**O(n) time, O(1) space** — Set use karte to O(n) space lagta. Ye tradeoff bolna.

> `while (fast && fast.next)` — **dono** check zaroori hain. Sirf `fast` check karoge
> to `fast.next.next` pe crash hoga. Ye classic bug hai.

### Remove Nth Node From End  ·  Medium
```js
function removeNthFromEnd(head, n) {
  const dummy = new ListNode(0, head);
  let slow = dummy, fast = dummy;
  for (let i = 0; i <= n; i++) fast = fast.next;   // fast ko n+1 aage bhejo
  while (fast) { slow = slow.next; fast = fast.next; }
  slow.next = slow.next.next;                      // skip kar do
  return dummy.next;
}
```
**Gap banaye rakhne ka pattern** — fast ko n aage bhejo, phir dono saath chalao.
Jab fast end pe ho, slow exactly n peeche hoga.

---

## Technique 3 — Dummy node

Head badalne wale sawaalon mein `dummy` bana lo — tab "head hi delete ho gaya"
wala edge case handle karne ki zaroorat hi nahi padti.

```js
const dummy = new ListNode(0);
let tail = dummy;
// ... tail.next = ... karke list banao
return dummy.next;      // asli head
```

### Merge Two Sorted Lists  ·  Easy  ·  ⭐
```js
function mergeTwoLists(l1, l2) {
  const dummy = new ListNode(0);
  let tail = dummy;
  while (l1 && l2) {
    if (l1.val <= l2.val) { tail.next = l1; l1 = l1.next; }
    else                  { tail.next = l2; l2 = l2.next; }
    tail = tail.next;
  }
  tail.next = l1 || l2;     // jo bacha hua hai, jod do
  return dummy.next;
}
```
**`tail.next = l1 || l2`** — ye ek line saara leftover handle kar deti hai.

### Remove Linked List Elements  ·  Easy
```js
function removeElements(head, val) {
  const dummy = new ListNode(0, head);
  let curr = dummy;
  while (curr.next) {
    if (curr.next.val === val) curr.next = curr.next.next;  // skip
    else curr = curr.next;                                   // ⚠️ else mein hi aage badho
  }
  return dummy.next;
}
```
**Delete karne ke baad `curr` aage mat badhao** — consecutive duplicates chhoot jayenge.

---

## Checklist

- [ ] Reverse Linked List bina dekhe, 4 lines mein likh sakta hoon
- [ ] `prev` return karta hoon, `head` nahi
- [ ] `while (fast && fast.next)` — dono check karta hoon
- [ ] Head badalne wale sawaal mein dummy node use karta hoon
- [ ] Delete ke baad pointer aage nahi badhata
- [ ] Har solution mein O(1) space wala approach bolta hoon

## Say this in the interview

> "Main teen pointers rakhunga — prev, curr aur next. Har step pe pehle next ko save
> karunga taaki list kho na jaye, phir curr ka pointer prev ki taraf ghuma dunga, aur
> dono ko aage badha dunga. Aakhir mein prev hi naya head hoga.
> **O(n) time, O(1) space.** Recursive bhi kar sakta hoon par usmein call stack ki
> wajah se O(n) space lagega, isliye iterative better hai."

---

## Mere solutions

<!-- Day 22-23 -->
