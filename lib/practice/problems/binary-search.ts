/**
 * Arena problems: binary-search. Same problems as LeetCode, our own words, verified tests (see ../types.ts).
 * - 704 Binary Search (Easy)
 * - 74 Search a 2D Matrix (Medium)
 * - 875 Koko Eating Bananas (Medium)
 * - 153 Find Minimum in Rotated Sorted Array (Medium)
 * - 33 Search in Rotated Sorted Array (Medium)
 * - 981 Time Based Key-Value Store (Medium)
 * - 4 Median of Two Sorted Arrays (Hard)
 */
import type { ArenaProblem } from "../types";

export const arena: ArenaProblem[] = [
  {
    lc: 704,
    kind: "algorithm",
    statement: `You are given an array of integers \`nums\` sorted in **strictly increasing** order (no value repeats) and an integer \`target\`.

Return the **index** of \`target\` in \`nums\`, or \`-1\` if it does not appear.

- Your algorithm should run in **O(log n)** time.
- The array always has at least one element.`,
    examples: [
      { input: "nums = [-4, 1, 3, 8, 12, 20], target = 8", output: "3", explanation: "8 sits at index 3." },
      { input: "nums = [2, 5, 9], target = 4", output: "-1", explanation: "4 is not in the array." },
    ],
    constraints: ["1 <= nums.length <= 10^4", "-10^4 < nums[i], target < 10^4", "All values in nums are distinct.", "nums is sorted in ascending order."],
    signature: `class Solution:
    def search(self, nums: List[int], target: int) -> int:`,
    method: "search",
    tests: [
      { id: "ex1", input: "[[-4, 1, 3, 8, 12, 20], 8]", expected: "3", visible: true },
      { id: "ex2", input: "[[2, 5, 9], 4]", expected: "-1", visible: true },
      { id: "single-hit", input: "[[7], 7]", expected: "0", visible: false },
      { id: "single-miss", input: "[[7], 3]", expected: "-1", visible: false },
      { id: "first", input: "[[-9, -3, 0, 6, 11], -9]", expected: "0", visible: false },
      { id: "last", input: "[[-9, -3, 0, 6, 11], 11]", expected: "4", visible: false },
      { id: "below-all", input: "[[1, 2, 3, 4], -5]", expected: "-1", visible: false },
      { id: "above-all", input: "[[1, 2, 3, 4], 50]", expected: "-1", visible: false },
      { id: "big", input: "[list(range(-9999, 9999, 3)), 1236]", expected: "3745", visible: false },
      { id: "big-miss", input: "[list(range(-9999, 9999, 3)), 1237]", expected: "-1", visible: false },
    ],
    solution: `class Solution:
    def search(self, nums: List[int], target: int) -> int:
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
    hints: ["Comparing target with the middle element tells you which half can be thrown away.", "Keep a window [l, r] and loop while l <= r so a one-element window is still checked.", "Move l to m + 1 or r to m - 1; never keep m once you've ruled it out."],
    clarify: [
      { question: "Can values repeat?", answer: "No, every value is distinct, so the answer index is unique." },
      { question: "What if the target is missing?", answer: "Return -1." },
      { question: "Can the array be empty?", answer: "No, it has at least one element." },
    ],
  },
  {
    lc: 74,
    kind: "algorithm",
    statement: `You get an \`m x n\` integer grid \`matrix\` with two ordering properties:

- Every row is sorted in non-decreasing order from left to right.
- The first value of each row is **greater than** the last value of the row above it.

Given an integer \`target\`, return \`True\` if it appears anywhere in the grid and \`False\` otherwise.

Aim for **O(log(m · n))** time.`,
    examples: [
      { input: "matrix = [[2,4,7],[9,13,15],[21,22,30]], target = 13", output: "True", explanation: "13 is in the middle row." },
      { input: "matrix = [[2,4,7],[9,13,15],[21,22,30]], target = 8", output: "False", explanation: "8 would fall between 7 and 9, but it isn't there." },
    ],
    constraints: ["1 <= m, n <= 100 (m rows, n columns)", "-10^4 <= matrix[i][j], target <= 10^4"],
    signature: `class Solution:
    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:`,
    method: "searchMatrix",
    tests: [
      { id: "ex1", input: "[[[2, 4, 7], [9, 13, 15], [21, 22, 30]], 13]", expected: "True", visible: true },
      { id: "ex2", input: "[[[2, 4, 7], [9, 13, 15], [21, 22, 30]], 8]", expected: "False", visible: true },
      { id: "one-cell-hit", input: "[[[5]], 5]", expected: "True", visible: false },
      { id: "one-cell-miss", input: "[[[5]], 6]", expected: "False", visible: false },
      { id: "single-row", input: "[[[1, 3, 5, 7, 9]], 9]", expected: "True", visible: false },
      { id: "single-col", input: "[[[-8], [-2], [4], [10]], -2]", expected: "True", visible: false },
      { id: "first-cell", input: "[[[1, 2], [3, 4], [5, 6]], 1]", expected: "True", visible: false },
      { id: "above-max", input: "[[[1, 2], [3, 4], [5, 6]], 7]", expected: "False", visible: false },
      { id: "big", input: "[[[r * 100 + c for c in range(100)] for r in range(100)], 7342]", expected: "True", visible: false },
      { id: "big-miss", input: "[[[r * 200 + 2 * c for c in range(100)] for r in range(100)], 7343]", expected: "False", visible: false },
    ],
    solution: `class Solution:
    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:
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
    hints: ["Read row by row, the grid is one sorted list.", "Binary search a flat index from 0 to rows*cols - 1.", "Turn a flat index k into a cell with (k // cols, k % cols)."],
    clarify: [
      { question: "Can the grid be empty?", answer: "No, it has at least one row and one column." },
      { question: "Are duplicates possible?", answer: "Rows are non-decreasing, but you only need to say whether the target exists, so duplicates don't matter." },
      { question: "Do I return a position?", answer: "No, just True or False." },
    ],
  },
  {
    lc: 875,
    kind: "algorithm",
    statement: `Koko has \`n\` piles of bananas; pile \`i\` holds \`piles[i]\` bananas. She has \`h\` hours before the guards come back.

She picks an integer eating speed \`k\` (bananas per hour). Each hour she chooses one pile and eats up to \`k\` bananas from it. If the pile has fewer than \`k\` left, she finishes it and **wastes the rest of that hour** (she never moves to another pile within the same hour).

Return the **smallest** integer \`k\` that lets her finish every pile within \`h\` hours.

- \`h\` is always at least the number of piles, so an answer always exists.`,
    examples: [
      { input: "piles = [5, 9, 2], h = 6", output: "3", explanation: "At k = 3 she needs 2 + 3 + 1 = 6 hours, which fits; at k = 2 she needs 3 + 5 + 1 = 9, which is too many." },
      { input: "piles = [12, 4, 8], h = 3", output: "12", explanation: "One hour per pile means she must eat the largest pile in one go: k = 12." },
    ],
    constraints: ["1 <= piles.length <= 10^4", "piles.length <= h <= 10^9", "1 <= piles[i] <= 10^9"],
    signature: `class Solution:
    def minEatingSpeed(self, piles: List[int], h: int) -> int:`,
    method: "minEatingSpeed",
    tests: [
      { id: "ex1", input: "[[5, 9, 2], 6]", expected: "3", visible: true },
      { id: "ex2", input: "[[12, 4, 8], 3]", expected: "12", visible: true },
      { id: "one-pile-one-hour", input: "[[1000000000], 1]", expected: "1000000000", visible: false },
      { id: "one-pile-many-hours", input: "[[1000000000], 1000000000]", expected: "1", visible: false },
      { id: "all-ones", input: "[[1, 1, 1, 1], 4]", expected: "1", visible: false },
      { id: "plenty-of-time", input: "[[6, 6, 6], 100]", expected: "1", visible: false },
      { id: "mixed", input: "[[30, 11, 23, 4, 20], 6]", expected: "23", visible: false },
      { id: "odd", input: "[[3, 6, 7, 11], 8]", expected: "4", visible: false },
      { id: "big", input: "[[(i * 7919) % 100000 + 1 for i in range(10000)], 25000]", expected: "24993", visible: false },
    ],
    solution: `class Solution:
    def minEatingSpeed(self, piles: List[int], h: int) -> int:
        l, r = 1, max(piles)
        res = r
        while l <= r:
            k = (l + r) // 2
            hours = sum((p + k - 1) // k for p in piles)
            if hours <= h:
                res = k
                r = k - 1
            else:
                l = k + 1
        return res`,
    hints: ["If speed k is fast enough, every faster speed is too, so the answer is a threshold.", "The answer lies between 1 and max(piles). Binary search that range.", "Hours needed at speed k is the sum of ceil(p / k); use integer math (p + k - 1) // k."],
    clarify: [
      { question: "Can she split an hour between two piles?", answer: "No. Leftover time in an hour after finishing a pile is wasted." },
      { question: "Must k be an integer?", answer: "Yes, a positive whole number." },
      { question: "Is there always a valid speed?", answer: "Yes, because h is at least the number of piles." },
    ],
  },
  {
    lc: 153,
    kind: "algorithm",
    statement: `An array of **distinct** integers was sorted ascending and then rotated: some suffix was moved to the front (possibly the whole array, i.e. no visible change). For example \`[3, 5, 8, 10]\` could become \`[8, 10, 3, 5]\`.

Given the rotated array \`nums\`, return its **minimum value**.

- Your algorithm must run in **O(log n)** time.`,
    examples: [
      { input: "nums = [8, 10, 3, 5]", output: "3", explanation: "The original order was [3, 5, 8, 10]." },
      { input: "nums = [1, 4, 6, 9, 12]", output: "1", explanation: "Rotated a full cycle, so it still looks sorted." },
      { input: "nums = [14, 2]", output: "2" },
    ],
    constraints: ["1 <= nums.length <= 5000", "-5000 <= nums[i] <= 5000", "All values are distinct.", "nums is a rotation of an ascending array (rotated between 1 and n times)."],
    signature: `class Solution:
    def findMin(self, nums: List[int]) -> int:`,
    method: "findMin",
    tests: [
      { id: "ex1", input: "[[8, 10, 3, 5]]", expected: "3", visible: true },
      { id: "ex2", input: "[[1, 4, 6, 9, 12]]", expected: "1", visible: true },
      { id: "ex3", input: "[[14, 2]]", expected: "2", visible: true },
      { id: "single", input: "[[42]]", expected: "42", visible: false },
      { id: "min-last", input: "[[2, 3, 4, 5, -1]]", expected: "-1", visible: false },
      { id: "min-second", input: "[[9, -7, -3, 0, 4]]", expected: "-7", visible: false },
      { id: "negatives", input: "[[-2, -1, -10, -8, -5]]", expected: "-10", visible: false },
      { id: "two-sorted", input: "[[1, 2]]", expected: "1", visible: false },
      { id: "big", input: "[list(range(1500, 5000)) + list(range(-5000, 1500))]", expected: "-5000", visible: false },
    ],
    solution: `class Solution:
    def findMin(self, nums: List[int]) -> int:
        l, r = 0, len(nums) - 1
        while l < r:
            m = (l + r) // 2
            if nums[m] > nums[r]:
                l = m + 1
            else:
                r = m
        return nums[l]`,
    hints: ["Compare the middle element with the rightmost element of the current range.", "If nums[m] > nums[r], the drop (and the minimum) is to the right of m; otherwise m..r is sorted and the minimum is at m or to its left.", "Shrink with l = m + 1 or r = m until l == r."],
    clarify: [
      { question: "Could the array be unrotated?", answer: "Yes, a full rotation leaves it sorted; return the first element then." },
      { question: "Are there duplicates?", answer: "No, all values are distinct." },
      { question: "Do I return the index or the value?", answer: "The value." },
    ],
  },
  {
    lc: 33,
    kind: "algorithm",
    statement: `\`nums\` holds **distinct** integers that were sorted ascending and then possibly rotated at some unknown pivot \`k\` (\`0 <= k < n\`), giving \`[nums[k], ..., nums[n-1], nums[0], ..., nums[k-1]]\` of the original order.

Given \`nums\` and an integer \`target\`, return the index of \`target\` in \`nums\`, or \`-1\` if it is absent.

- Your algorithm must run in **O(log n)** time.`,
    examples: [
      { input: "nums = [15, 18, 22, 3, 7, 11], target = 7", output: "4", explanation: "7 is at index 4." },
      { input: "nums = [15, 18, 22, 3, 7, 11], target = 16", output: "-1" },
      { input: "nums = [5], target = 5", output: "0" },
    ],
    constraints: ["1 <= nums.length <= 5000", "-10^4 <= nums[i], target <= 10^4", "All values are distinct.", "nums is an ascending array that may have been rotated."],
    signature: `class Solution:
    def search(self, nums: List[int], target: int) -> int:`,
    method: "search",
    tests: [
      { id: "ex1", input: "[[15, 18, 22, 3, 7, 11], 7]", expected: "4", visible: true },
      { id: "ex2", input: "[[15, 18, 22, 3, 7, 11], 16]", expected: "-1", visible: true },
      { id: "ex3", input: "[[5], 5]", expected: "0", visible: true },
      { id: "single-miss", input: "[[5], 2]", expected: "-1", visible: false },
      { id: "no-rotation", input: "[[1, 3, 5, 7, 9], 7]", expected: "3", visible: false },
      { id: "pivot-left", input: "[[9, 1, 2, 3, 4, 5], 9]", expected: "0", visible: false },
      { id: "pivot-right", input: "[[2, 3, 4, 5, 6, 1], 1]", expected: "5", visible: false },
      { id: "two", input: "[[3, 1], 1]", expected: "1", visible: false },
      { id: "miss-gap", input: "[[30, 40, 50, 10, 20], 35]", expected: "-1", visible: false },
      { id: "big", input: "[list(range(2000, 9000, 2)) + list(range(-6000, 2000, 2)), -5998]", expected: "3501", visible: false },
    ],
    solution: `class Solution:
    def search(self, nums: List[int], target: int) -> int:
        l, r = 0, len(nums) - 1
        while l <= r:
            m = (l + r) // 2
            if nums[m] == target:
                return m
            if nums[l] <= nums[m]:  # left half sorted
                if nums[l] <= target < nums[m]:
                    r = m - 1
                else:
                    l = m + 1
            else:  # right half sorted
                if nums[m] < target <= nums[r]:
                    l = m + 1
                else:
                    r = m - 1
        return -1`,
    hints: ["Around any midpoint, at least one of the two halves is fully sorted.", "If nums[l] <= nums[m] the left half is sorted; otherwise the right half is.", "Check whether the target lies inside the sorted half's range; if yes go there, if not go to the other half."],
    clarify: [
      { question: "Could the array not be rotated at all?", answer: "Yes, k can be 0." },
      { question: "Are there duplicates?", answer: "No, all values are distinct." },
      { question: "What do I return when the target is missing?", answer: "-1." },
    ],
  },
  {
    lc: 981,
    kind: "class_design",
    statement: `Build a key-value store that remembers **every value a key has had over time**.

Implement \`TimeMap\`:

- \`TimeMap()\` creates an empty store.
- \`set(key, value, timestamp)\` records that \`key\` held \`value\` at time \`timestamp\`.
- \`get(key, timestamp)\` returns the value recorded for \`key\` at the **latest time that is \`<= timestamp\`**. If the key has no record at or before that time (or was never set), return the empty string \`""\`.

Guarantee: for every \`set\` call, timestamps are **strictly increasing** across all calls.

Tests use the operation-list format: the first list names the calls, the second gives each call's arguments; the expected output lists each call's return value (\`None\` for the constructor and \`set\`).`,
    examples: [
      { input: "ops = [\"TimeMap\",\"set\",\"get\",\"get\",\"set\",\"get\",\"get\"], args = [[],[\"color\",\"red\",2],[\"color\",2],[\"color\",5],[\"color\",\"blue\",6],[\"color\",5],[\"color\",9]]", output: "[None, None, 'red', 'red', None, 'red', 'blue']", explanation: "At time 5 the latest record is red (time 2); at time 9 it is blue (time 6)." },
      { input: "ops = [\"TimeMap\",\"set\",\"get\",\"get\"], args = [[],[\"a\",\"x\",10],[\"a\",9],[\"b\",10]]", output: "[None, None, '', '']", explanation: "Nothing for a before time 10, and b was never set." },
    ],
    constraints: ["1 <= key.length, value.length <= 100, lowercase letters and digits", "1 <= timestamp <= 10^7", "set timestamps are strictly increasing", "At most 2 * 10^5 calls in total"],
    signature: `class TimeMap:

    def __init__(self):


    def set(self, key: str, value: str, timestamp: int) -> None:


    def get(self, key: str, timestamp: int) -> str:`,
    method: "TimeMap",
    driver: `def run(ns, args):
    return replay(ns, args[0], args[1])
`,
    tests: [
      { id: "ex1", input: "[[\"TimeMap\", \"set\", \"get\", \"get\", \"set\", \"get\", \"get\"], [[], [\"color\", \"red\", 2], [\"color\", 2], [\"color\", 5], [\"color\", \"blue\", 6], [\"color\", 5], [\"color\", 9]]]", expected: "[None, None, 'red', 'red', None, 'red', 'blue']", visible: true },
      { id: "ex2", input: "[[\"TimeMap\", \"set\", \"get\", \"get\"], [[], [\"a\", \"x\", 10], [\"a\", 9], [\"b\", 10]]]", expected: "[None, None, '', '']", visible: true },
      { id: "exact-times", input: "[[\"TimeMap\", \"set\", \"set\", \"set\", \"get\", \"get\", \"get\"], [[], [\"k\", \"v1\", 1], [\"k\", \"v2\", 3], [\"k\", \"v3\", 7], [\"k\", 1], [\"k\", 3], [\"k\", 7]]]", expected: "[None, None, None, None, 'v1', 'v2', 'v3']", visible: false },
      { id: "between", input: "[[\"TimeMap\", \"set\", \"set\", \"set\", \"get\", \"get\", \"get\"], [[], [\"k\", \"v1\", 1], [\"k\", \"v2\", 3], [\"k\", \"v3\", 7], [\"k\", 2], [\"k\", 6], [\"k\", 100]]]", expected: "[None, None, None, None, 'v1', 'v2', 'v3']", visible: false },
      { id: "multi-key", input: "[[\"TimeMap\", \"set\", \"set\", \"set\", \"get\", \"get\", \"get\", \"get\"], [[], [\"a\", \"a1\", 1], [\"b\", \"b1\", 2], [\"a\", \"a2\", 3], [\"b\", 2], [\"a\", 2], [\"b\", 1], [\"a\", 3]]]", expected: "[None, None, None, None, 'b1', 'a1', '', 'a2']", visible: false },
      { id: "get-empty", input: "[[\"TimeMap\", \"get\", \"get\"], [[], [\"z\", 1], [\"z\", 10000000]]]", expected: "[None, '', '']", visible: false },
      { id: "before-first", input: "[[\"TimeMap\", \"set\", \"set\", \"get\"], [[], [\"p\", \"q\", 5], [\"p\", \"r\", 8], [\"p\", 4]]]", expected: "[None, None, None, '']", visible: false },
      { id: "big", input: "[[\"TimeMap\"] + [\"set\"] * 3000 + [\"get\", \"get\", \"get\", \"get\"], [[]] + [[\"key\", \"v\" + str(i), 2 * i + 1] for i in range(3000)] + [[\"key\", 0], [\"key\", 1], [\"key\", 4000], [\"key\", 999999]]]", expected: "[None] * 3001 + [\"\", \"v0\", \"v1999\", \"v2999\"]", visible: false },
    ],
    solution: `class TimeMap:

    def __init__(self):
        self.store = {}  # key -> list of (timestamp, value), timestamps increasing

    def set(self, key: str, value: str, timestamp: int) -> None:
        self.store.setdefault(key, []).append((timestamp, value))

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
    hints: ["Because set timestamps only increase, appending to a per-key list keeps it sorted.", "A get is a search for the last timestamp that is <= the query.", "During binary search, whenever the middle is not too late, remember its value and keep looking right."],
    clarify: [
      { question: "What if the key exists but every record is later than the query?", answer: "Return the empty string." },
      { question: "Are timestamps sorted?", answer: "Yes, set calls come with strictly increasing timestamps." },
      { question: "Can the same key be set many times?", answer: "Yes, every set is kept as history." },
    ],
  },
  {
    lc: 4,
    kind: "algorithm",
    statement: `You get two arrays \`nums1\` (length \`m\`) and \`nums2\` (length \`n\`), each sorted in non-decreasing order. Return the **median** of all \`m + n\` numbers taken together.

- If the combined count is odd, the median is the middle value of the merged order.
- If it is even, the median is the average of the two middle values (it may be a non-integer, e.g. \`2.5\`).
- One of the arrays may be empty, but not both.
- Aim for **O(log(m + n))** time.

Answers are compared after rounding to 5 decimal places.`,
    examples: [
      { input: "nums1 = [2, 6, 9], nums2 = [4]", output: "5.0", explanation: "Merged: [2, 4, 6, 9]; middle two are 4 and 6, so 5.0." },
      { input: "nums1 = [1, 3], nums2 = [5, 7, 8]", output: "5.0", explanation: "Merged: [1, 3, 5, 7, 8]; the middle is 5." },
    ],
    constraints: ["0 <= m, n <= 1000", "1 <= m + n <= 2000", "-10^6 <= nums1[i], nums2[i] <= 10^6"],
    signature: `class Solution:
    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:`,
    method: "findMedianSortedArrays",
    driver: `def run(ns, args):
    return round(ns["Solution"]().findMedianSortedArrays(*args), 5)
`,
    tests: [
      { id: "ex1", input: "[[2, 6, 9], [4]]", expected: "5.0", visible: true },
      { id: "ex2", input: "[[1, 3], [5, 7, 8]]", expected: "5.0", visible: true },
      { id: "one-empty", input: "[[], [10]]", expected: "10.0", visible: false },
      { id: "other-empty", input: "[[1, 2, 3, 4], []]", expected: "2.5", visible: false },
      { id: "half", input: "[[1], [2]]", expected: "1.5", visible: false },
      { id: "disjoint", input: "[[1, 2, 3], [100, 200, 300, 400]]", expected: "100.0", visible: false },
      { id: "dups", input: "[[2, 2, 2], [2, 2]]", expected: "2.0", visible: false },
      { id: "negatives", input: "[[-9, -5, -1], [-7, -3]]", expected: "-5.0", visible: false },
      { id: "interleave", input: "[[1, 3, 8, 9, 15], [7, 11, 18, 19, 21, 25]]", expected: "11.0", visible: false },
      { id: "big", input: "[list(range(0, 2000, 2)), list(range(1, 1999, 2))]", expected: "999.0", visible: false },
    ],
    solution: `class Solution:
    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:
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
    hints: ["Merging costs O(m + n). Instead, think about how many elements of the left half come from each array.", "Binary search i = how many to take from the shorter array; then j = half - i come from the other.", "The split is valid when A[i-1] <= B[j] and B[j-1] <= A[i]; treat out-of-range neighbours as -inf / +inf."],
    clarify: [
      { question: "What if one array is empty?", answer: "That's allowed; the median comes from the other array alone." },
      { question: "Do I return an int or a float?", answer: "A float; for an even count it's the average of the two middle values." },
      { question: "Can values repeat?", answer: "Yes, within and across arrays." },
    ],
  },
];
