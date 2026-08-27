// ═══ String Basics (10) ═══  chalao:  node dsa/practice/02-string-basics.js
// List + gotchas:  ../basics-array-string.md
// #1, #2, #3 tumne solve kar liye — wahi bhare hue hain. Baaki bharo.

const t = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(ok ? "✅" : "❌", name,
    ok ? "" : `\n     mila:    ${JSON.stringify(got)}\n     chahiye: ${JSON.stringify(want)}`);
};

// ── 1. Reverse words in a sentence ──  ✅ DONE (split(" ") → split(/\s+/) fix ke saath)
function reverseSent(s) {
  let arr = s.trim().split(/\s+/);        // \s+ = ek ya zyada space
  let i = 0, j = arr.length - 1;
  while (i < j) {
    [arr[i], arr[j]] = [arr[j], arr[i]];
    i++; j--;
  }
  return arr.join(" ");
}
t("1. reverseSent", reverseSent("Hi i am vikram"), "vikram am i Hi");
t("1. reverseSent (double space)", reverseSent("Hi  i am"), "am i Hi");
t("1. reverseSent (aage-peeche space)", reverseSent("  Hi i  "), "i Hi");

// ── 2. First non-repeating character ──  ✅ DONE (string pe loop, Object.keys pe nahi)
function nonRepChar(w) {
  let freq = {};
  for (let i = 0; i < w.length; i++) freq[w[i]] = (freq[w[i]] || 0) + 1;
  for (let ch of w) if (freq[ch] === 1) return ch;   // ← string pe loop
  return null;
}
t("2. nonRepChar", nonRepChar("vvkkiram"), "i");
t("2. nonRepChar (digit trap)", nonRepChar("avvkk1"), "a");
t("2. nonRepChar (sab repeat)", nonRepChar("aabb"), null);

// ── 3. Remove duplicate characters ──  ✅ DONE (pehla occurrence rakho)
function removeDuplicateChar(str) {
  let seen = {}, res = "";
  for (let ch of str) {
    if (!seen[ch]) { seen[ch] = true; res += ch; }
  }
  return res;
}
t("3. removeDuplicateChar", removeDuplicateChar("bcabcd"), "bcad");
t("3. removeDuplicateChar (order)", removeDuplicateChar("bcabc"), "bca");
t("3. removeDuplicateChar (khaali)", removeDuplicateChar(""), "");

// ── 4. Count vowels & consonants ──  toLowerCase() PEHLE, warna 'A' miss ho jayega
function countVowelsConsonants(s) {
  // TODO  → { vowels, consonants }  (sirf a-z ginno, space/digit nahi)
}
t("4. countVowels", countVowelsConsonants("Hello World"), { vowels: 3, consonants: 7 });
t("4. countVowels (caps)", countVowelsConsonants("AEIOU"), { vowels: 5, consonants: 0 });

// ── 5. Two strings rotation hain? ──  length check PEHLE, phir (s1+s1).includes(s2)
function isRotation(s1, s2) {
  // TODO
}
t("5. isRotation", isRotation("abcde", "cdeab"), true);
t("5. isRotation (nahi)", isRotation("abcde", "abced"), false);
t("5. isRotation (alag length)", isRotation("abc", "ab"), false);

// ── 6. Toggle case ──  upper hai to lower, warna upper
function toggleCase(s) {
  // TODO
}
t("6. toggleCase", toggleCase("Hello World"), "hELLO wORLD");
t("6. toggleCase (digits same)", toggleCase("aB1"), "Ab1");

// ── 7. Capitalize each word ──  khaali string / double space dhyaan se
function capitalizeWords(s) {
  // TODO
}
t("7. capitalizeWords", capitalizeWords("hi i am vikram"), "Hi I Am Vikram");
t("7. capitalizeWords (double space)", capitalizeWords("hi  there"), "Hi There");

// ── 8. Longest word ──  split → loop, sabse lamba yaad rakho
function longestWord(s) {
  // TODO
}
t("8. longestWord", longestWord("Hi i am vikram"), "vikram");
t("8. longestWord (tie → pehla)", longestWord("cat dog"), "cat");

// ── 9. Remove extra spaces ──  trim().replace(/\s+/g, ' ')
function removeExtraSpaces(s) {
  // TODO
}
t("9. removeExtraSpaces", removeExtraSpaces("  Hi   i  am  "), "Hi i am");

// ── 10. Character frequency ──  Pattern 02 ka 3-line template
function charFrequency(s) {
  // TODO  → { a: 2, b: 1 } jaisa object
}
t("10. charFrequency", charFrequency("aab"), { a: 2, b: 1 });
t("10. charFrequency (khaali)", charFrequency(""), {});
