# 10 — Stack, Queue & Trees

> **Kab pehchano:**
> - **Stack** → brackets/parentheses, "next greater element", undo, nesting
> - **Queue** → BFS, level-by-level kuch bhi
> - **Tree** → recursion natural fit hai
>
> 6 LPA pe trees ke sirf **basic traversals** aate hain. AVL/Red-Black nahi.

---

## Stack — JS mein bas array hai

```js
const stack = [];
stack.push(x);              // O(1)
stack.pop();                // O(1) — LIFO
stack[stack.length - 1];    // peek (top dekho, hatao mat)
stack.length === 0;         // khali hai?
```

### Valid Parentheses  ·  Easy  ·  ⭐ *guaranteed aata hai*
```js
function isValid(s) {
  const stack = [];
  const pairs = { ')': '(', ']': '[', '}': '{' };
  for (const ch of s) {
    if (ch === '(' || ch === '[' || ch === '{') {
      stack.push(ch);
    } else {
      if (stack.pop() !== pairs[ch]) return false;   // galat bracket band hua
    }
  }
  return stack.length === 0;    // ⚠️ khali hona zaroori hai
}
```
**`return stack.length === 0`** — sirf `true` return karna galat hai. `"((("` ke liye
loop poora chal jayega par stack khali nahi hoga. Ye edge case poocha jaata hai.

### Min Stack  ·  Medium
`getMin()` **O(1)** mein chahiye.
```js
class MinStack {
  constructor() { this.stack = []; this.mins = []; }
  push(val) {
    this.stack.push(val);
    const min = this.mins.length ? Math.min(val, this.mins[this.mins.length - 1]) : val;
    this.mins.push(min);                 // har level ka minimum saath store karo
  }
  pop()    { this.mins.pop(); return this.stack.pop(); }
  top()    { return this.stack[this.stack.length - 1]; }
  getMin() { return this.mins[this.mins.length - 1]; }
}
```
**Trick:** doosra stack jo har position ka minimum yaad rakhta hai. Space O(n),
par getMin O(1).

### Next Greater Element  ·  Medium  ·  *monotonic stack*
```js
function nextGreater(nums) {
  const res = new Array(nums.length).fill(-1);
  const stack = [];                    // indices store karta hai
  for (let i = 0; i < nums.length; i++) {
    while (stack.length && nums[stack[stack.length - 1]] < nums[i]) {
      res[stack.pop()] = nums[i];      // inka answer mil gaya
    }
    stack.push(i);
  }
  return res;
}
```
**O(n)** — har index ek baar push, ek baar pop hota hai.

---

## Queue — `shift()` mat use karna

```js
// ❌ O(n) per operation → poora BFS O(n²)
const node = queue.shift();

// ✅ pointer se — O(1)
const queue = [start];
let head = 0;
while (head < queue.length) {
  const node = queue[head++];
  // ... queue.push(children)
}
```
Ye **[Pattern 01](01-big-o-and-js-basics.md)** wala trap hai. BFS mein interviewer
specially dekhta hai.

---

## Trees

```js
class TreeNode {
  constructor(val = 0, left = null, right = null) {
    this.val = val; this.left = left; this.right = right;
  }
}
```

### DFS — recursion (depth mein jao)
```js
function dfs(node) {
  if (!node) return;              // base case — null check hamesha pehle
  // preorder:  yahan process karo (root → left → right)
  dfs(node.left);
  // inorder:   yahan process karo (left → root → right) — BST mein SORTED milta hai
  dfs(node.right);
  // postorder: yahan process karo (left → right → root)
}
```
**Inorder traversal of a BST gives sorted order** — ye ek line bohot poochi jaati hai.

### BFS — queue (level by level)
```js
function levelOrder(root) {
  if (!root) return [];
  const res = [], queue = [root];
  let head = 0;
  while (head < queue.length) {
    const levelSize = queue.length - head;      // is level mein kitne nodes
    const level = [];
    for (let i = 0; i < levelSize; i++) {
      const node = queue[head++];
      level.push(node.val);
      if (node.left)  queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    res.push(level);
  }
  return res;
}
```
**`levelSize` pehle capture karna** — loop ke andar queue badhti rehti hai.

### Maximum Depth  ·  Easy
```js
function maxDepth(root) {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}
```
Recursion kitna simple ho sakta hai — iska best example.

### Invert Binary Tree  ·  Easy
```js
function invertTree(root) {
  if (!root) return null;
  [root.left, root.right] = [invertTree(root.right), invertTree(root.left)];
  return root;
}
```

### Same Tree  ·  Easy
```js
function isSameTree(p, q) {
  if (!p && !q) return true;           // dono null
  if (!p || !q) return false;          // ek null
  return p.val === q.val && isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
}
```

### Validate BST  ·  Medium  ·  *classic trap*
```js
function isValidBST(root, min = -Infinity, max = Infinity) {
  if (!root) return true;
  if (root.val <= min || root.val >= max) return false;
  return isValidBST(root.left, min, root.val) &&    // left ke liye max update
         isValidBST(root.right, root.val, max);      // right ke liye min update
}
```
**Trap:** sirf `node.left.val < node.val` check karna **galat** hai. Poore subtree
ke liye range maintain karni padti hai. Ye exactly wo galti hai jo interviewer
dhoondhta hai.

---

## DFS ya BFS — kaunsa?

| Chahiye | Use | Kyun |
|---------|-----|------|
| Depth, height, path sum | **DFS** | Recursion natural hai |
| Level-by-level output | **BFS** | Queue level maintain karti hai |
| Shortest path (unweighted) | **BFS** | Pehla mila hi shortest hai |
| Space bachana, tree deep hai | BFS | DFS ka stack O(height) le lega |

---

## Checklist

- [ ] Valid Parentheses mein `stack.length === 0` return karta hoon
- [ ] BFS mein `shift()` nahi, pointer use karta hoon
- [ ] Tree recursion mein null check sabse pehle
- [ ] Inorder BST = sorted — yaad hai
- [ ] Validate BST mein min/max range pass karta hoon
- [ ] DFS vs BFS ka farak bol sakta hoon

## Say this in the interview

> "Ye tree ka sawaal hai aur level-by-level output chahiye, to main BFS use karunga
> queue ke saath. Har iteration mein current level ka size capture karunga, utne nodes
> process karunga, aur unke children queue mein daal dunga.
> **O(n) time** kyunki har node ek baar visit hota hai, aur **O(w) space** jahan w
> tree ki maximum width hai.
> JS mein main `shift()` avoid karunga — wo O(n) hai, isliye index pointer use karunga."

---

## Mere solutions

<!-- Day 24-26 -->
