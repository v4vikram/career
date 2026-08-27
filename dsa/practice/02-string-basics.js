function reverseWords(words){
  // words ko array mai convert kiya
  // while condition true hai jabtk, swap kiya
  // vapis  string mai convert & space remove kiya
  let arr = words.split(" ");
  let i=0;
  let j= words.length;

  while(i<j){
    [arr[i], arr[j]] = [arr[j], arr[i]];
    i++;
    j--;
  }
  
  return arr.join(" ").trim().replace(/\s+/g, " ")
  // console.log(arr)
}
// console.log(reverseWords("the sky   is blue"))

function firstUniqChar(s){
  // each letter ki frequency check ki
  // jo first letter 1 ke equal hai ushe return

  let freq =  {};

  for(let i=0; i<s.length; i++){
    freq[s[i]] = (freq[s[i]] || 0) + 1
  }

  for(let k=0; k<s.length; k++){

    if(freq[s[k]] === 1){
      return s[k]
    }
  }
  return -1
}
console.log(firstUniqChar("1leetcode"))

function removeDuplicateLetter(str){
  // check kiya seen mai ya nahi
  // nahi hai toh uski value true krdi
  // res mai add kr diya
  let seen = {};
  let res = "";

  for(let ch of str){
    if(!seen[ch]){
      seen[ch] = true;
      res += ch;
    }
  }
  return res
}
// console.log(removeDuplicateLetter("aabccdd"))

