import assert from "assert/strict";

// --[ START ]--

const len = (xs) => xs ? xs.length : 0;

const ith = (i, xs) => {
  let j = i % len(xs);
  if (j < 0) {
    j = len(xs) + j;
  }
  return xs[j];
};

const first = (xs) => ith(0, xs);
const last = (xs) => ith(-1, xs);

const iton = (i) => i + 1;
const ntoi = (n) => n - 1;  // hmm, what should ntoi(0) be? 0 or -1?

const range = (from, toExclusive) => 
  [...Array(toExclusive - from)].map((_, i) => from + i);

/**
 * Comparison function for binary search, receives the index being evaluated and the
 * entire array being searched.
 * 
 * @typedef {function(mid: number, xs: []): number} BinarySearchCompare
 * @returns {number} -1 if value is too low, 1 if it's too high, 0 if it's just right
 */

/**
 * Searches a sorted array using a comparison function.
 * 
 * @param {BinarySearchCompare} comp - comparison function
 * @param {[]]} xs - array to be searched
 */
const binarySearch = (comp, xs) => {
  if (xs === undefined || xs === null || xs.length === 0) return -1;

  if (comp(0, xs) === 0) return 0;
  if (comp(len(xs) - 1, xs) === 0) return len(xs) - 1;

  let start, end, span, mid, value;

  start = 0;
  end = len(xs);
  span = end - start;

  while (span > 5) {
    mid = start + Math.floor(span / 2);
    value = comp(mid, xs)
    if (value > 0) {
      end = mid - 1;
    } else if (value < 0) {
      start = mid + 1;
    } else {
      return mid;
    }
    span = end - start;
  }

  for (let i = start; i < start + span; i++) {
    if (comp(i, xs) === 0) return i;
  }

  return -1;
};

// --[ END ]--

assert(len(null) === 0);
assert(len([]) === 0);
assert(len([1]) === 1);
assert(len(Array(50)) === 50);

assert(ith(0, []) === undefined);
assert(ith(0, [1]) === 1);
assert(ith(9, [1]) === 1);
assert(ith(9, [1,2,3]) === 1);

assert(ith(-1, []) === undefined);
assert(ith(-1, [1]) === 1);
assert(ith(-1, [1,2,3]) === 3);
assert(ith(-9, [1,2,3]) === 1);

assert(first([]) === undefined);
assert(first([9]) === 9);
assert(first([9,8,6]) === 9);

assert(last([]) === undefined);
assert(last([9]) === 9);
assert(last([9,8,6]) === 6);

let r;
r = range(0, 0);
assert(len(r) === 0);
r = range(0, 10);
assert(len(r) === 10);
assert(first(r) === 0);
assert(last(r) === 9);
r = range(-10, 10);
assert(len(r) === 20);
assert(first(r) === -10);
assert(last(r) === 9);

assert(iton(0) === 1);
assert(iton(1) === 2);
assert(iton(-1) === 0);

assert(ntoi(1) === 0);
assert(ntoi(2) === 1);
assert(ntoi(0) === -1);

const testComp = (mid, xs) => xs[mid] - 99;  // looking for 99

assert(binarySearch(testComp, []) === -1);
assert(binarySearch(testComp, [99]) === 0);
assert(binarySearch(testComp, [99,1]) === 0);
assert(binarySearch(testComp, [99,1,2,3]) === 0);
assert(binarySearch(testComp, [1,99]) === 1);
assert(binarySearch(testComp, [1,2,99]) === 2);
assert(binarySearch(testComp, [1,2,3,99]) === 3);
assert(binarySearch(testComp, [1,2,3,99,101,102,103]) === 3);
assert(binarySearch(testComp, [1,2,3,4,99,100]) === 4);
assert(binarySearch(testComp, [1,99,100,101,102,103]) === 1);
assert(binarySearch(testComp, [1,2,3,4,99,100]) === 4);
assert(binarySearch(testComp, [...range(50, 100_000)]) === 99 - 50);
assert(binarySearch(testComp, [99, ...range(100, 100_000)]) === 0);
assert(binarySearch(testComp, [...range(-100, 98), 99]) === 198);
assert(binarySearch(testComp, [...range(-100_000, 98)]) === -1);
assert(binarySearch(testComp, [...range(0,4)]) === -1);

console.log("All tests passed");