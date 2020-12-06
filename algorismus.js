import assert from "assert/strict";

// PRIMITIVES

const identity = (x) => x;

// 0-BASED ARRAY

const len = (xs) => xs ? xs.length : 0;

const ith = (i, xs) => {
  let j = i % len(xs);
  if (j < 0) {
    j = len(xs) + j;
  }
  return xs[j];
};

const range = (from, toExclusive) =>
  [...Array(toExclusive - from)].map((_, i) => from + i);

// MATHARRAY

class MathArray {

  constructor(size, type) {
    let N, T;

    if (typeof size === "number") {
      N = size;
    } else if (typeof size === "function") {
      T = size;
    } else {
      N = 0;
    }

    if (typeof type === "function") {
      T = type;
    } else {
      T = Array;
    }

    this.A = new T(N);
  }

  static from(other) {
    let A;

    A = new MathArray();
    A.A = other;

    return A;
  }

  static range(start, endInclusive, type = Array) {
    let N, A, i;

    N = endInclusive - start + 1;
    A = new MathArray(len, type);

    for (i = 1; i <= N; i++) {
      A.set(i, i);
    }

    return A;
  }

  get(i) { return this.A[i - 1]; }
  set(i, value) { this.A[i - 1] = value; return this; }

  get T() { return this.A.constructor; }
  get N() { return this.A.length; }

  push(x) {
    this.A.push(x);
    return this;
  }

  slice(start, end) {
    let i, j;

    i = (typeof start === "undefined") ? 1 : start;
    j = (typeof end === "undefined") ? this.N : end;

    return MathArray.from(this.A.slice(start - 1, end));
  }

  mapOver(fn, start, end) {
    let N, mapped, i;

    N = end - start + 1;
    mapped = new this.A.constructor(N);

    for (i = 0; i < N; i++) {
      mapped[i] = fn(this.get(i + start), i + start, this);
    }

    return MathArray.from(mapped);
  }

  map(fn) {
    return this.mapOver(fn, 1, this.N);
  }

  reduceOver(fn, initial, start, end) {
    let N, acc, i;

    N = end - start + 1;
    acc = initial;
    for (i = 0; i < N; i++) {
      acc = fn(acc, this.get(i + start), i + start, this);
    }

    return acc;
  }

  reduce(fn, initial) {
    return this.reduceOver(fn, initial, 1, this.N);
  }

  forEach(fn) {
    let i;

    for (i = 0; i < this.N; i++) {
      fn(this.A[i], i + 1, this);
    }

    return this;
  }

  sort(fn = (a, b) => a - b) {
    return MathArray.from(this.A.slice().sort(fn));
  }

  native() {
    return this.A;
  }
};

// BITS

const allBits = (n) => Math.pow(2, n + 1) - 1;
const oneBit = (n) => Math.pow(2, n);

const lsb = (x) => x & -x;
const lsbIndex = (x) => Math.log2(lsb(x));

// MEMOIZE

const memoize = (fn) => {
  const cache = {};
  const slice = Array.prototype.slice;

  const clean = (a) =>
    (typeof a) === "object" ? JSON.stringify(a) : a;

  return (...args) => {
    const cleanedArgs = slice.call(args).map(clean);
    if (!(cleanedArgs in cache)) {
      cache[cleanedArgs] = fn.apply(this, args);
    }
    return cache[cleanedArgs];
  }
}

// SORTING

const sortNumerical = (xs) => xs.slice().sort((a, b) => a - b);
const sortAlphabetical = (xs) => xs.slice().sort();

// SEARCHING

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

  for (let i = start; i <= start + span; i++) {
    if (comp(i, xs) === 0) return i;
  }

  return -1;
};

// FENWICK/DIMA/CETERCHI BINOMIAL SEARCH TREES

class BinomialSearchTree {

  constructor(comparer, A) {
    this.comparer = comparer;
    this.A = A;
    this.B1 = new MathArray(A.length, A.type);
    this.B2 = new MathArray(A.length, A.type);

    this.A.forEach((_, i) => {
      let h, j, r1, r2;

      h = i - Math.pow(2, lsbIndex(i)) + 1;
      j = i + Math.pow(2, lsbIndex(i)) - 1;

      r1 = A.slice(h, i);
      r2 = A.slice(i, j);

      this.B1.set(i, comparer(...r1.native()));
      this.B2.set(i, comparer(...r2.native()));
    });
  }

  query(i, j) {
    if (i < 1 || i > j || j > this.A.N)
      return new Error("Query range must be in [1 <= i <= j <= N]");

    let ic, jc, next, values;

    ic = i;
    jc = j;

    values = new MathArray(0, this.A.type);

    while (ic <= j) {
      next = this._parentB1(ic);
      if (next > j) {
        values.push(this.A.get(ic));
      } else {
        values.push(this.B2.get(ic));
      }
      ic = next;
    }
    while (jc >= i) {
      next = this._parentB2(jc); 
      if (next < i) break;
      values.push(this.B1.get(jc));
      jc = next;
    }

    return this.comparer(...values.native());
  }

  _parentB1(i) {
    return i + Math.pow(2, lsbIndex(i));
  }

  _parentB2(i) {
    return i - Math.pow(2, lsbIndex(i));
  }
};

let tree = new BinomialSearchTree(
  Math.min,
  MathArray.from([1, 0, 2, 1, 1, 3, 0, 4, 2, 5, 2, 2, 3, 1, 0])
);

console.log(tree.query(5, 13));

process.exit(0);


// --[ END ]--

assert(len(null) === 0);
assert(len([]) === 0);
assert(len([1]) === 1);
assert(len(Array(50)) === 50);

assert(ith(0, []) === undefined);
assert(ith(0, [1]) === 1);
assert(ith(9, [1]) === 1);
assert(ith(9, [1, 2, 3]) === 1);

assert(ith(-1, []) === undefined);
assert(ith(-1, [1]) === 1);
assert(ith(-1, [1, 2, 3]) === 3);
assert(ith(-9, [1, 2, 3]) === 1);

assert(first([]) === undefined);
assert(first([9]) === 9);
assert(first([9, 8, 6]) === 9);

assert(last([]) === undefined);
assert(last([9]) === 9);
assert(last([9, 8, 6]) === 6);

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
assert(binarySearch(testComp, [99, 1]) === 0);
assert(binarySearch(testComp, [99, 1, 2, 3]) === 0);
assert(binarySearch(testComp, [1, 99]) === 1);
assert(binarySearch(testComp, [1, 2, 99]) === 2);
assert(binarySearch(testComp, [1, 2, 3, 99]) === 3);
assert(binarySearch(testComp, [1, 2, 3, 99, 101, 102, 103]) === 3);
assert(binarySearch(testComp, [1, 2, 3, 4, 99, 100]) === 4);
assert(binarySearch(testComp, [1, 99, 100, 101, 102, 103]) === 1);
assert(binarySearch(testComp, [1, 2, 3, 4, 99, 100]) === 4);
assert(binarySearch(testComp, [...range(50, 100_000)]) === 99 - 50);
assert(binarySearch(testComp, [99, ...range(100, 100_000)]) === 0);
assert(binarySearch(testComp, [...range(-100, 98), 99]) === 198);
assert(binarySearch(testComp, [...range(-100_000, 98)]) === -1);
assert(binarySearch(testComp, [...range(0, 4)]) === -1);

const fn = (a, b, c) => Math.random();
const fm = memoize(fn);
const argSets = [
  [1, 2, 3],
  [undefined, null, 0],
  [{ a: 1 }, { b: 2, c: { d: 3 } }, "hi there"],
];
for (let args of argSets) {
  const f1 = fm(...args);
  const f2 = fm(...args);
  const f3 = fm(...args);
  assert(f1 === f2 && f2 === f3);
}

console.log("All tests passed");