import assert from "assert/strict";

// -------------------------------------------------------------------------------------

const firstIndexWhere = (pred, xs) => {
  if (xs === undefined || xs === null || xs.length === 0) return -1;
  if (pred(xs[0])) return 0;
  if (!pred(xs[xs.length-1])) return -1;

  let start, end, found, mid;

  start = 0;
  end = xs.length - 1;
  found = -1;

  while (start <= end) {
    mid = start + Math.floor((end - start) / 2);
    if (pred(xs[mid])) {
      found = mid;
      end = mid - 1;
    } else {
      start = mid + 1;
    }
  }

  return found;
};

// -------------------------------------------------------------------------------------

const greaterThan = (n) => (x) => x > n;

assert(firstIndexWhere(greaterThan(10), [5,5,11]) === 2);
assert(firstIndexWhere(greaterThan(10), [11,11,13]) === 0);
assert(firstIndexWhere(greaterThan(10), [...(new Array(10000)).fill(5), ...(new Array(456)).fill(11)]) === 10000);

console.log("passed");