/**
 * Arena problems: backtracking. Same problems as LeetCode, our own words, verified tests (see ../types.ts).
 * - 78 Subsets (Medium)
 * - 39 Combination Sum (Medium)
 * - 40 Combination Sum II (Medium)
 * - 46 Permutations (Medium)
 * - 90 Subsets II (Medium)
 * - 79 Word Search (Medium)
 * - 131 Palindrome Partitioning (Medium)
 * - 17 Letter Combinations of a Phone Number (Medium)
 * - 51 N-Queens (Hard)
 */
import type { ArenaProblem } from "../types";

export const arena: ArenaProblem[] = [
  {
    lc: 78,
    kind: "algorithm",
    statement: `You are given an integer array \`nums\` whose values are all **distinct**. Return **every subset** of \`nums\` (its power set).

- The empty subset and \`nums\` itself both count.
- The result must not contain the same subset twice.
- Subsets may be returned in any order, and the numbers inside a subset may be in any order.`,
    examples: [
      { input: "nums = [4, 7, 9]", output: "[[], [4], [4, 7], [4, 7, 9], [4, 9], [7], [7, 9], [9]]", explanation: "3 distinct values give 2^3 = 8 subsets." },
      { input: "nums = [-2]", output: "[[], [-2]]" },
    ],
    constraints: ["1 <= nums.length <= 10", "-10 <= nums[i] <= 10", "All values in nums are distinct."],
    signature: `class Solution:
    def subsets(self, nums: List[int]) -> List[List[int]]:`,
    method: "subsets",
    driver: `def run(ns, args):
    out = ns["Solution"]().subsets(*args)
    res = sorted(sorted(x) for x in out)
    if len(res) <= 40:
        return res
    # large output: count, distinct count, and the first/last few entries
    return (len(res), len(set(map(tuple, res))), res[:3], res[-3:])
`,
    tests: [
      { id: "ex1", input: "[[4, 7, 9]]", expected: "[[], [4], [4, 7], [4, 7, 9], [4, 9], [7], [7, 9], [9]]", visible: true },
      { id: "ex2", input: "[[-2]]", expected: "[[], [-2]]", visible: true },
      { id: "pair", input: "[[0, 5]]", expected: "[[], [0], [0, 5], [5]]", visible: false },
      { id: "neg", input: "[[-1, -5, 3, 8]]", expected: "[[], [-5], [-5, -1], [-5, -1, 3], [-5, -1, 3, 8], [-5, -1, 8], [-5, 3], [-5, 3, 8], [-5, 8], [-1], [-1, 3], [-1, 3, 8], [-1, 8], [3], [3, 8], [8]]", visible: false },
      { id: "five", input: "[[10, -10, 2, 6, 1]]", expected: "[[], [-10], [-10, 1], [-10, 1, 2], [-10, 1, 2, 6], [-10, 1, 2, 6, 10], [-10, 1, 2, 10], [-10, 1, 6], [-10, 1, 6, 10], [-10, 1, 10], [-10, 2], [-10, 2, 6], [-10, 2, 6, 10], [-10, 2, 10], [-10, 6], [-10, 6, 10], [-10, 10], [1], [1, 2], [1, 2, 6], [1, 2, 6, 10], [1, 2, 10], [1, 6], [1, 6, 10], [1, 10], [2], [2, 6], [2, 6, 10], [2, 10], [6], [6, 10], [10]]", visible: false },
      { id: "unsorted", input: "[[3, 1, 2]]", expected: "[[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]]", visible: false },
      { id: "zero", input: "[[0]]", expected: "[[], [0]]", visible: false },
      { id: "big", input: "[list(range(10))]", expected: "(1024, 1024, [[], [0], [0, 1]], [[8], [8, 9], [9]])", visible: false },
    ],
    solution: `class Solution:
    def subsets(self, nums: List[int]) -> List[List[int]]:
        res, cur = [], []

        def dfs(start):
            res.append(cur.copy())
            for j in range(start, len(nums)):
                cur.append(nums[j])
                dfs(j + 1)
                cur.pop()

        dfs(0)
        return res`,
    hints: ["Every element is either in a subset or not, so there are 2^n answers to produce.", "Build subsets incrementally: record the current list, then try extending it with each element after the last one you added.", "After the recursive call returns, remove the element you just added so the list is clean for the next choice."],
    clarify: [
      { question: "Does the empty subset count?", answer: "Yes, it is always part of the answer." },
      { question: "Does the order of subsets or of numbers inside a subset matter?", answer: "No, any order is accepted." },
      { question: "Can nums contain duplicates?", answer: "No, all values are distinct here (Subsets II handles duplicates)." },
    ],
  },
  {
    lc: 39,
    kind: "algorithm",
    statement: `You are given an array \`candidates\` of **distinct** positive integers and a positive integer \`target\`. Return all **unique combinations** of candidates whose sum is exactly \`target\`.

- Any candidate may be used **as many times as you like** in a combination.
- Two combinations are the same if they use each number the same number of times; list each combination only once.
- If no combination works, return an empty list.
- Combinations, and the numbers inside each, may be returned in any order.`,
    examples: [
      { input: "candidates = [3, 4, 5], target = 8", output: "[[3, 5], [4, 4]]", explanation: "4 + 4 = 8 and 3 + 5 = 8." },
      { input: "candidates = [2, 5], target = 9", output: "[[2, 2, 5]]" },
      { input: "candidates = [6], target = 5", output: "[]", explanation: "6 is already larger than 5, so nothing works." },
    ],
    constraints: ["1 <= candidates.length <= 30", "2 <= candidates[i] <= 40", "All candidates are distinct.", "1 <= target <= 40", "The number of valid combinations is under 150."],
    signature: `class Solution:
    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:`,
    method: "combinationSum",
    driver: `def run(ns, args):
    out = ns["Solution"]().combinationSum(*args)
    res = sorted(sorted(x) for x in out)
    if len(res) <= 40:
        return res
    # large output: count, distinct count, and the first/last few entries
    return (len(res), len(set(map(tuple, res))), res[:3], res[-3:])
`,
    tests: [
      { id: "ex1", input: "[[3, 4, 5], 8]", expected: "[[3, 5], [4, 4]]", visible: true },
      { id: "ex2", input: "[[2, 5], 9]", expected: "[[2, 2, 5]]", visible: true },
      { id: "ex3", input: "[[6], 5]", expected: "[]", visible: true },
      { id: "single", input: "[[7], 21]", expected: "[[7, 7, 7]]", visible: false },
      { id: "unsorted", input: "[[8, 2, 6, 3], 11]", expected: "[[2, 2, 2, 2, 3], [2, 3, 3, 3], [2, 3, 6], [3, 8]]", visible: false },
      { id: "exact", input: "[[9, 10], 10]", expected: "[[10]]", visible: false },
      { id: "small_t", input: "[[2, 3], 1]", expected: "[]", visible: false },
      { id: "big", input: "[[2, 3, 5, 7], 30]", expected: "(45, 45, [[2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2], [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3], [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 5]], [[3, 3, 5, 5, 7, 7], [3, 5, 5, 5, 5, 7], [5, 5, 5, 5, 5, 5]])", visible: false },
    ],
    solution: `class Solution:
    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:
        candidates.sort()
        res, cur = [], []

        def dfs(start, total):
            if total == target:
                res.append(cur.copy())
                return
            for j in range(start, len(candidates)):
                if total + candidates[j] > target:
                    break
                cur.append(candidates[j])
                dfs(j, total + candidates[j])
                cur.pop()

        dfs(0, 0)
        return res`,
    hints: ["To avoid producing [2, 3] and [3, 2] separately, only allow choices at or after the index of the last pick.", "Since reuse is allowed, recurse with the same index you just picked, not the next one.", "Sort the candidates first: once one overshoots the remaining target, every later one does too, so you can stop the loop."],
    clarify: [
      { question: "Can the same number be used more than once?", answer: "Yes, as many times as needed." },
      { question: "Are [3, 5] and [5, 3] different answers?", answer: "No, they are the same combination; list it once." },
      { question: "What if no combination reaches the target?", answer: "Return an empty list." },
    ],
  },
  {
    lc: 40,
    kind: "algorithm",
    statement: `You are given an integer array \`candidates\` (which **may contain repeated values**) and an integer \`target\`. Return all **unique combinations** of elements whose sum equals \`target\`.

- Each element of \`candidates\` can be used **at most once** per combination (but equal values at different positions are separate elements).
- The answer must not contain duplicate combinations: two combinations with the same multiset of values count as one.
- Combinations, and the numbers inside each, may be returned in any order.`,
    examples: [
      { input: "candidates = [4, 1, 3, 1, 5, 2], target = 6", output: "[[1, 1, 4], [1, 2, 3], [1, 5], [2, 4]]", explanation: "Both 1s may appear together in [1, 1, 4], but [1, 5] is listed only once even though there are two 1s." },
      { input: "candidates = [3, 3, 3], target = 6", output: "[[3, 3]]" },
    ],
    constraints: ["1 <= candidates.length <= 100", "1 <= candidates[i] <= 50", "1 <= target <= 30"],
    signature: `class Solution:
    def combinationSum2(self, candidates: List[int], target: int) -> List[List[int]]:`,
    method: "combinationSum2",
    driver: `def run(ns, args):
    out = ns["Solution"]().combinationSum2(*args)
    res = sorted(sorted(x) for x in out)
    if len(res) <= 40:
        return res
    # large output: count, distinct count, and the first/last few entries
    return (len(res), len(set(map(tuple, res))), res[:3], res[-3:])
`,
    tests: [
      { id: "ex1", input: "[[4, 1, 3, 1, 5, 2], 6]", expected: "[[1, 1, 4], [1, 2, 3], [1, 5], [2, 4]]", visible: true },
      { id: "ex2", input: "[[3, 3, 3], 6]", expected: "[[3, 3]]", visible: true },
      { id: "none", input: "[[5, 7], 3]", expected: "[]", visible: false },
      { id: "all_ones", input: "[[1, 1, 1, 1, 1], 3]", expected: "[[1, 1, 1]]", visible: false },
      { id: "single", input: "[[8], 8]", expected: "[[8]]", visible: false },
      { id: "mixed", input: "[[2, 5, 2, 1, 2], 5]", expected: "[[1, 2, 2], [5]]", visible: false },
      { id: "too_big", input: "[[10, 1, 2, 7, 6, 1, 5], 30]", expected: "[[1, 1, 5, 6, 7, 10], [2, 5, 6, 7, 10]]", visible: false },
      { id: "big", input: "[list(range(1, 21)) + list(range(1, 21)), 12]", expected: "[[1, 1, 2, 2, 3, 3], [1, 1, 2, 2, 6], [1, 1, 2, 3, 5], [1, 1, 2, 4, 4], [1, 1, 2, 8], [1, 1, 3, 3, 4], [1, 1, 3, 7], [1, 1, 4, 6], [1, 1, 5, 5], [1, 1, 10], [1, 2, 2, 3, 4], [1, 2, 2, 7], [1, 2, 3, 6], [1, 2, 4, 5], [1, 2, 9], [1, 3, 3, 5], [1, 3, 4, 4], [1, 3, 8], [1, 4, 7], [1, 5, 6], [1, 11], [2, 2, 3, 5], [2, 2, 4, 4], [2, 2, 8], [2, 3, 3, 4], [2, 3, 7], [2, 4, 6], [2, 5, 5], [2, 10], [3, 3, 6], [3, 4, 5], [3, 9], [4, 8], [5, 7], [6, 6], [12]]", visible: false },
    ],
    solution: `class Solution:
    def combinationSum2(self, candidates: List[int], target: int) -> List[List[int]]:
        candidates.sort()
        res, cur = [], []

        def dfs(start, total):
            if total == target:
                res.append(cur.copy())
                return
            for j in range(start, len(candidates)):
                if j > start and candidates[j] == candidates[j - 1]:
                    continue
                if total + candidates[j] > target:
                    break
                cur.append(candidates[j])
                dfs(j + 1, total + candidates[j])
                cur.pop()

        dfs(0, 0)
        return res`,
    hints: ["Each element is used at most once, so after picking index j the recursion continues from j + 1.", "Sort the array so equal values sit next to each other.", "At one level of the recursion, skip a value equal to the previous sibling you already tried; that removes duplicate combinations without losing [1, 1, ...]."],
    clarify: [
      { question: "Can two equal values both be used in one combination?", answer: "Yes, if the input contains that value twice; each position is used at most once." },
      { question: "Are duplicate combinations allowed in the output?", answer: "No, each distinct multiset appears once." },
      { question: "What if nothing sums to the target?", answer: "Return an empty list." },
    ],
  },
  {
    lc: 46,
    kind: "algorithm",
    statement: `You are given an array \`nums\` of **distinct** integers. Return **every possible ordering** (permutation) of its elements.

- Each permutation uses every element exactly once.
- The permutations may be returned in any order.`,
    examples: [
      { input: "nums = [5, 8, 2]", output: "[[2, 5, 8], [2, 8, 5], [5, 2, 8], [5, 8, 2], [8, 2, 5], [8, 5, 2]]", explanation: "3 distinct values have 3! = 6 orderings." },
      { input: "nums = [-4, 4]", output: "[[-4, 4], [4, -4]]" },
    ],
    constraints: ["1 <= nums.length <= 6", "-10 <= nums[i] <= 10", "All values in nums are distinct."],
    signature: `class Solution:
    def permute(self, nums: List[int]) -> List[List[int]]:`,
    method: "permute",
    driver: `def run(ns, args):
    out = ns["Solution"]().permute(*args)
    res = sorted(list(x) for x in out)
    if len(res) <= 40:
        return res
    # large output: count, distinct count, and the first/last few entries
    return (len(res), len(set(map(tuple, res))), res[:3], res[-3:])
`,
    tests: [
      { id: "ex1", input: "[[5, 8, 2]]", expected: "[[2, 5, 8], [2, 8, 5], [5, 2, 8], [5, 8, 2], [8, 2, 5], [8, 5, 2]]", visible: true },
      { id: "ex2", input: "[[-4, 4]]", expected: "[[-4, 4], [4, -4]]", visible: true },
      { id: "one", input: "[[9]]", expected: "[[9]]", visible: false },
      { id: "neg", input: "[[-1, 0, -3]]", expected: "[[-3, -1, 0], [-3, 0, -1], [-1, -3, 0], [-1, 0, -3], [0, -3, -1], [0, -1, -3]]", visible: false },
      { id: "four", input: "[[1, 2, 3, 4]]", expected: "[[1, 2, 3, 4], [1, 2, 4, 3], [1, 3, 2, 4], [1, 3, 4, 2], [1, 4, 2, 3], [1, 4, 3, 2], [2, 1, 3, 4], [2, 1, 4, 3], [2, 3, 1, 4], [2, 3, 4, 1], [2, 4, 1, 3], [2, 4, 3, 1], [3, 1, 2, 4], [3, 1, 4, 2], [3, 2, 1, 4], [3, 2, 4, 1], [3, 4, 1, 2], [3, 4, 2, 1], [4, 1, 2, 3], [4, 1, 3, 2], [4, 2, 1, 3], [4, 2, 3, 1], [4, 3, 1, 2], [4, 3, 2, 1]]", visible: false },
      { id: "zero_one", input: "[[0, 1]]", expected: "[[0, 1], [1, 0]]", visible: false },
      { id: "five", input: "[[1, 2, 3, 4, 5]]", expected: "(120, 120, [[1, 2, 3, 4, 5], [1, 2, 3, 5, 4], [1, 2, 4, 3, 5]], [[5, 4, 2, 3, 1], [5, 4, 3, 1, 2], [5, 4, 3, 2, 1]])", visible: false },
      { id: "big", input: "[[3, -2, 7, 0, 10, -10]]", expected: "(720, 720, [[-10, -2, 0, 3, 7, 10], [-10, -2, 0, 3, 10, 7], [-10, -2, 0, 7, 3, 10]], [[10, 7, 3, -2, 0, -10], [10, 7, 3, 0, -10, -2], [10, 7, 3, 0, -2, -10]])", visible: false },
    ],
    solution: `class Solution:
    def permute(self, nums: List[int]) -> List[List[int]]:
        res, cur = [], []
        used = [False] * len(nums)

        def dfs():
            if len(cur) == len(nums):
                res.append(cur.copy())
                return
            for i in range(len(nums)):
                if used[i]:
                    continue
                used[i] = True
                cur.append(nums[i])
                dfs()
                cur.pop()
                used[i] = False

        dfs()
        return res`,
    hints: ["Order matters, so every position can hold any element that has not been placed yet.", "Track which indices are already in the current ordering (a boolean array works).", "When the current list has n elements, record a copy; on the way back, unmark and pop."],
    clarify: [
      { question: "Do the permutations need to come out in a particular order?", answer: "No, any order is fine." },
      { question: "Can nums contain duplicates?", answer: "No, all values are distinct." },
      { question: "How many results are there?", answer: "n! for n elements, at most 720 here." },
    ],
  },
  {
    lc: 90,
    kind: "algorithm",
    statement: `You are given an integer array \`nums\` that **may contain repeated values**. Return every **distinct** subset of \`nums\`.

- Two subsets are the same if they contain the same values with the same multiplicities; return each such subset once.
- The empty subset counts.
- Subsets, and the numbers inside each, may be returned in any order.`,
    examples: [
      { input: "nums = [3, 1, 3]", output: "[[], [1], [1, 3], [1, 3, 3], [3], [3, 3]]", explanation: "[1, 3] can be made with either 3, but it is listed once." },
      { input: "nums = [6, 6]", output: "[[], [6], [6, 6]]" },
    ],
    constraints: ["1 <= nums.length <= 10", "-10 <= nums[i] <= 10"],
    signature: `class Solution:
    def subsetsWithDup(self, nums: List[int]) -> List[List[int]]:`,
    method: "subsetsWithDup",
    driver: `def run(ns, args):
    out = ns["Solution"]().subsetsWithDup(*args)
    res = sorted(sorted(x) for x in out)
    if len(res) <= 40:
        return res
    # large output: count, distinct count, and the first/last few entries
    return (len(res), len(set(map(tuple, res))), res[:3], res[-3:])
`,
    tests: [
      { id: "ex1", input: "[[3, 1, 3]]", expected: "[[], [1], [1, 3], [1, 3, 3], [3], [3, 3]]", visible: true },
      { id: "ex2", input: "[[6, 6]]", expected: "[[], [6], [6, 6]]", visible: true },
      { id: "single", input: "[[0]]", expected: "[[], [0]]", visible: false },
      { id: "distinct", input: "[[1, 2, 3]]", expected: "[[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]]", visible: false },
      { id: "all_same", input: "[[4, 4, 4, 4]]", expected: "[[], [4], [4, 4], [4, 4, 4], [4, 4, 4, 4]]", visible: false },
      { id: "neg", input: "[[-1, 2, -1, 2]]", expected: "[[], [-1], [-1, -1], [-1, -1, 2], [-1, -1, 2, 2], [-1, 2], [-1, 2, 2], [2], [2, 2]]", visible: false },
      { id: "mixed", input: "[[5, 0, 5, 0, 1]]", expected: "[[], [0], [0, 0], [0, 0, 1], [0, 0, 1, 5], [0, 0, 1, 5, 5], [0, 0, 5], [0, 0, 5, 5], [0, 1], [0, 1, 5], [0, 1, 5, 5], [0, 5], [0, 5, 5], [1], [1, 5], [1, 5, 5], [5], [5, 5]]", visible: false },
      { id: "big", input: "[[4, 3, 2, 4, 3, 4, 1, 4, 3, 2]]", expected: "(120, 120, [[], [1], [1, 2]], [[4, 4], [4, 4, 4], [4, 4, 4, 4]])", visible: false },
    ],
    solution: `class Solution:
    def subsetsWithDup(self, nums: List[int]) -> List[List[int]]:
        nums.sort()
        res, cur = [], []

        def dfs(start):
            res.append(cur.copy())
            for j in range(start, len(nums)):
                if j > start and nums[j] == nums[j - 1]:
                    continue
                cur.append(nums[j])
                dfs(j + 1)
                cur.pop()

        dfs(0)
        return res`,
    hints: ["Start from the plain subsets recursion: record the current list, then extend it with each later element.", "Sort first so equal values are adjacent.", "Within one loop level, skip an element equal to the previous one you tried at that same level."],
    clarify: [
      { question: "If nums has two 3s, is [3] listed twice?", answer: "No, each distinct subset appears exactly once." },
      { question: "Does order matter?", answer: "No, neither the order of subsets nor the order inside a subset." },
      { question: "Is the empty subset included?", answer: "Yes." },
    ],
  },
  {
    lc: 79,
    kind: "algorithm",
    statement: `You are given an \`m x n\` grid \`board\` of single characters and a string \`word\`. Return \`True\` if \`word\` can be traced in the grid, otherwise \`False\`.

- A trace starts at any cell and moves step by step to a **horizontally or vertically adjacent** cell (no diagonals).
- The letters visited, in order, must spell \`word\`.
- A single cell may be used **at most once** within one trace.`,
    examples: [
      { input: "board = [[\"C\",\"A\",\"T\"],[\"X\",\"R\",\"S\"],[\"B\",\"O\",\"D\"]], word = \"CARS\"", output: "True", explanation: "C(0,0) → A(0,1) → R(1,1) → S(1,2)." },
      { input: "board = [[\"C\",\"A\",\"T\"],[\"X\",\"R\",\"S\"],[\"B\",\"O\",\"D\"]], word = \"CAB\"", output: "False", explanation: "B is not adjacent to A." },
      { input: "board = [[\"A\",\"B\"],[\"B\",\"A\"]], word = \"ABA\"", output: "True" },
    ],
    constraints: ["1 <= m, n <= 6", "1 <= word.length <= 15", "board and word contain only uppercase and lowercase English letters."],
    signature: `class Solution:
    def exist(self, board: List[List[str]], word: str) -> bool:`,
    method: "exist",
    tests: [
      { id: "ex1", input: "[[[\"C\",\"A\",\"T\"],[\"X\",\"R\",\"S\"],[\"B\",\"O\",\"D\"]], \"CARS\"]", expected: "True", visible: true },
      { id: "ex2", input: "[[[\"C\",\"A\",\"T\"],[\"X\",\"R\",\"S\"],[\"B\",\"O\",\"D\"]], \"CAB\"]", expected: "False", visible: true },
      { id: "ex3", input: "[[[\"A\",\"B\"],[\"B\",\"A\"]], \"ABA\"]", expected: "True", visible: true },
      { id: "reuse", input: "[[[\"A\",\"B\"]], \"ABA\"]", expected: "False", visible: false },
      { id: "single_yes", input: "[[[\"z\"]], \"z\"]", expected: "True", visible: false },
      { id: "single_no", input: "[[[\"z\"]], \"Z\"]", expected: "False", visible: false },
      { id: "snake", input: "[[[\"a\",\"b\",\"c\"],[\"f\",\"e\",\"d\"],[\"g\",\"h\",\"i\"]], \"abcdefghi\"]", expected: "True", visible: false },
      { id: "diag", input: "[[[\"a\",\"b\"],[\"c\",\"d\"]], \"ad\"]", expected: "False", visible: false },
      { id: "too_long", input: "[[[\"a\",\"a\"],[\"a\",\"a\"]], \"aaaaa\"]", expected: "False", visible: false },
      { id: "big", input: "[[list(\"ABABAB\") for _ in range(6)], \"ABABABABABABAB\"]", expected: "False", visible: false },
      { id: "big_no", input: "[[list(\"AAAAAA\") for _ in range(5)] + [list(\"AAAAAB\")], \"AAAAAAAAAAAAAC\"]", expected: "False", visible: false },
    ],
    solution: `class Solution:
    def exist(self, board: List[List[str]], word: str) -> bool:
        R, C = len(board), len(board[0])

        def dfs(r, c, i):
            if i == len(word):
                return True
            if r < 0 or c < 0 or r >= R or c >= C or board[r][c] != word[i]:
                return False
            tmp, board[r][c] = board[r][c], "#"
            found = (dfs(r + 1, c, i + 1) or dfs(r - 1, c, i + 1)
                     or dfs(r, c + 1, i + 1) or dfs(r, c - 1, i + 1))
            board[r][c] = tmp
            return found

        for r in range(R):
            for c in range(C):
                if dfs(r, c, 0):
                    return True
        return False`,
    hints: ["Try every cell as a starting point and run a depth-first search that matches one letter per step.", "Mark a cell as used before exploring its neighbours, and restore it when you return so other paths can use it.", "Stop a branch as soon as the current cell does not match the next letter."],
    clarify: [
      { question: "Can the trace move diagonally?", answer: "No, only up, down, left or right." },
      { question: "Can the same cell appear twice in one trace?", answer: "No." },
      { question: "Is matching case-sensitive?", answer: "Yes, 'a' and 'A' are different letters." },
    ],
  },
  {
    lc: 131,
    kind: "algorithm",
    statement: `You are given a string \`s\`. Split it into consecutive pieces so that **every piece is a palindrome** (reads the same forwards and backwards). Return **every** such way of splitting \`s\`.

- Each split is a list of the pieces in their original left-to-right order; joined together they give back \`s\`.
- The splits may be returned in any order.`,
    examples: [
      { input: "s = \"noon\"", output: "[['n', 'o', 'o', 'n'], ['n', 'oo', 'n'], ['noon']]", explanation: "Either four single letters, n|oo|n, or the whole word." },
      { input: "s = \"ab\"", output: "[['a', 'b']]" },
    ],
    constraints: ["1 <= s.length <= 16", "s contains only lowercase English letters."],
    signature: `class Solution:
    def partition(self, s: str) -> List[List[str]]:`,
    method: "partition",
    driver: `def run(ns, args):
    out = ns["Solution"]().partition(*args)
    res = sorted(list(x) for x in out)
    if len(res) <= 40:
        return res
    # large output: count, distinct count, and the first/last few entries
    return (len(res), len(set(map(tuple, res))), res[:3], res[-3:])
`,
    tests: [
      { id: "ex1", input: "[\"noon\"]", expected: "[['n', 'o', 'o', 'n'], ['n', 'oo', 'n'], ['noon']]", visible: true },
      { id: "ex2", input: "[\"ab\"]", expected: "[['a', 'b']]", visible: true },
      { id: "one", input: "[\"x\"]", expected: "[['x']]", visible: false },
      { id: "aab", input: "[\"aab\"]", expected: "[['a', 'a', 'b'], ['aa', 'b']]", visible: false },
      { id: "racecar", input: "[\"racecar\"]", expected: "[['r', 'a', 'c', 'e', 'c', 'a', 'r'], ['r', 'a', 'cec', 'a', 'r'], ['r', 'aceca', 'r'], ['racecar']]", visible: false },
      { id: "abba_c", input: "[\"abbac\"]", expected: "[['a', 'b', 'b', 'a', 'c'], ['a', 'bb', 'a', 'c'], ['abba', 'c']]", visible: false },
      { id: "distinct", input: "[\"abcd\"]", expected: "[['a', 'b', 'c', 'd']]", visible: false },
      { id: "big", input: "[\"a\" * 12]", expected: "(2048, 2048, [['a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a'], ['a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'aa'], ['a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'aa', 'a']], [['aaaaaaaaaa', 'aa'], ['aaaaaaaaaaa', 'a'], ['aaaaaaaaaaaa']])", visible: false },
    ],
    solution: `class Solution:
    def partition(self, s: str) -> List[List[str]]:
        res, part = [], []

        def dfs(i):
            if i == len(s):
                res.append(part.copy())
                return
            for j in range(i, len(s)):
                piece = s[i : j + 1]
                if piece == piece[::-1]:
                    part.append(piece)
                    dfs(j + 1)
                    part.pop()

        dfs(0)
        return res`,
    hints: ["Decide the first piece: try every prefix s[i..j] that is a palindrome.", "After choosing a piece, solve the same problem for the rest of the string starting at j + 1.", "When the start index reaches the end of the string, the current list of pieces is a complete answer."],
    clarify: [
      { question: "Is a single character a palindrome?", answer: "Yes, so splitting into single letters is always one valid answer." },
      { question: "Do the pieces have to stay in order?", answer: "Yes, inside one split they follow the string left to right; the splits themselves can come in any order." },
    ],
  },
  {
    lc: 17,
    kind: "algorithm",
    statement: `Old phone keypads map each digit from \`2\` to \`9\` to a group of letters:

| digit | letters | digit | letters |
|---|---|---|---|
| 2 | abc | 6 | mno |
| 3 | def | 7 | pqrs |
| 4 | ghi | 8 | tuv |
| 5 | jkl | 9 | wxyz |

You are given a string \`digits\` made of characters \`2\`-\`9\`. Return **every string** you could type by picking one letter for each digit, keeping the digits' order.

- The strings may be returned in any order.`,
    examples: [
      { input: "digits = \"37\"", output: "['dp', 'dq', 'dr', 'ds', 'ep', 'eq', 'er', 'es', 'fp', 'fq', 'fr', 'fs']", explanation: "3 letters for '3' times 4 letters for '7' gives 12 strings." },
      { input: "digits = \"5\"", output: "['j', 'k', 'l']" },
    ],
    constraints: ["1 <= digits.length <= 4", "Every character of digits is in the range '2' to '9'."],
    signature: `class Solution:
    def letterCombinations(self, digits: str) -> List[str]:`,
    method: "letterCombinations",
    driver: `def run(ns, args):
    out = ns["Solution"]().letterCombinations(*args)
    res = sorted(out)
    if len(res) <= 40:
        return res
    # large output: count, distinct count, and the first/last few entries
    return (len(res), len(set(map(tuple, res))), res[:3], res[-3:])
`,
    tests: [
      { id: "ex1", input: "[\"37\"]", expected: "['dp', 'dq', 'dr', 'ds', 'ep', 'eq', 'er', 'es', 'fp', 'fq', 'fr', 'fs']", visible: true },
      { id: "ex2", input: "[\"5\"]", expected: "['j', 'k', 'l']", visible: true },
      { id: "nine", input: "[\"9\"]", expected: "['w', 'x', 'y', 'z']", visible: false },
      { id: "repeat", input: "[\"22\"]", expected: "['aa', 'ab', 'ac', 'ba', 'bb', 'bc', 'ca', 'cb', 'cc']", visible: false },
      { id: "three", input: "[\"468\"]", expected: "['gmt', 'gmu', 'gmv', 'gnt', 'gnu', 'gnv', 'got', 'gou', 'gov', 'hmt', 'hmu', 'hmv', 'hnt', 'hnu', 'hnv', 'hot', 'hou', 'hov', 'imt', 'imu', 'imv', 'int', 'inu', 'inv', 'iot', 'iou', 'iov']", visible: false },
      { id: "sevens", input: "[\"77\"]", expected: "['pp', 'pq', 'pr', 'ps', 'qp', 'qq', 'qr', 'qs', 'rp', 'rq', 'rr', 'rs', 'sp', 'sq', 'sr', 'ss']", visible: false },
      { id: "mixed", input: "[\"29\"]", expected: "['aw', 'ax', 'ay', 'az', 'bw', 'bx', 'by', 'bz', 'cw', 'cx', 'cy', 'cz']", visible: false },
      { id: "big", input: "[\"7979\"]", expected: "(256, 256, ['pwpw', 'pwpx', 'pwpy'], ['szsx', 'szsy', 'szsz'])", visible: false },
    ],
    solution: `class Solution:
    def letterCombinations(self, digits: str) -> List[str]:
        if not digits:
            return []
        keys = {"2": "abc", "3": "def", "4": "ghi", "5": "jkl",
                "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz"}
        res = []

        def dfs(i, cur):
            if i == len(digits):
                res.append(cur)
                return
            for ch in keys[digits[i]]:
                dfs(i + 1, cur + ch)

        dfs(0, "")
        return res`,
    hints: ["Store the digit-to-letters table in a dictionary.", "Recurse over positions in digits: at position i, try each letter for digits[i] and move on to i + 1.", "When every digit has a letter, record the built string."],
    clarify: [
      { question: "Does '1' or '0' ever appear?", answer: "No, only digits 2 through 9." },
      { question: "Does the output order matter?", answer: "No, any order is accepted." },
      { question: "Which digits have four letters?", answer: "7 (pqrs) and 9 (wxyz); all others have three." },
    ],
  },
  {
    lc: 51,
    kind: "algorithm",
    statement: `Place \`n\` chess queens on an \`n x n\` board so that **no two queens attack each other**: no two share a row, a column, or a diagonal (in either direction). Return **every distinct placement**.

- Describe each placement as a list of \`n\` strings, one per row from top to bottom.
- In each row string, \`'Q'\` marks the queen and \`'.'\` marks an empty square.
- The placements may be returned in any order.`,
    examples: [
      { input: "n = 4", output: "[['..Q.', 'Q...', '...Q', '.Q..'], ['.Q..', '...Q', 'Q...', '..Q.']]", explanation: "There are exactly two non-attacking placements on a 4 x 4 board." },
      { input: "n = 1", output: "[['Q']]" },
    ],
    constraints: ["1 <= n <= 9"],
    signature: `class Solution:
    def solveNQueens(self, n: int) -> List[List[str]]:`,
    method: "solveNQueens",
    driver: `def run(ns, args):
    out = ns["Solution"]().solveNQueens(*args)
    res = sorted(list(x) for x in out)
    if len(res) <= 10:
        return res
    # large output: count, distinct count, validity, and the first/last few entries
    return (len(res), len(set(map(tuple, res))), all(sorted(r.index('Q') for r in b) == list(range(len(b))) and len({i - r.index('Q') for i, r in enumerate(b)}) == len(b) and len({i + r.index('Q') for i, r in enumerate(b)}) == len(b) for b in res), res[:3], res[-3:])
`,
    tests: [
      { id: "ex1", input: "[4]", expected: "[['..Q.', 'Q...', '...Q', '.Q..'], ['.Q..', '...Q', 'Q...', '..Q.']]", visible: true },
      { id: "ex2", input: "[1]", expected: "[['Q']]", visible: true },
      { id: "two", input: "[2]", expected: "[]", visible: false },
      { id: "three", input: "[3]", expected: "[]", visible: false },
      { id: "five", input: "[5]", expected: "[['....Q', '..Q..', 'Q....', '...Q.', '.Q...'], ['....Q', '.Q...', '...Q.', 'Q....', '..Q..'], ['...Q.', '.Q...', '....Q', '..Q..', 'Q....'], ['...Q.', 'Q....', '..Q..', '....Q', '.Q...'], ['..Q..', '....Q', '.Q...', '...Q.', 'Q....'], ['..Q..', 'Q....', '...Q.', '.Q...', '....Q'], ['.Q...', '....Q', '..Q..', 'Q....', '...Q.'], ['.Q...', '...Q.', 'Q....', '..Q..', '....Q'], ['Q....', '...Q.', '.Q...', '....Q', '..Q..'], ['Q....', '..Q..', '....Q', '.Q...', '...Q.']]", visible: false },
      { id: "six", input: "[6]", expected: "[['....Q.', '..Q...', 'Q.....', '.....Q', '...Q..', '.Q....'], ['...Q..', 'Q.....', '....Q.', '.Q....', '.....Q', '..Q...'], ['..Q...', '.....Q', '.Q....', '....Q.', 'Q.....', '...Q..'], ['.Q....', '...Q..', '.....Q', 'Q.....', '..Q...', '....Q.']]", visible: false },
      { id: "seven", input: "[7]", expected: "(40, 40, True, [['......Q', '....Q..', '..Q....', 'Q......', '.....Q.', '...Q...', '.Q.....'], ['......Q', '...Q...', 'Q......', '....Q..', '.Q.....', '.....Q.', '..Q....'], ['......Q', '..Q....', '.....Q.', '.Q.....', '....Q..', 'Q......', '...Q...']], [['Q......', '....Q..', '.Q.....', '.....Q.', '..Q....', '......Q', '...Q...'], ['Q......', '...Q...', '......Q', '..Q....', '.....Q.', '.Q.....', '....Q..'], ['Q......', '..Q....', '....Q..', '......Q', '.Q.....', '...Q...', '.....Q.']])", visible: false },
      { id: "big", input: "[8]", expected: "(92, 92, True, [['.......Q', '...Q....', 'Q.......', '..Q.....', '.....Q..', '.Q......', '......Q.', '....Q...'], ['.......Q', '..Q.....', 'Q.......', '.....Q..', '.Q......', '....Q...', '......Q.', '...Q....'], ['.......Q', '.Q......', '....Q...', '..Q.....', 'Q.......', '......Q.', '...Q....', '.....Q..']], [['Q.......', '......Q.', '...Q....', '.....Q..', '.......Q', '.Q......', '....Q...', '..Q.....'], ['Q.......', '.....Q..', '.......Q', '..Q.....', '......Q.', '...Q....', '.Q......', '....Q...'], ['Q.......', '....Q...', '.......Q', '.....Q..', '..Q.....', '......Q.', '.Q......', '...Q....']])", visible: false },
    ],
    solution: `class Solution:
    def solveNQueens(self, n: int) -> List[List[str]]:
        cols, pos, neg = set(), set(), set()
        board = [["."] * n for _ in range(n)]
        res = []

        def dfs(r):
            if r == n:
                res.append(["".join(row) for row in board])
                return
            for c in range(n):
                if c in cols or r + c in pos or r - c in neg:
                    continue
                cols.add(c); pos.add(r + c); neg.add(r - c)
                board[r][c] = "Q"
                dfs(r + 1)
                cols.remove(c); pos.remove(r + c); neg.remove(r - c)
                board[r][c] = "."

        dfs(0)
        return res`,
    hints: ["Every row holds exactly one queen, so recurse row by row and choose a column for each.", "Keep sets of used columns, used r + c values (one diagonal direction) and used r - c values (the other).", "Skip any column that collides with one of those sets; undo all three marks when backtracking."],
    clarify: [
      { question: "What if no placement exists (e.g. n = 2 or 3)?", answer: "Return an empty list." },
      { question: "Do diagonals mean both directions?", answer: "Yes, both the down-right and down-left diagonals." },
      { question: "Does the order of the boards matter?", answer: "No, but each board's rows must be listed top to bottom." },
    ],
  },
];
