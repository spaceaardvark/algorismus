// --[ BASICS ]--

const len = (xs) => xs ? xs.length : 0;

function* range(start, end) {
  for (let i = start; i <= end; i++) {
    yield i;
  }
}

const isDef = (x) => x !== undefined;
const is0 = (i) => i === 0;
const is1 = (i) => i === 1;

// --[ 1-BASED ]--

const to0 = (i) => isDef(i) ? i - 1 : i;
const to1 = (i) => isDef(i) ? i + 1 : i;

const toA1 = (xs) =>
  new Proxy(xs, {
    get: (obj, prop) => {
      if (typeof prop === "string" && Number.isInteger(Number(prop))) {
        let i = Number(prop);
        return obj[i === -1 ? obj.length - 1 : to0(i)];
      } else {
        switch (prop) {
          case "slice":
            return a1Slice(obj);
          case "map":
            return a1Map(obj);
          case "reduce":
            return a1Reduce(obj);
          default:
            return obj[prop];
        }
      }
    },
    set: (obj, prop, value) => {
      if (typeof prop === "string" && Number.isInteger(Number(prop))) {
        return obj[to0(Number(prop))] = value;
      } else {
        return obj[prop] = value;
      }
    },
  });

const a1Slice = (obj) => (i, j) => toA1(
  obj.slice(to0(i), j)
);

const a1Map = (obj) => (fn) => toA1(
  obj.map((x, i, xs) => fn(x, to1(i), xs))
);

const a1Reduce = (obj) => (fn, initial) =>
  obj.reduce(
    (acc, x, i, xs) => fn(acc, x, to1(i), xs),
    initial,
  );

// --[ PREFIX SUMS ]--

const prefixSums = (xs) => {
  let sums, i, val;

  sums = toA1(new xs.constructor(xs.length));
  for (i of range(1, xs.length)) {
    val = xs[i] + (is1(i) ? 0 : sums[i - 1]);
    sums[i] = val;
  }

  return sums;
}

const sumRange = (sums, i, j) =>
  is1(i) ? sums[j] : sums[j] - sums[i - 1];

// --[ EXERCISE ]--

let xs = toA1([5,6,7,8]);
console.log(xs);

let sums = prefixSums(xs);
console.log(sums);
console.log(sumRange(sums, 1, xs.length));
console.log(sumRange(sums, 1, 2));
console.log(sumRange(sums, xs.length - 1, xs.length));
console.log(sumRange(sums, 2, 3));