// ═══ Array Basics (12) ═══  chalao:  node dsa/practice/01-array-basics.js
// List + approach:  ../basics-array-string.md
// Har function bharo. ✅ = sahi, ❌ = galat. Comment karne ki zaroorat nahi.

const t = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(ok ? "✅" : "❌", name,
    ok ? "" : `\n     mila:    ${JSON.stringify(got)}\n     chahiye: ${JSON.stringify(want)}`);
};

// ── 1. Reverse array in-place ──  two pointers: l=0, r=n-1, swap, andar aao
function reverseArray(arr) {
  // TODO
}
t("1. reverseArray", reverseArray([1, 2, 3, 4]), [4, 3, 2, 1]);
t("1. reverseArray (odd)", reverseArray([1, 2, 3]), [3, 2, 1]);
t("1. reverseArray (single)", reverseArray([1]), [1]);

// ── 2. Second largest ──  ek pass, do variables. sort MAT karo. duplicates dhyaan se
function secondLargest(arr) {
  // TODO
}
t("2. secondLargest", secondLargest([12, 35, 1, 10, 34, 1]), 34);
t("2. secondLargest (duplicates)", secondLargest([5, 5, 3]), 3);
t("2. secondLargest (sab same)", secondLargest([7, 7, 7]), null);

// ── 3. Missing number (1 to n) ──  n*(n+1)/2 − actual sum
function missingNumber(arr, n) {
  // TODO
}
t("3. missingNumber", missingNumber([1, 2, 4, 5], 5), 3);
t("3. missingNumber (last)", missingNumber([1, 2, 3], 4), 4);

// ── 4. Rotate array by k ──  k = k % n pehle! phir poora reverse → k reverse → baaki reverse
function rotate(arr, k) {
  // TODO
}
t("4. rotate", rotate([1, 2, 3, 4, 5], 2), [4, 5, 1, 2, 3]);
t("4. rotate (k > n)", rotate([1, 2, 3], 4), [3, 1, 2]);
t("4. rotate (k = 0)", rotate([1, 2, 3], 0), [1, 2, 3]);

// ── 5. Remove duplicates from SORTED array ──  fast-slow pointer, naya length lautao
function removeDuplicates(arr) {
  // TODO
}
t("5. removeDuplicates", removeDuplicates([1, 1, 2, 2, 3]), 3);
t("5. removeDuplicates (sab same)", removeDuplicates([1, 1, 1]), 1);

// ── 6. Merge two sorted arrays ──  do pointers, chhota uthate jao
function mergeSorted(a, b) {
  // TODO
}
t("6. mergeSorted", mergeSorted([1, 3, 5], [2, 4, 6]), [1, 2, 3, 4, 5, 6]);
t("6. mergeSorted (ek khaali)", mergeSorted([], [1, 2]), [1, 2]);

// ── 7. Max & min in ONE pass ──  ek loop, do variables. do alag loop mat chalao
function maxMin(arr) {
  // TODO  → { max, min } lautao
}
t("7. maxMin", maxMin([3, 1, 9, 4]), { max: 9, min: 1 });
t("7. maxMin (negatives)", maxMin([-5, -1, -9]), { max: -1, min: -9 });

// ── 8. Move negatives to one side ──  two pointers, Move Zeroes jaisa
function moveNegatives(arr) {
  // TODO  → saare negatives left mein
}
t("8. moveNegatives", moveNegatives([1, -2, 3, -4]).slice(0, 2).every(x => x < 0), true);

// ── 9. Find duplicates ──  Set mein daalte jao, pehle se hai to duplicate
function findDuplicates(arr) {
  // TODO
}
t("9. findDuplicates", findDuplicates([1, 2, 2, 3, 3, 3]), [2, 3]);
t("9. findDuplicates (koi nahi)", findDuplicates([1, 2, 3]), []);

// ── 10. Count occurrences ──  frequency map
function countOccurrences(arr, target) {
  // TODO
}
t("10. countOccurrences", countOccurrences([1, 2, 2, 3, 2], 2), 3);
t("10. countOccurrences (hai hi nahi)", countOccurrences([1, 2], 9), 0);

// ── 11. Check sorted ──  ek loop, arr[i] < arr[i-1] mila to false
function isSorted(arr) {
  // TODO
}
t("11. isSorted", isSorted([1, 2, 3]), true);
t("11. isSorted (nahi)", isSorted([1, 3, 2]), false);
t("11. isSorted (khaali)", isSorted([]), true);

// ── 12. Leaders in array ──  DAAYE se chalo, ab tak ka max yaad rakho
function leaders(arr) {
  // TODO  → jiske daaye sab chhote
}
t("12. leaders", leaders([16, 17, 4, 3, 5, 2]), [17, 5, 2]);
t("12. leaders (descending)", leaders([5, 4, 3]), [5, 4, 3]);
