/**
 * binary-search: NeetCode 150 problems, written in Jamie's format (see arrays-hashing.ts).
 * Problems:
 * - 704 Binary Search (Easy)
 * - 74 Search a 2D Matrix (Medium)
 * - 875 Koko Eating Bananas (Medium)
 * - 153 Find Minimum in Rotated Sorted Array (Medium)
 * - 33 Search in Rotated Sorted Array (Medium)
 * - 981 Time Based Key-Value Store (Medium)
 * - 4 Median of Two Sorted Arrays (Hard)
 */
import type { Solution, Variation } from "../solutions";

const kv = (o: Record<string, string>) => Object.entries(o).map(([name, value]) => ({ name, value }));

export const variations: Variation[] = [
  {
    id: "classic",
    topic: "binary-search",
    name: "Classic search on sorted values",
    change: "Base pattern. Compare the middle with the target and ==throw away the half that can't contain it==. A sorted 2D matrix is the same thing with the index mapped to `(row, col)`.",
    problems: [704, 74],
  },
  {
    id: "answer-space",
    topic: "binary-search",
    name: "Binary search on the answer",
    change: "You don't search the input; you search ==the range of possible answers== (a speed, a capacity) with a yes/no check that flips once.",
    problems: [875],
  },
  {
    id: "rotated",
    topic: "binary-search",
    name: "Rotated sorted array",
    change: "The array is sorted then rotated, so ==one half is always sorted==. Work out which half, then decide where the target or the minimum must be.",
    problems: [153, 33],
  },
  {
    id: "last-at-most",
    topic: "binary-search",
    name: "Last value ≤ the query",
    change: "No exact match needed: ==remember the best candidate so far== (the latest timestamp not after the query) and keep searching to the right.",
    problems: [981],
  },
  {
    id: "partition",
    topic: "binary-search",
    name: "Binary search a partition",
    change: "Search for ==how many items to take from the smaller array== so the two left parts together form the lower half of the merged list.",
    problems: [4],
  },
];

export const solutions: Solution[] = [
  {
    lc: 704,
    variation: "classic",
    question: "Given a sorted list of distinct integers and a target, return the target's index or -1, in O(log n).",
    intuition: `Look at the middle. If it's too small, the target ==can only be to its right==, so the whole left half is gone in one step; too big, drop the right half. Halving each time gives O(log n). Use \`l <= r\` so a range of one element is still checked.`,
    algorithm: `1. Set \`l = 0\`, \`r = len(nums) - 1\`.
2. While ==\`l <= r\`==:
   * \`m = (l + r) // 2\`.
   * If \`nums[m] == target\`, return \`m\`.
   * If \`nums[m] < target\`, ==\`l = m + 1\`==.
   * Else \`r = m - 1\`.
3. Return \`-1\`.`,
    visual: {
      kind: "array",
      title: "Binary search · target 9",
      values: [-1, 0, 3, 5, 9, 12],
      frames: [
        { caption: "l=0, r=5 → m=2. 3 < 9 → the target is to the right.", pointers: [{ name: "l", index: 0 }, { name: "m", index: 2 }, { name: "r", index: 5 }], range: [0, 5], highlight: [2] },
        { caption: "Drop the left half: l = 3. Now m=4.", pointers: [{ name: "l", index: 3 }, { name: "m", index: 4 }, { name: "r", index: 5 }], range: [3, 5], highlight: [4], done: [0, 1, 2] },
        { caption: "nums[4] = 9 → found. Return 4.", pointers: [{ name: "m", index: 4 }], highlight: [4], done: [0, 1, 2], vars: kv({ answer: "4" }) },
      ],
    },
    code: `def search(nums: list[int], target: int) -> int:
    l, r = 0, len(nums) - 1
    while l <= r:
        m = (l + r) // 2
        if nums[m] == target:
            return m
        if nums[m] < target:
            l = m + 1
        else:
            r = m - 1
    return -1`,
    complexity: "Time O(log n) · Space O(1)",
  },
  {
    lc: 74,
    variation: "classic",
    question: "Given a matrix whose rows are sorted and each row starts after the previous one ends, say whether a target is in it.",
    intuition: `Read row by row, the matrix is ==one long sorted list== of \`rows × cols\` values. So binary search an index \`m\` from 0 to \`rows × cols - 1\` and turn it into a cell with ==\`(m // cols, m % cols)\`==. One search, O(log(m·n)).`,
    algorithm: `1. Let \`ROWS, COLS\` be the sizes. Set \`l = 0\`, \`r = ROWS * COLS - 1\`.
2. While \`l <= r\`:
   * \`m = (l + r) // 2\`.
   * ==\`v = matrix[m // COLS][m % COLS]\`==.
   * If \`v == target\`, return \`True\`.
   * If \`v < target\`, \`l = m + 1\`; else \`r = m - 1\`.
3. Return \`False\`.`,
    visual: {
      kind: "grid",
      title: "Search a 2D matrix · target 3",
      rows: [
        [1, 3, 5, 7],
        [10, 11, 16, 20],
        [23, 30, 34, 60],
      ],
      frames: [
        { caption: "l=0, r=11 → m=5 → cell (1, 1) = 11. 11 > 3 → r = 4.", highlight: ["1,1"], vars: kv({ l: "0", r: "11", m: "5 → (1,1)" }) },
        { caption: "l=0, r=4 → m=2 → cell (0, 2) = 5. 5 > 3 → r = 1.", highlight: ["0,2"], done: ["1,1"], vars: kv({ l: "0", r: "4", m: "2 → (0,2)" }) },
        { caption: "l=0, r=1 → m=0 → cell (0, 0) = 1. 1 < 3 → l = 1.", highlight: ["0,0"], done: ["1,1", "0,2"], vars: kv({ l: "0", r: "1", m: "0 → (0,0)" }) },
        { caption: "l=1, r=1 → m=1 → cell (0, 1) = 3 → found.", highlight: ["0,1"], done: ["1,1", "0,2", "0,0"], vars: kv({ l: "1", r: "1", m: "1 → (0,1)", answer: "True" }) },
      ],
    },
    code: `def searchMatrix(matrix: list[list[int]], target: int) -> bool:
    ROWS, COLS = len(matrix), len(matrix[0])
    l, r = 0, ROWS * COLS - 1
    while l <= r:
        m = (l + r) // 2
        v = matrix[m // COLS][m % COLS]
        if v == target:
            return True
        if v < target:
            l = m + 1
        else:
            r = m - 1
    return False`,
    complexity: "Time O(log(m · n)) · Space O(1)",
  },
  {
    lc: 875,
    variation: "answer-space",
    question: "Given banana piles and h hours, find the slowest whole eating speed (bananas per hour, one pile per hour max) that finishes in time.",
    intuition: `If speed \`k\` finishes in time, every faster speed does too: the yes/no answer ==flips exactly once== as \`k\` grows. So binary search \`k\` in \`[1, max(piles)]\`. Hours at speed \`k\` = ==\`sum(ceil(p / k))\`==. When it fits, record \`k\` and try slower; otherwise go faster.`,
    algorithm: `1. Set \`l = 1\`, \`r = max(piles)\`, \`res = r\`.
2. While \`l <= r\`:
   * \`k = (l + r) // 2\`.
   * \`hours = sum(ceil(p / k) for p in piles)\`.
   * If ==\`hours <= h\`==: \`res = k\`, then \`r = k - 1\` (try slower).
   * Else \`l = k + 1\` (too slow).
3. Return \`res\`.`,
    visual: {
      kind: "array",
      title: "Koko · piles [3, 6, 7, 11], h = 8, speeds 1..11",
      values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      frames: [
        { caption: "k=6: hours 1+1+2+2 = 6 ≤ 8 → fits. Record 6, try slower.", pointers: [{ name: "l", index: 0 }, { name: "k", index: 5 }, { name: "r", index: 10 }], range: [0, 10], highlight: [5], vars: kv({ hours: "6", res: "6" }) },
        { caption: "k=3: hours 1+2+3+4 = 10 > 8 → too slow, go faster.", pointers: [{ name: "l", index: 0 }, { name: "k", index: 2 }, { name: "r", index: 4 }], range: [0, 4], highlight: [2], done: [5, 6, 7, 8, 9, 10], vars: kv({ hours: "10", res: "6" }) },
        { caption: "k=4: hours 1+2+2+3 = 8 ≤ 8 → fits. Record 4, try slower.", pointers: [{ name: "l", index: 3 }, { name: "k", index: 3 }, { name: "r", index: 4 }], range: [3, 4], highlight: [3], done: [0, 1, 2, 5, 6, 7, 8, 9, 10], vars: kv({ hours: "8", res: "4" }) },
        { caption: "r = 3 < l = 4 → stop. The slowest speed that fits is 4.", highlight: [3], done: [0, 1, 2, 4, 5, 6, 7, 8, 9, 10], vars: kv({ answer: "4" }) },
      ],
    },
    code: `import math

def minEatingSpeed(piles: list[int], h: int) -> int:
    l, r = 1, max(piles)
    res = r
    while l <= r:
        k = (l + r) // 2
        hours = sum(math.ceil(p / k) for p in piles)
        if hours <= h:
            res = k
            r = k - 1
        else:
            l = k + 1
    return res`,
    complexity: "Time O(n · log(max pile)) · Space O(1)",
  },
  {
    lc: 153,
    variation: "rotated",
    question: "Given a sorted list of distinct numbers that has been rotated some number of times, return its smallest value in O(log n).",
    intuition: `Compare the middle with the ==right end==. If \`nums[m] > nums[r]\`, the drop (and so the minimum) is ==somewhere to the right of \`m\`==. Otherwise \`m..r\` is sorted, so the minimum is \`m\` or to its left. Shrink until \`l == r\`: that's the minimum.`,
    algorithm: `1. Set \`l = 0\`, \`r = len(nums) - 1\`.
2. While ==\`l < r\`==:
   * \`m = (l + r) // 2\`.
   * If ==\`nums[m] > nums[r]\`==, \`l = m + 1\` (the minimum is right of \`m\`).
   * Else \`r = m\` (\`m\` could be the minimum, keep it).
3. Return \`nums[l]\`.`,
    visual: {
      kind: "array",
      title: "Minimum in rotated array · [4, 5, 6, 7, 0, 1, 2]",
      values: [4, 5, 6, 7, 0, 1, 2],
      frames: [
        { caption: "m=3: 7 > nums[r]=2 → the drop is right of m. l = 4.", pointers: [{ name: "l", index: 0 }, { name: "m", index: 3 }, { name: "r", index: 6 }], range: [0, 6], highlight: [3, 6] },
        { caption: "m=5: 1 ≤ 2 → m..r is sorted; the min is at m or left. r = 5.", pointers: [{ name: "l", index: 4 }, { name: "m", index: 5 }, { name: "r", index: 6 }], range: [4, 6], highlight: [5, 6], done: [0, 1, 2, 3] },
        { caption: "m=4: 0 ≤ 1 → r = 4.", pointers: [{ name: "l", index: 4 }, { name: "m", index: 4 }, { name: "r", index: 5 }], range: [4, 5], highlight: [4, 5], done: [0, 1, 2, 3, 6] },
        { caption: "l = r = 4 → the minimum is 0.", pointers: [{ name: "l", index: 4 }, { name: "r", index: 4 }], highlight: [4], done: [0, 1, 2, 3, 5, 6], vars: kv({ answer: "0" }) },
      ],
    },
    code: `def findMin(nums: list[int]) -> int:
    l, r = 0, len(nums) - 1
    while l < r:
        m = (l + r) // 2
        if nums[m] > nums[r]:
            l = m + 1
        else:
            r = m
    return nums[l]`,
    complexity: "Time O(log n) · Space O(1)",
  },
  {
    lc: 33,
    variation: "rotated",
    question: "Given a rotated sorted list of distinct numbers and a target, return the target's index or -1 in O(log n).",
    intuition: `After a rotation, ==at least one half around \`m\` is still sorted==: the left half if \`nums[l] <= nums[m]\`, else the right half. In the sorted half you can tell with two comparisons whether the target lies inside. ==If it does, search there; otherwise search the other half.==`,
    algorithm: `1. Set \`l = 0\`, \`r = len(nums) - 1\`.
2. While \`l <= r\`:
   * \`m = (l + r) // 2\`. If \`nums[m] == target\`, return \`m\`.
   * If ==\`nums[l] <= nums[m]\`== (left half sorted):
      * If \`nums[l] <= target < nums[m]\`, \`r = m - 1\`; else \`l = m + 1\`.
   * Else (right half sorted):
      * If \`nums[m] < target <= nums[r]\`, \`l = m + 1\`; else \`r = m - 1\`.
3. Return \`-1\`.`,
    visual: {
      kind: "array",
      title: "Search rotated · [4, 5, 6, 7, 0, 1, 2], target 0",
      values: [4, 5, 6, 7, 0, 1, 2],
      frames: [
        { caption: "m=3 (7). Left half 4..7 is sorted, and 0 isn't in [4, 7) → search right. l = 4.", pointers: [{ name: "l", index: 0 }, { name: "m", index: 3 }, { name: "r", index: 6 }], range: [0, 3], highlight: [3] },
        { caption: "m=5 (1). Left half 0..1 is sorted, and 0 is in [0, 1) → search left. r = 4.", pointers: [{ name: "l", index: 4 }, { name: "m", index: 5 }, { name: "r", index: 6 }], range: [4, 5], highlight: [5], done: [0, 1, 2, 3] },
        { caption: "m=4: nums[4] = 0 → found. Return 4.", pointers: [{ name: "m", index: 4 }], highlight: [4], done: [0, 1, 2, 3, 5, 6], vars: kv({ answer: "4" }) },
      ],
    },
    code: `def search(nums: list[int], target: int) -> int:
    l, r = 0, len(nums) - 1
    while l <= r:
        m = (l + r) // 2
        if nums[m] == target:
            return m
        if nums[l] <= nums[m]:  # left half is sorted
            if nums[l] <= target < nums[m]:
                r = m - 1
            else:
                l = m + 1
        else:  # right half is sorted
            if nums[m] < target <= nums[r]:
                l = m + 1
            else:
                r = m - 1
    return -1`,
    complexity: "Time O(log n) · Space O(1)",
  },
  {
    lc: 981,
    variation: "last-at-most",
    question: "Design a key-value store where each set records a timestamp, and a get returns the value set most recently at or before a given time.",
    intuition: `Timestamps for a key arrive ==in increasing order==, so each key's list of \`(time, value)\` is already sorted: appending is enough. A get is a binary search for the ==last timestamp \`<=\` the query==: whenever the middle is not too late, record it as the answer so far and look further right.`,
    algorithm: `1. Keep \`store = defaultdict(list)\`: key → list of \`(timestamp, value)\`.
2. \`set(key, value, timestamp)\`: append \`(timestamp, value)\`.
3. \`get(key, timestamp)\`:
   * Let \`items = store[key]\`, \`res = ""\`, \`l = 0\`, \`r = len(items) - 1\`.
   * While \`l <= r\`:
      * \`m = (l + r) // 2\`.
      * If ==\`items[m][0] <= timestamp\`==: \`res = items[m][1]\`, \`l = m + 1\`.
      * Else \`r = m - 1\`.
   * Return \`res\`.`,
    visual: {
      kind: "array",
      title: "Time map · get(\"foo\", 8) over foo's history",
      values: ["1:a", "4:b", "7:c", "10:d"],
      frames: [
        { caption: "m=1: time 4 ≤ 8 → candidate \"b\". Look right for a later one.", pointers: [{ name: "l", index: 0 }, { name: "m", index: 1 }, { name: "r", index: 3 }], range: [0, 3], highlight: [1], vars: kv({ res: "b" }) },
        { caption: "m=2: time 7 ≤ 8 → better candidate \"c\". l = 3.", pointers: [{ name: "l", index: 2 }, { name: "m", index: 2 }, { name: "r", index: 3 }], range: [2, 3], highlight: [2], done: [0, 1], vars: kv({ res: "c" }) },
        { caption: "m=3: time 10 > 8 → too late. r = 2.", pointers: [{ name: "l", index: 3 }, { name: "m", index: 3 }, { name: "r", index: 3 }], range: [3, 3], highlight: [3], done: [0, 1], vars: kv({ res: "c" }) },
        { caption: "l > r → stop. The latest value at or before 8 is \"c\".", highlight: [2], done: [0, 1, 3], vars: kv({ answer: "c" }) },
      ],
    },
    code: `from collections import defaultdict

class TimeMap:
    def __init__(self):
        self.store = defaultdict(list)  # key -> [(timestamp, value)]

    def set(self, key: str, value: str, timestamp: int) -> None:
        self.store[key].append((timestamp, value))

    def get(self, key: str, timestamp: int) -> str:
        items = self.store.get(key, [])
        res = ""
        l, r = 0, len(items) - 1
        while l <= r:
            m = (l + r) // 2
            if items[m][0] <= timestamp:
                res = items[m][1]
                l = m + 1
            else:
                r = m - 1
        return res`,
    complexity: "Time O(1) set, O(log n) get · Space O(n)",
  },
  {
    lc: 4,
    variation: "partition",
    question: "Given two sorted lists, return the median of all their numbers combined in O(log(m + n)).",
    intuition: `The median splits the merged list into a left half and a right half. Pick ==\`i\` items from the smaller list \`A\`== and \`j = half - i\` from \`B\`. The split is right when ==\`Aleft <= Bright\` and \`Bleft <= Aright\`== (everything on the left ≤ everything on the right). If \`Aleft\` is too big take fewer from \`A\`, otherwise more: binary search \`i\`.`,
    algorithm: `1. Make \`A\` the shorter list. Let \`half = (m + n + 1) // 2\`; search \`i\` in \`[0, m]\`.
2. While \`lo <= hi\`:
   * \`i = (lo + hi) // 2\`, ==\`j = half - i\`==.
   * \`Aleft = A[i - 1]\`, \`Aright = A[i]\`, \`Bleft = B[j - 1]\`, \`Bright = B[j]\` (use ±∞ past the ends).
   * If ==\`Aleft <= Bright\` and \`Bleft <= Aright\`==:
      * Odd total → return \`max(Aleft, Bleft)\`.
      * Even → return \`(max(Aleft, Bleft) + min(Aright, Bright)) / 2\`.
   * If \`Aleft > Bright\`, \`hi = i - 1\` (take fewer from A).
   * Else \`lo = i + 1\` (take more from A).`,
    visual: {
      kind: "grid",
      title: "Median of two sorted · A = [1, 3, 8], B = [2, 4, 5, 7]",
      rows: [
        [1, 3, 8, ""],
        [2, 4, 5, 7],
      ],
      rowLabels: ["A", "B"],
      frames: [
        { caption: "7 numbers → the left half holds 4. Binary search i (taken from A) in [0, 3].", vars: kv({ half: "4", lo: "0", hi: "3" }) },
        { caption: "i=1, j=3: left = {1} + {2, 4, 5}. Bleft 5 > Aright 3 → take more from A.", highlight: ["0,0", "1,0", "1,1", "1,2"], vars: kv({ Aleft: "1", Aright: "3", Bleft: "5", Bright: "7" }) },
        { caption: "i=2, j=2: left = {1, 3} + {2, 4}. 3 ≤ 5 and 4 ≤ 8 → valid split.", highlight: ["0,0", "0,1", "1,0", "1,1"], vars: kv({ Aleft: "3", Aright: "8", Bleft: "4", Bright: "5" }) },
        { caption: "Odd total → the median is the largest left value, max(3, 4) = 4.", highlight: ["1,1"], done: ["0,0", "0,1", "1,0"], vars: kv({ answer: "4.0" }) },
      ],
    },
    code: `def findMedianSortedArrays(nums1: list[int], nums2: list[int]) -> float:
    A, B = nums1, nums2
    if len(A) > len(B):
        A, B = B, A
    m, n = len(A), len(B)
    half = (m + n + 1) // 2
    lo, hi = 0, m
    while lo <= hi:
        i = (lo + hi) // 2  # items taken from A
        j = half - i        # items taken from B
        a_left = A[i - 1] if i > 0 else float("-inf")
        a_right = A[i] if i < m else float("inf")
        b_left = B[j - 1] if j > 0 else float("-inf")
        b_right = B[j] if j < n else float("inf")
        if a_left <= b_right and b_left <= a_right:
            if (m + n) % 2:
                return float(max(a_left, b_left))
            return (max(a_left, b_left) + min(a_right, b_right)) / 2
        if a_left > b_right:
            hi = i - 1
        else:
            lo = i + 1
    return 0.0`,
    complexity: "Time O(log(min(m, n))) · Space O(1)",
  },
];

/** Recognise-it cues for the Roadmap flashcards. */