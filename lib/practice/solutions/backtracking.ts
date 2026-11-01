/**
 * backtracking: NeetCode 150 problems, written in Jamie's format (see arrays-hashing.ts).
 * Problems:
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
import type { Solution, Variation } from "../solutions";

const kv = (o: Record<string, string>) => Object.entries(o).map(([name, value]) => ({ name, value }));

export const variations: Variation[] = [
  {
    id: "choose-from-start",
    topic: "backtracking",
    name: "Choose from index i onward",
    change: "Base pattern. Append a choice, recurse, ==pop it (undo)==. Only pick items at or after a start index, so each combination is built once in one order.",
    problems: [78, 39],
  },
  {
    id: "skip-duplicates",
    topic: "backtracking",
    name: "Sort and skip duplicates",
    change: "The input has repeats. ==Sort first, then skip a value equal to the previous sibling== (`j > start and a[j] == a[j-1]`) so the same set isn't produced twice.",
    problems: [90, 40],
  },
  {
    id: "permutations",
    topic: "backtracking",
    name: "Permutations",
    change: "Order matters, so there is no start index: every level can use ==any item not already used==, tracked with a \`used\` array.",
    problems: [46],
  },
  {
    id: "build-string",
    topic: "backtracking",
    name: "Build a string piece by piece",
    change: "Each level picks ==the next piece of a string== (a palindrome prefix, or one letter for a digit) instead of an item from a list.",
    problems: [131, 17],
  },
  {
    id: "board",
    topic: "backtracking",
    name: "Board search with constraints",
    change: "The state is a grid. ==Mark a cell (or queen) before recursing and unmark it after==, and prune any move that breaks a rule.",
    problems: [79, 51],
  },
];

export const solutions: Solution[] = [
  {
    lc: 78,
    variation: "choose-from-start",
    question: "Given a list of distinct integers, return every possible subset (including the empty one).",
    intuition: `Every node of the recursion tree is a subset. From the current subset, try adding ==each item after the last one you added==; that start index stops [2, 1] from appearing after [1, 2]. After exploring a choice, ==pop it== so the list is clean for the next sibling.`,
    algorithm: `1. Create \`res = []\` and \`cur = []\`.
2. Define \`dfs(start)\`:
   * ==Record a copy of \`cur\`== (every node is an answer).
   * For \`j\` from \`start\` to \`n - 1\`:
      * Append \`nums[j]\`, call \`dfs(j + 1)\`, then ==pop==.
3. Call \`dfs(0)\` and return \`res\`.`,
    visual: {
      kind: "graph",
      title: "Subsets · [1, 2, 3]",
      nodes: [
        { id: "r", label: "[]" },
        { id: "1", label: "[1]" },
        { id: "2", label: "[2]" },
        { id: "3", label: "[3]" },
        { id: "12", label: "[1,2]" },
        { id: "13", label: "[1,3]" },
        { id: "123", label: "[1,2,3]" },
        { id: "23", label: "[2,3]" },
      ],
      edges: [
        { from: "r", to: "1", label: "+1" },
        { from: "r", to: "2", label: "+2" },
        { from: "r", to: "3", label: "+3" },
        { from: "1", to: "12", label: "+2" },
        { from: "1", to: "13", label: "+3" },
        { from: "12", to: "123", label: "+3" },
        { from: "2", to: "23", label: "+3" },
      ],
      directed: true,
      frames: [
        { caption: "dfs(0): record [] and try 1, 2, 3 as the first pick.", pointers: [{ name: "cur", node: "r" }], highlight: ["r"], vars: kv({ res: "[[]]" }) },
        { caption: "Add 1 → record [1]. Children may only use items after 1.", pointers: [{ name: "cur", node: "1" }], highlight: ["1"], done: ["r"], vars: kv({ res: "[[], [1]]" }) },
        { caption: "Add 2 → [1,2], then 3 → [1,2,3]. Nothing left after 3.", pointers: [{ name: "cur", node: "123" }], highlight: ["12", "123"], done: ["r", "1"], vars: kv({ res: "… [1,2], [1,2,3]" }) },
        { caption: "Pop 3, pop 2, add 3 → [1,3]. Pop back to the root.", pointers: [{ name: "cur", node: "13" }], highlight: ["13"], done: ["r", "1", "12", "123"], vars: kv({ res: "… [1,3]" }) },
        { caption: "Start with 2 → [2], [2,3]. Then [3]. 8 subsets total.", pointers: [{ name: "cur", node: "3" }], highlight: ["2", "23", "3"], done: ["r", "1", "12", "123", "13"], vars: kv({ answer: "8 subsets" }) },
      ],
    },
    code: `def subsets(nums: list[int]) -> list[list[int]]:
    res, cur = [], []

    def dfs(start):
        res.append(cur.copy())
        for j in range(start, len(nums)):
            cur.append(nums[j])
            dfs(j + 1)
            cur.pop()

    dfs(0)
    return res`,
    complexity: "Time O(n · 2ⁿ) · Space O(n) recursion (besides the output)",
  },
  {
    lc: 39,
    variation: "choose-from-start",
    question: "Given distinct positive candidates and a target, list every combination that sums to the target, where a candidate may be reused.",
    intuition: `Same tree as subsets, with two changes. Reuse is allowed, so ==recurse with \`j\`, not \`j + 1\`==. And ==sort first==: once a candidate overshoots the target, every later one does too, so you can \`break\` out of the loop.`,
    algorithm: `1. Sort \`candidates\`. Create \`res = []\`, \`cur = []\`.
2. Define \`dfs(start, total)\`:
   * If \`total == target\`, record a copy of \`cur\` and return.
   * For \`j\` from \`start\`:
      * If \`total + candidates[j] > target\`, ==\`break\`== (sorted, so the rest are too big).
      * Append, call ==\`dfs(j, total + candidates[j])\`== (same \`j\`: reuse allowed), pop.
3. Call \`dfs(0, 0)\` and return \`res\`.`,
    visual: {
      kind: "graph",
      title: "Combination sum · [2, 3], target 7",
      nodes: [
        { id: "r", label: "[] 0" },
        { id: "2", label: "[2] 2" },
        { id: "3", label: "[3] 3" },
        { id: "22", label: "[2,2] 4" },
        { id: "23", label: "[2,3] 5" },
        { id: "222", label: "[2,2,2] 6" },
        { id: "223", label: "[2,2,3] 7" },
        { id: "33", label: "[3,3] 6" },
      ],
      edges: [
        { from: "r", to: "2", label: "+2" },
        { from: "r", to: "3", label: "+3" },
        { from: "2", to: "22", label: "+2" },
        { from: "2", to: "23", label: "+3" },
        { from: "22", to: "222", label: "+2" },
        { from: "22", to: "223", label: "+3" },
        { from: "3", to: "33", label: "+3" },
      ],
      directed: true,
      frames: [
        { caption: "Pick 2 (sum 2), pick 2 again (sum 4): reuse is allowed.", pointers: [{ name: "cur", node: "22" }], highlight: ["2", "22"], done: ["r"], vars: kv({ res: "[]" }) },
        { caption: "+2 → 6: room for more, but +2 → 8 and +3 → 9 both overshoot → break.", pointers: [{ name: "cur", node: "222" }], highlight: ["222"], done: ["r", "2", "22"], vars: kv({ res: "[]" }) },
        { caption: "Back at [2,2]: +3 → sum 7 = target → record [2,2,3].", pointers: [{ name: "cur", node: "223" }], highlight: ["223"], done: ["r", "2", "22", "222"], vars: kv({ res: "[[2,2,3]]" }) },
        { caption: "[2,3] = 5: +3 → 8 overshoots → break. Children start at 3, so no [3,2] later.", pointers: [{ name: "cur", node: "23" }], highlight: ["23"], done: ["r", "2", "22", "222", "223"], vars: kv({ res: "[[2,2,3]]" }) },
        { caption: "[3] → [3,3] = 6 → +3 overshoots. Done.", pointers: [{ name: "cur", node: "33" }], highlight: ["3", "33"], done: ["r", "2", "22", "222", "223", "23"], vars: kv({ answer: "[[2,2,3]]" }) },
      ],
    },
    code: `def combinationSum(candidates: list[int], target: int) -> list[list[int]]:
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
    complexity: "Time O(n^(t/m)), for target t and smallest candidate m · Space O(t/m) recursion",
  },
  {
    lc: 40,
    variation: "skip-duplicates",
    question: "Given candidates that may repeat and a target, list every distinct combination summing to the target, using each candidate at most once.",
    intuition: `Like Combination Sum, but each item is used once (==recurse with \`j + 1\`==), and equal values must not start two identical branches. After sorting, ==skip \`candidates[j]\` if it equals the one before it at the same level== (\`j > start\`). Going deeper with the duplicate is still fine.`,
    algorithm: `1. Sort \`candidates\`. Create \`res = []\`, \`cur = []\`.
2. Define \`dfs(start, total)\`:
   * If \`total == target\`, record a copy and return.
   * For \`j\` from \`start\`:
      * If ==\`j > start\` and \`candidates[j] == candidates[j - 1]\`==, \`continue\`.
      * If \`total + candidates[j] > target\`, \`break\`.
      * Append, call \`dfs(j + 1, total + candidates[j])\`, pop.
3. Call \`dfs(0, 0)\` and return \`res\`.`,
    visual: {
      kind: "graph",
      title: "Combination sum II · [1, 1, 2, 5], target 3",
      nodes: [
        { id: "r", label: "[] 0" },
        { id: "1", label: "[1] 1" },
        { id: "1dup", label: "2nd 1 skip" },
        { id: "2", label: "[2] 2" },
        { id: "11", label: "[1,1] 2" },
        { id: "12", label: "[1,2] 3" },
        { id: "112", label: "[1,1,2] 4" },
      ],
      edges: [
        { from: "r", to: "1", label: "+1" },
        { from: "r", to: "1dup", label: "+1" },
        { from: "r", to: "2", label: "+2" },
        { from: "1", to: "11", label: "+1" },
        { from: "1", to: "12", label: "+2" },
        { from: "11", to: "112", label: "+2" },
      ],
      directed: true,
      frames: [
        { caption: "Sorted: [1, 1, 2, 5]. Take the first 1 (sum 1).", pointers: [{ name: "cur", node: "1" }], highlight: ["1"], done: ["r"], vars: kv({ res: "[]" }) },
        { caption: "Going deeper with the second 1 is allowed (j == start) → [1,1]. +2 → 4 overshoots.", pointers: [{ name: "cur", node: "11" }], highlight: ["11", "112"], done: ["r", "1"], vars: kv({ res: "[]" }) },
        { caption: "Back at [1]: +2 → sum 3 → record [1,2]. +5 overshoots → break.", pointers: [{ name: "cur", node: "12" }], highlight: ["12"], done: ["r", "1", "11", "112"], vars: kv({ res: "[[1,2]]" }) },
        { caption: "At the root, the second 1 equals its left sibling → skip. It would only rebuild [1,2].", pointers: [{ name: "cur", node: "1dup" }], highlight: ["1dup"], done: ["r", "1", "11", "112", "12"], vars: kv({ res: "[[1,2]]" }) },
        { caption: "[2]: +5 overshoots. Root +5 overshoots. Done, no duplicates.", pointers: [{ name: "cur", node: "2" }], highlight: ["2"], done: ["r", "1", "11", "112", "12", "1dup"], vars: kv({ answer: "[[1,2]]" }) },
      ],
    },
    code: `def combinationSum2(candidates: list[int], target: int) -> list[list[int]]:
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
    complexity: "Time O(n · 2ⁿ) · Space O(n) recursion",
  },
  {
    lc: 46,
    variation: "permutations",
    question: "Given a list of distinct integers, return every possible ordering of them.",
    intuition: `A permutation fills positions one at a time, and ==any unused item can go next==, not just items after the last one. Keep a \`used\` array; mark an item before recursing and ==unmark it after==, so siblings can use it.`,
    algorithm: `1. Create \`res = []\`, \`cur = []\`, \`used = [False] * n\`.
2. Define \`dfs()\`:
   * If \`len(cur) == n\`, record a copy and return.
   * For each index \`i\` with ==\`used[i]\` False==:
      * Mark \`used[i]\`, append \`nums[i]\`, call \`dfs()\`.
      * Pop and ==unmark \`used[i]\`==.
3. Call \`dfs()\` and return \`res\`.`,
    visual: {
      kind: "graph",
      title: "Permutations · [1, 2, 3] (the 3 branch is folded)",
      nodes: [
        { id: "r", label: "[]" },
        { id: "1", label: "[1]" },
        { id: "2", label: "[2]" },
        { id: "3", label: "[3]" },
        { id: "12", label: "[1,2]" },
        { id: "13", label: "[1,3]" },
        { id: "123", label: "[1,2,3]" },
        { id: "132", label: "[1,3,2]" },
        { id: "21", label: "[2,1]" },
        { id: "23", label: "[2,3]" },
        { id: "213", label: "[2,1,3]" },
        { id: "231", label: "[2,3,1]" },
        { id: "31", label: "[3,1] …" },
        { id: "32", label: "[3,2] …" },
      ],
      edges: [
        { from: "r", to: "1" },
        { from: "r", to: "2" },
        { from: "r", to: "3" },
        { from: "1", to: "12" },
        { from: "1", to: "13" },
        { from: "12", to: "123" },
        { from: "13", to: "132" },
        { from: "2", to: "21" },
        { from: "2", to: "23" },
        { from: "21", to: "213" },
        { from: "23", to: "231" },
        { from: "3", to: "31" },
        { from: "3", to: "32" },
      ],
      directed: true,
      frames: [
        { caption: "Use 1. Unused: 2, 3.", pointers: [{ name: "cur", node: "1" }], highlight: ["1"], done: ["r"], vars: kv({ used: "{1}", res: "[]" }) },
        { caption: "Use 2, then 3 → full length → record [1,2,3].", pointers: [{ name: "cur", node: "123" }], highlight: ["12", "123"], done: ["r", "1"], vars: kv({ used: "{1, 2, 3}", res: "[[1,2,3]]" }) },
        { caption: "Unmark 3 and 2. Now 3 goes second → [1,3,2].", pointers: [{ name: "cur", node: "132" }], highlight: ["13", "132"], done: ["r", "1", "12", "123"], vars: kv({ used: "{1, 3, 2}", res: "… [1,3,2]" }) },
        { caption: "Unmark everything back to the root. Start with 2: 1 is free again → [2,1,3], [2,3,1].", pointers: [{ name: "cur", node: "231" }], highlight: ["2", "21", "213", "23", "231"], done: ["r", "1", "12", "123", "13", "132"], vars: kv({ res: "… [2,1,3], [2,3,1]" }) },
        { caption: "Start with 3 gives [3,1,2], [3,2,1]. 3! = 6 orderings.", pointers: [{ name: "cur", node: "3" }], highlight: ["3", "31", "32"], done: ["r", "1", "12", "123", "13", "132", "2", "21", "213", "23", "231"], vars: kv({ answer: "6 permutations" }) },
      ],
    },
    code: `def permute(nums: list[int]) -> list[list[int]]:
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
    complexity: "Time O(n · n!) · Space O(n) recursion (besides the output)",
  },
  {
    lc: 90,
    variation: "skip-duplicates",
    question: "Given a list of integers that may contain repeats, return every distinct subset.",
    intuition: `Subsets again, but two equal values would start two identical branches. ==Sort== so duplicates sit together, then at each level ==skip a value equal to its left sibling== (\`j > start\`). Taking the duplicate deeper (like [2, 2]) is still allowed.`,
    algorithm: `1. Sort \`nums\`. Create \`res = []\`, \`cur = []\`.
2. Define \`dfs(start)\`:
   * Record a copy of \`cur\`.
   * For \`j\` from \`start\`:
      * If ==\`j > start\` and \`nums[j] == nums[j - 1]\`==, \`continue\`.
      * Append \`nums[j]\`, call \`dfs(j + 1)\`, pop.
3. Call \`dfs(0)\` and return \`res\`.`,
    visual: {
      kind: "graph",
      title: "Subsets II · [1, 2, 2]",
      nodes: [
        { id: "r", label: "[]" },
        { id: "1", label: "[1]" },
        { id: "2", label: "[2]" },
        { id: "2dup", label: "2nd 2 skip" },
        { id: "12", label: "[1,2]" },
        { id: "12dup", label: "2nd 2 skip" },
        { id: "122", label: "[1,2,2]" },
        { id: "22", label: "[2,2]" },
      ],
      edges: [
        { from: "r", to: "1", label: "+1" },
        { from: "r", to: "2", label: "+2" },
        { from: "r", to: "2dup", label: "+2" },
        { from: "1", to: "12", label: "+2" },
        { from: "1", to: "12dup", label: "+2" },
        { from: "12", to: "122", label: "+2" },
        { from: "2", to: "22", label: "+2" },
      ],
      directed: true,
      frames: [
        { caption: "Record [], then [1], then [1,2] (first 2).", pointers: [{ name: "cur", node: "12" }], highlight: ["1", "12"], done: ["r"], vars: kv({ res: "[[], [1], [1,2]]" }) },
        { caption: "Deeper with the second 2 is fine (j == start) → [1,2,2].", pointers: [{ name: "cur", node: "122" }], highlight: ["122"], done: ["r", "1", "12"], vars: kv({ res: "… [1,2,2]" }) },
        { caption: "Back at [1]: the second 2 equals its left sibling → skip (it would rebuild [1,2]).", pointers: [{ name: "cur", node: "12dup" }], highlight: ["12dup"], done: ["r", "1", "12", "122"], vars: kv({ res: "… [1,2,2]" }) },
        { caption: "Root: [2], then [2,2]. The root's second 2 is skipped too.", pointers: [{ name: "cur", node: "22" }], highlight: ["2", "22", "2dup"], done: ["r", "1", "12", "122", "12dup"], vars: kv({ answer: "[[],[1],[1,2],[1,2,2],[2],[2,2]]" }) },
      ],
    },
    code: `def subsetsWithDup(nums: list[int]) -> list[list[int]]:
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
    complexity: "Time O(n · 2ⁿ) · Space O(n) recursion",
  },
  {
    lc: 79,
    variation: "board",
    question: "Given a letter grid and a word, say whether the word can be traced through side-by-side neighbouring cells without reusing a cell.",
    intuition: `Try every cell as a start and DFS in four directions, matching one letter per step. To stop a path reusing a cell, ==overwrite it with \`#\` while it's on the path== and ==restore it on the way back==, so other paths can still use it.`,
    algorithm: `1. Define \`dfs(r, c, i)\` (matched \`i\` letters so far):
   * If \`i == len(word)\`, return \`True\`.
   * If \`(r, c)\` is off the grid or \`board[r][c] != word[i]\`, return \`False\`.
   * ==Mark== \`board[r][c] = "#"\`.
   * Try the four neighbours with \`i + 1\`.
   * ==Restore== the letter and return whether any neighbour succeeded.
2. For every cell, if \`dfs(r, c, 0)\` is \`True\`, return \`True\`.
3. Return \`False\`.`,
    visual: {
      kind: "grid",
      title: "Word search · \"ADE\"",
      rows: [
        ["A", "B", "C"],
        ["B", "A", "D"],
        ["C", "D", "E"],
      ],
      frames: [
        { caption: "(0,0) = 'A' matches word[0]. Mark it.", highlight: ["0,0"], cells: [{ at: "0,0", value: "#" }], vars: kv({ i: "1", need: "D" }) },
        { caption: "Its neighbours are B and B, no 'D' → dead end. Restore 'A' and backtrack.", highlight: ["0,1", "1,0"], cells: [{ at: "0,0", value: "A" }], vars: kv({ i: "0" }) },
        { caption: "Next start that matches: (1,1) = 'A'. Mark it.", highlight: ["1,1"], cells: [{ at: "1,1", value: "#" }], vars: kv({ i: "1", need: "D" }) },
        { caption: "Neighbour (1,2) = 'D' matches. Mark it.", highlight: ["1,2"], done: ["1,1"], cells: [{ at: "1,2", value: "#" }], vars: kv({ i: "2", need: "E" }) },
        { caption: "Neighbour (2,2) = 'E' matches → all 3 letters found → True.", highlight: ["2,2"], done: ["1,1", "1,2"], vars: kv({ i: "3", answer: "True" }) },
      ],
    },
    code: `def exist(board: list[list[str]], word: str) -> bool:
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
    complexity: "Time O(R · C · 4^L) for a word of length L · Space O(L) recursion",
  },
  {
    lc: 131,
    variation: "build-string",
    question: "Given a string, list every way to cut it into pieces where each piece reads the same forwards and backwards.",
    intuition: `At position \`i\`, the next piece is some prefix \`s[i:j+1]\`. ==Only recurse when that prefix is a palindrome==; then the rest of the string is the same problem starting at \`j + 1\`. Reaching the end of the string means every piece was valid, so record the cut.`,
    algorithm: `1. Create \`res = []\`, \`part = []\`.
2. Define \`dfs(i)\`:
   * If \`i == len(s)\`, record a copy of \`part\` and return.
   * For \`j\` from \`i\` to \`len(s) - 1\`:
      * If ==\`s[i:j+1]\` is a palindrome==, append it, call \`dfs(j + 1)\`, then pop.
3. Call \`dfs(0)\` and return \`res\`.`,
    visual: {
      kind: "graph",
      title: "Palindrome partitioning · \"aab\"",
      nodes: [
        { id: "r", label: "start" },
        { id: "a", label: "a" },
        { id: "aa", label: "aa" },
        { id: "aab", label: "aab ✗" },
        { id: "a_a", label: "a|a" },
        { id: "a_ab", label: "a|ab ✗" },
        { id: "a_a_b", label: "a|a|b ✓" },
        { id: "aa_b", label: "aa|b ✓" },
      ],
      edges: [
        { from: "r", to: "a" },
        { from: "r", to: "aa" },
        { from: "r", to: "aab" },
        { from: "a", to: "a_a" },
        { from: "a", to: "a_ab" },
        { from: "a_a", to: "a_a_b" },
        { from: "aa", to: "aa_b" },
      ],
      directed: true,
      frames: [
        { caption: "i=0: \"a\" is a palindrome → take it, recurse at i=1.", pointers: [{ name: "part", node: "a" }], highlight: ["a"], done: ["r"], vars: kv({ part: "[a]" }) },
        { caption: "i=1: \"a\" again → recurse at i=2. \"b\" is a palindrome → end → record.", pointers: [{ name: "part", node: "a_a_b" }], highlight: ["a_a", "a_a_b"], done: ["r", "a"], vars: kv({ res: "[[a, a, b]]" }) },
        { caption: "Back at i=1: \"ab\" is not a palindrome → don't recurse.", pointers: [{ name: "part", node: "a_ab" }], highlight: ["a_ab"], done: ["r", "a", "a_a", "a_a_b"], vars: kv({ res: "[[a, a, b]]" }) },
        { caption: "Back at i=0: \"aa\" is a palindrome → then \"b\" → record.", pointers: [{ name: "part", node: "aa_b" }], highlight: ["aa", "aa_b"], done: ["r", "a", "a_a", "a_a_b", "a_ab"], vars: kv({ res: "[[a,a,b], [aa,b]]" }) },
        { caption: "\"aab\" is not a palindrome → pruned. Done.", pointers: [{ name: "part", node: "aab" }], highlight: ["aab"], done: ["r", "a", "a_a", "a_a_b", "a_ab", "aa", "aa_b"], vars: kv({ answer: "[[a,a,b], [aa,b]]" }) },
      ],
    },
    code: `def partition(s: str) -> list[list[str]]:
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
    complexity: "Time O(n · 2ⁿ) · Space O(n) recursion",
  },
  {
    lc: 17,
    variation: "build-string",
    question: "Given a string of phone-keypad digits 2–9, return every letter string those digits could spell.",
    intuition: `Digit \`i\` decides letter \`i\`. Each level of the tree is one digit, and its branches are ==the 3 or 4 letters on that key==. When the string is as long as the digits, it's complete. An ==empty input gives an empty list==, not [""].`,
    algorithm: `1. If \`digits\` is empty, return \`[]\`.
2. Build the keypad map \`"2" → "abc"\`, …, \`"9" → "wxyz"\`.
3. Define \`dfs(i, cur)\`:
   * If \`i == len(digits)\`, append \`cur\` and return.
   * For each letter \`ch\` in ==\`keys[digits[i]]\`==, call \`dfs(i + 1, cur + ch)\`.
4. Call \`dfs(0, "")\` and return \`res\`.`,
    visual: {
      kind: "graph",
      title: "Letter combinations · \"23\"",
      nodes: [
        { id: "r", label: "\"\"" },
        { id: "a", label: "a" },
        { id: "b", label: "b" },
        { id: "c", label: "c" },
        { id: "ad", label: "ad" },
        { id: "ae", label: "ae" },
        { id: "af", label: "af" },
        { id: "bd", label: "bd" },
        { id: "be", label: "be" },
        { id: "bf", label: "bf" },
        { id: "cd", label: "cd" },
        { id: "ce", label: "ce" },
        { id: "cf", label: "cf" },
      ],
      edges: [
        { from: "r", to: "a" },
        { from: "r", to: "b" },
        { from: "r", to: "c" },
        { from: "a", to: "ad" },
        { from: "a", to: "ae" },
        { from: "a", to: "af" },
        { from: "b", to: "bd" },
        { from: "b", to: "be" },
        { from: "b", to: "bf" },
        { from: "c", to: "cd" },
        { from: "c", to: "ce" },
        { from: "c", to: "cf" },
      ],
      directed: true,
      frames: [
        { caption: "Digit '2' → branch on a, b, c. Go into 'a'.", pointers: [{ name: "cur", node: "a" }], highlight: ["a", "b", "c"], done: ["r"], vars: kv({ i: "1", res: "[]" }) },
        { caption: "Digit '3' → d, e, f. Length 2 = len(digits) → record ad, ae, af.", pointers: [{ name: "cur", node: "af" }], highlight: ["ad", "ae", "af"], done: ["r", "a"], vars: kv({ res: "[ad, ae, af]" }) },
        { caption: "Back to the root, take 'b' → bd, be, bf.", pointers: [{ name: "cur", node: "bf" }], highlight: ["b", "bd", "be", "bf"], done: ["r", "a", "ad", "ae", "af"], vars: kv({ res: "… bd, be, bf" }) },
        { caption: "'c' → cd, ce, cf. 3 × 3 = 9 strings.", pointers: [{ name: "cur", node: "cf" }], highlight: ["c", "cd", "ce", "cf"], done: ["r", "a", "ad", "ae", "af", "b", "bd", "be", "bf"], vars: kv({ answer: "9 strings" }) },
      ],
    },
    code: `def letterCombinations(digits: str) -> list[str]:
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
    complexity: "Time O(n · 4ⁿ) · Space O(n) recursion (besides the output)",
  },
  {
    lc: 51,
    variation: "board",
    question: "Place n queens on an n×n board so no two share a row, column or diagonal, and return every such board.",
    intuition: `Place ==one queen per row==, so rows never clash. For columns and diagonals keep three sets: \`cols\`, \`r + c\` (the ↙ diagonals) and \`r - c\` (the ↘ diagonals). A square is safe ==iff its column and both diagonal keys are unused==. Add the keys before recursing and remove them after.`,
    algorithm: `1. Create sets \`cols\`, \`pos\` (\`r + c\`), \`neg\` (\`r - c\`) and an n×n \`board\` of \`"."\`.
2. Define \`dfs(r)\`:
   * If \`r == n\`, record the board as strings and return.
   * For each column \`c\`:
      * If ==\`c\` in \`cols\`, \`r + c\` in \`pos\` or \`r - c\` in \`neg\`==, skip.
      * Add the three keys, set \`board[r][c] = "Q"\`, call \`dfs(r + 1)\`.
      * ==Remove the keys and reset the square== to \`"."\`.
3. Call \`dfs(0)\` and return \`res\`.`,
    visual: {
      kind: "grid",
      title: "N-Queens · n = 4",
      rows: [
        [".", ".", ".", "."],
        [".", ".", ".", "."],
        [".", ".", ".", "."],
        [".", ".", ".", "."],
      ],
      frames: [
        { caption: "Row 0: put a queen in column 0.", highlight: ["0,0"], cells: [{ at: "0,0", value: "Q" }], vars: kv({ cols: "{0}", "r+c": "{0}", "r−c": "{0}" }) },
        { caption: "Row 1: columns 0 and 1 are attacked → place at column 2.", highlight: ["1,2"], cells: [{ at: "1,2", value: "Q" }], vars: kv({ cols: "{0, 2}", "r+c": "{0, 3}", "r−c": "{0, −1}" }) },
        { caption: "Row 2: every column is attacked → dead end. Remove (1,2), try column 3.", highlight: ["1,3"], cells: [{ at: "1,2", value: "." }, { at: "1,3", value: "Q" }], vars: kv({ cols: "{0, 3}", "r+c": "{0, 4}", "r−c": "{0, −2}" }) },
        { caption: "Row 2: column 1 is safe → place it. Row 3 is then fully attacked → backtrack.", highlight: ["2,1", "3,0", "3,1", "3,2", "3,3"], cells: [{ at: "2,1", value: "Q" }], vars: kv({ cols: "{0, 3, 1}", note: "row 3 has no safe square" }) },
        { caption: "Column 0 in row 0 never works. Clear the board, try (0,1).", highlight: ["0,1"], cells: [{ at: "0,0", value: "." }, { at: "1,3", value: "." }, { at: "2,1", value: "." }, { at: "0,1", value: "Q" }], vars: kv({ cols: "{1}" }) },
        { caption: "(1,3), (2,0), (3,2) are all safe → a full board → record it.", highlight: ["1,3", "2,0", "3,2"], done: ["0,1"], cells: [{ at: "1,3", value: "Q" }, { at: "2,0", value: "Q" }, { at: "3,2", value: "Q" }], vars: kv({ answer: ".Q.. / ...Q / Q... / ..Q." }) },
      ],
    },
    code: `def solveNQueens(n: int) -> list[list[str]]:
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
    complexity: "Time O(n!) · Space O(n²) for the board",
  },
];

/** Recognise-it cues for the Roadmap flashcards. */