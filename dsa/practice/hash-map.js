function twoSum(arr, target) {
    let seen = new Map();
    // 0=3
    // 1=2
    // 2=1
    seen.set(1, 10)
    seen.set(2, 20)

console.log(seen.get(1))
    // for (let i = 0; i < arr.length; i++) {

    //     const need = target - arr[i]; // 5 - 4

    //     if (seen.has(need)) {
    //         return [seen.get[need], i]
    //     }
    //     seen.set(arr[i], i)
    // }
    // return []
    // console.log(seen)
}
console.log(twoSum([3, 2, 1, 4], 3))