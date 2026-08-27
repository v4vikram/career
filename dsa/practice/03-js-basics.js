// ═══ JS Basics (7) ═══  chalao:  node dsa/practice/03-js-basics.js
// MERN interview ke JS coding round wale. List: ../basics-array-string.md

const t = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(ok ? "✅" : "❌", name,
    ok ? "" : `\n     mila:    ${JSON.stringify(got)}\n     chahiye: ${JSON.stringify(want)}`);
};

// ── 1. Flatten nested array ──  BINA .flat() — recursion: Array.isArray(x) ? recurse : push
function flatten(arr) {
  // TODO
}
t("1. flatten", flatten([1, [2, [3, [4]]], 5]), [1, 2, 3, 4, 5]);
t("1. flatten (khaali andar)", flatten([1, [], [2]]), [1, 2]);

// ── 2. Remove duplicates from array ──  Set se, aur loop se bhi aana chahiye
function unique(arr) {
  // TODO
}
t("2. unique", unique([1, 2, 2, 3, 1]), [1, 2, 3]);
t("2. unique (strings)", unique(["a", "a", "b"]), ["a", "b"]);

// ── 3. Chunk an array ──  loop with i += size, slice(i, i+size)
function chunk(arr, size) {
  // TODO
}
t("3. chunk", chunk([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
t("3. chunk (exact)", chunk([1, 2, 3, 4], 2), [[1, 2], [3, 4]]);

// ── 4. Group array of objects by key ──  reduce, accumulator ke andar push
function groupBy(arr, key) {
  // TODO
}
t("4. groupBy",
  groupBy([{ n: "a", city: "DL" }, { n: "b", city: "MU" }, { n: "c", city: "DL" }], "city"),
  { DL: [{ n: "a", city: "DL" }, { n: "c", city: "DL" }], MU: [{ n: "b", city: "MU" }] });

// ── 5. Sum using reduce ──  initial value 0 ZAROORI hai (khaali array pe TypeError warna)
function sum(arr) {
  // TODO
}
t("5. sum", sum([1, 2, 3]), 6);
t("5. sum (khaali)", sum([]), 0);

// ── 6. Sort array of objects ──  (a,b) => a.age - b.age  ·  strings ke liye localeCompare
function sortByAge(arr) {
  // TODO
}
t("6. sortByAge",
  sortByAge([{ n: "a", age: 30 }, { n: "b", age: 20 }]),
  [{ n: "b", age: 20 }, { n: "a", age: 30 }]);

// ── 7. Find max bina Math.max ──  arr[0] se initialise karo, 0 se NAHI
function findMax(arr) {
  // TODO
}
t("7. findMax", findMax([3, 7, 2]), 7);
t("7. findMax (sab negative)", findMax([-5, -1, -9]), -1);
t("7. findMax (khaali)", findMax([]), null);
