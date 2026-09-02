function secondLargest(arr) {

    let i = 0;
    let largest = -Infinity
    let secondLargest = -Infinity

    while (arr.length > i) {
        if (arr[i] > largest) {
            secondLargest = largest
            largest = arr[i]
        }

        else if (arr[i] < largest && arr[i] > secondLargest) {
            secondLargest = arr[i]
        }
        i++
    }
    return secondLargest
}
// console.log(secondLargest([9, 8, 7]))

function removeDuplicates(arr) {
    let count = 0;
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] != arr[i + 1]) {
            count++;
            arr[count] = arr[i + 1]
        }
    }
    arr.length = count + 1
    return arr
}
// console.log(removeDuplicates([1,2,2,3,3,4,4,5,5]))

function removeElm(arr, val) {
    let x = 0;

    for (let i = 0; i < arr.length; i++) {
        if (arr[i] != val) {
            arr[x] = arr[i]
            x++
        }
    }

    arr.length = x;
    return arr;
}
// console.log(removeElm([1,2,2,3,3,4,4,5,5], 3))

function reverseString(arr) {
    let i = 0;
    let j = arr.length - 1;

    while (i < j) {
        let temp = "";

        temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
        i++;
        j--;
    }
    return arr
}
// console.log(reverseString(["v", "i", "k", "r", "a", "m"]))

function buyAndSell(arr) {
    let min = arr[0];
    let max = 0;
    let buy = 0;
    let sell = 0

    for (let i = 0; i < arr.length; i++) {
        if (arr[i] < min) {
            buy = i
            min = arr[i]
        }

        if (buy < i) {
            if (arr[i] > max) {
                // console.log(i)

                sell = i
                max = arr[i]
            }
        }

    }
    // console.log("Buy at " + buy + " and sell at " + sell)
    return max - min
}
// console.log(buyAndSell([7, 1, 5, 3, 6, 4]))
// console.log(buyAndSell([7, 6, 4,3,1]))

function mergeTwoSorted(arr1, arr2) {
    let i = 0;
    let j = 0;
    let res = [];

    while (i < arr1?.length && j < arr2?.length) {
        if (arr1[i] <= arr2[j]) {
            res.push(arr1[i]);
            i++;
        } else {
            res.push(arr2[j]);
            j++;
        }

    }

    while (i < arr1.length) {
        res.push(arr1[i])
        i++
    }
    while (j < arr2.length) {
        res.push(arr2[j])
        j++
    }
    // console.log({
    //     i,
    //     j,
    //     a: arr1[i],
    //     b: arr2[j],
    //     res
    // })
    return res
}
// console.log(mergeTwoSorted([1, 5, 6, 7], [3, 6, 7, 9]))

// function sqaureSortedArray(arr) {
//     const arr1 = [];
//     const arr2 = [];

//     for(let i=0; i<arr.length; i++){
//         arr[i] = arr[i]* arr[i]

//     }

//     // for (let i = 0; i < arr.length; i++) {
//     //     if (arr[i] >= 0) {
//     //         arr1.push(arr[i])
//     //     }
//     //     else {
//     //         arr2.push(arr[i])
//     //     }
//     // }

//     // for (let j = 0; j < arr2.length; j++) {
//     //     arr2[j] = arr2[j] * arr2[j]
//     // }

//     // for (let k = 0; k < arr1.length; k++) {
//     //     arr1[k] = arr1[k] * arr1[k]
//     // }
//     // arr2.sort()
//     console.log(arr.sort((a, b) => {
//         console.log("a", a, "b", b)
//         // return a - b
//     }))

// }
// console.log(sqaureSortedArray([-4, -1, 0, 3, 10]))

// function twoSum(arr, target) {
//     let j = arr.length - 1;
//     let i = 0;
//     let sum = 0;
//     while (i < j) {
//         sum = arr[i] + arr[j];
//         if (sum == target) {
//             return [arr[i], arr[j]]
//         }
//         else if (sum > target) {
//             j--
//         }
//         else if (sum < target) {
//             i++
//         }


//     }
//     return -1
// }

function twoSum(nums, target) {
  const seen = new Map();    

  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
                // 21 - 2 = 19  
   
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);             
  }
 
  return [];
}

console.log(twoSum([2, 3, 5, 7, 8, 9], 21))

function moveZeros(arr) {
    let pos = 0;
    let i = 0;
    let temp;


    while (i < arr.length) {
        if (arr[i] != 0) {
            temp = arr[pos];
            arr[pos] = arr[i]
            arr[i] = temp;
            pos++
        }
        i++
    }
    return arr
}
// console.log(moveZeros([0, 1, 2, 0, 4, 0, 5]))

// 1st
// pos = 0;
// [1, 2, 4, 0, 0, 0, 5]



// function sumZeroes(arr){
//     let i=0;
//     let j=arr.length-1;
//     let k=Math.floor(arr.length-1 / 2);

//     while()

// }
// console.log(sumZeroes([-1,0,1,2,-1,-4]))

// [-1,0,1,2,-1,-4]
// [-4,-1,-1,0,1,2]
// -4, -1, 2

// for (var i = 1; i < 5; i++) {
//     // console.log(i) 
//     function close(i) {
//         setTimeout(() => {
//             console.log(i)
//         }, 2000)
//     } close(i)
// }


function containerWater(arr) {
    let i = 0;
    let j = i + 1
    let multi = 0;


    while (i < arr.length) {
        if (arr[i] < arr[j]) {
            for (let k = arr[i] - 1; k < arr[j]; k++) {
                console.log("k", k)
            }
        }
        i++;
        // multi = arr[i] + arr[j]
    }
}
// console.log(containerWater([1,8,6,2,5,4,8,3,7]))

function consecutiveOnes(arr) {

    let count = 0;
    let maxCount = 0
    for (let i = 0; i <= arr.length; i++) {
        if (arr[i] == 1) {
            count++
        }
        else {
            if (count > maxCount) {

                maxCount = count;
                count = 0;
            }
        }
    }


    return maxCount

}
// console.log(consecutiveOnes([1,1,0,1,1,1]))
// console.log(consecutiveOnes([1, 0, 1, 1, 0, 1]))

function missingNumber(arr) {
    // arr.sort()
    let n = arr.length

    // for (let i = 0; i < arr.length - 1; i++) {
    //     let temp;
    //     if(arr[i] > arr[i + 1]){
    //         temp = arr[i];
    //         arr[i] = arr[i+1]
    //         arr[i+1] = temp
    //     }
    //     if (arr[i + 1] - arr[i] != 1) {

    //         return arr[i] + 1
    //     }

    // }
    let sum = n * (n + 1) / 2;
    let pSum = 0;

    for (let i = 0; i < arr.length; i++) {
        pSum += arr[i]
    }
    return sum - pSum
    // console.log(pSum)

}
// console.log(missingNumber([3,0,1]))
// console.log(missingNumber([0,1,2,4,5]))
// console.log(missingNumber([9, 6, 4, 2, 3, 5, 7, 0, 1]))
// console.log(missingNumber([6, 9, 4, 2, 3, 5, 7, 0, 1]))
// console.log(missingNumber([6, 9, 4, 2, 3, 5, 7, 0, 1]))

// [0,1,2,3]

// var maxArea = function (height) {
//     // height.sort()
//     let l = 0;
//     let r = height.length - 1
//     let maxWater = 0;
//     let currentWidth = 0;
//     let smallerHeight = 0;
//     let currentWater = 0;




//     while (l < r) {
//         currentWidth = r - l;
//         smallerHeight = Math.min(height[l], height[r])
//         currentWater = smallerHeight * currentWidth

//         if (currentWater > maxWater) {
//             maxWater = currentWater
//         }

//         if (height[l] < height[r]) {
//             l++;
//         } else {
//             r--;
//         }

//     }
//     console.log(maxWater)
// };

// console.log(maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7]))

var runningSum = function (nums) {
    let prefix = [nums[0]]
    let prefixSum = nums[0]

    for (let i = 0; i < nums.length - 1; i++) {

        prefixSum = prefixSum + nums[i + 1]
        prefix.push(prefixSum)

    }
    return prefix
};
// console.log(runningSum([3,1,2,10,1]))
// [3,4,6,16,17]


/**
 * @param {number[]} nums
 */
var NumArray = function(nums) {
    
};

/** 
 * @param {number} left 
 * @param {number} right
 * @return {number}
 */
NumArray.prototype.sumRange = function(left, right) {
    
};

/** 
 * Your NumArray object will be instantiated and called as such:
 * var obj = new NumArray(nums)
 * var param_1 = obj.sumRange(left,right)
 */