import assert from "assert/strict";

// -------------------------------------------------------------------------------------

const lastIndexWhere = (pred, xs) => {
  if (xs === undefined || xs === null || xs.length === 0) return -1;
  if (!pred(xs[0])) return -1;
  if (pred(xs[xs.length-1])) return xs.length-1;

  let start, end, found, mid;

  start = 0;
  end = xs.length - 1;
  found = -1;

  while (start <= end) {
    mid = start + Math.ceil((end - start) / 2);
    if (pred(xs[mid])) {
      found = mid;
      start = mid + 1;
    } else {
      end = mid - 1;
    }
  }

  return found;
};

// -------------------------------------------------------------------------------------

const lessThan = (n) => (x) => x < n;

assert(lastIndexWhere(lessThan(10), [5,10,11]) === 0);
assert(lastIndexWhere(lessThan(10), [5,5,5]) === 2);
assert(lastIndexWhere(lessThan(10), [...(new Array(10000)).fill(5), ...(new Array(456)).fill(10)]) === 9999);

console.log("passed");