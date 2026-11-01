import type { Extras } from "./types";

export const extras: Extras = {
  704: {
    time: { o: "O(log n)", why: "n = len(nums); every iteration ==halves the window `[l, r]`==, so at most about log₂ n + 1 checks." },
    space: { o: "O(1)", why: "Only the three indices `l`, `r` and `m`." },
    pitfalls: [
      "Looping with `while l < r` while also using `r = m - 1`: a one-element window is never checked, so `[5]` with target 5 returns -1.",
      "Writing `l = m` or `r = m` in this closed-interval version: when `l` and `r` are neighbours, `m` stays put and the loop never ends.",
      "Starting with `r = len(nums)` but then reading `nums[m]` with `<=` loop bounds: `m` can equal `len(nums)` and index out of range. Pick one interval style and keep it consistent.",
      "In Java/C++ `(l + r) / 2` can overflow for huge indices; write `l + (r - l) / 2`. Python ints don't overflow, but interviewers like hearing you know this.",
    ],
  },
  74: {
    time: { o: "O(log(m · n))", why: "m rows, n columns; one binary search over the ==flattened index range `0 .. m·n - 1`==." },
    space: { o: "O(1)", why: "Only `l`, `r`, `m` and the cell value `v`; the matrix is never actually flattened." },
    pitfalls: [
      "Mapping the index with `ROWS` instead of `COLS`: the cell is `(m // COLS, m % COLS)`. With a non-square matrix, using `ROWS` reads the wrong cell or goes out of range.",
      "Copying the matrix into one list first: correct, but O(m·n) time and space, which throws away the whole point of the binary search.",
      "Doing a linear scan over rows to pick the row, then a binary search: that's O(m + log n). Either binary search the rows too, or use the flat index.",
    ],
  },
  875: {
    time: { o: "O(n · log M)", why: "n = len(piles), M = max(piles); the speed range `[1, M]` takes ==about log M rounds==, and each round sums over every pile." },
    space: { o: "O(1)", why: "The generator inside `sum` keeps no list; only `l`, `r`, `k`, `res` and `hours`." },
    pitfalls: [
      "Using `p // k` instead of a ceiling: a pile of 7 at speed 3 needs 3 hours, not 2. Use `math.ceil(p / k)` or the integer trick `(p + k - 1) // k`.",
      "Starting the search at `l = 0`: speed 0 divides by zero. The smallest legal speed is 1.",
      "Setting `r = sum(piles)` or `h` instead of `max(piles)`: still correct but wastes iterations; no speed above the biggest pile can finish faster, since one pile takes at least an hour.",
      "With piles up to 10^9, `p / k` as a float can round; `(p + k - 1) // k` is exact and safe.",
    ],
  },
  153: {
    time: { o: "O(log n)", why: "n = len(nums); each step either moves `l` past `m` or pulls `r` down to `m`, ==shrinking the window by about half==." },
    space: { o: "O(1)", why: "Only the indices `l`, `r` and `m`." },
    pitfalls: [
      "Comparing `nums[m]` with `nums[l]` instead of `nums[r]`: when the array is not rotated at all (`[1, 2, 3]`), the left-end check sends you right and you miss the minimum at index 0.",
      "Writing `r = m - 1` in the else branch: `m` itself may be the minimum, so it must stay in the window as `r = m`.",
      "Using `while l <= r` together with `r = m`: when `l == r` nothing changes and the loop never ends. Use `l < r` and return `nums[l]`.",
    ],
  },
  33: {
    time: { o: "O(log n)", why: "n = len(nums); like plain binary search, each iteration ==discards one half==, it just needs two extra comparisons to pick which." },
    space: { o: "O(1)", why: "Only `l`, `r` and `m`." },
    pitfalls: [
      "Using `nums[l] < nums[m]` (strict) to detect the sorted left half: when `l == m` the left half is a single sorted element, so it must be `<=`, otherwise `[3, 1]` with target 1 is missed.",
      "Getting the range check boundaries wrong: in the left half use `nums[l] <= target < nums[m]`, in the right half `nums[m] < target <= nums[r]`. Including `m` is pointless because it was just checked.",
      "Finding the pivot first and then running a normal search is fine (still O(log n)), but juggling two searches doubles the places to make off-by-one mistakes.",
    ],
  },
  981: {
    time: { o: "O(1) set, O(log n) get", why: "`set` is a list `append`; `get` binary searches ==one key's history== (n = number of sets for that key)." },
    space: { o: "O(N)", why: "N = total number of `set` calls; every `(timestamp, value)` pair is stored once." },
    pitfalls: [
      "Using `self.store[key]` in `get` with a `defaultdict`: a lookup of a never-set key silently creates an empty list for it. Use `.get(key, [])` as the code does.",
      "Searching for an exact timestamp match: the query is usually between stored times, so keep the best `res` found while `items[m][0] <= timestamp` and keep going right.",
      "Sorting each key's list on every `set`: unnecessary because timestamps are strictly increasing, so appending already keeps it sorted.",
      "Returning `None` when nothing is early enough: the problem wants the empty string `\"\"`.",
    ],
  },
  4: {
    time: { o: "O(log(min(m, n)))", why: "m = len(A) is the shorter list; we binary search `i` in `[0, m]`, and ==each check is O(1)== because only four neighbours are compared." },
    space: { o: "O(1)", why: "Just the bounds and the four edge values; nothing is merged or copied." },
    pitfalls: [
      "Not swapping so that `A` is the shorter list: then `j = half - i` can go negative or past `len(B)`, and indexing breaks.",
      "Forgetting the ±infinity sentinels when `i` or `j` is 0 or the full length: `A[i - 1]` with `i = 0` silently reads the LAST element in Python instead of failing.",
      "Using `half = (m + n) // 2` but then taking `max(left)` as the median for odd totals: with that half the extra element sits on the right. Pick `(m + n + 1) // 2` so the left half holds the median.",
      "Merging both lists first is O(m + n): correct and fine to mention as a baseline, but the problem asks for logarithmic time.",
    ],
  },
};
