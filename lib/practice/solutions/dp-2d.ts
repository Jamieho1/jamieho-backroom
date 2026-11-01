/**
 * dp-2d: NeetCode 150 problems, written in Jamie's format (see arrays-hashing.ts).
 * Problems:
 * - 62 Unique Paths (Medium)
 * - 1143 Longest Common Subsequence (Medium)
 * - 309 Best Time to Buy and Sell Stock with Cooldown (Medium)
 * - 518 Coin Change II (Medium)
 * - 494 Target Sum (Medium)
 * - 97 Interleaving String (Medium)
 * - 329 Longest Increasing Path in a Matrix (Hard)
 * - 115 Distinct Subsequences (Hard)
 * - 72 Edit Distance (Medium)
 * - 312 Burst Balloons (Hard)
 * - 10 Regular Expression Matching (Hard)
 */
import type { Solution, Variation } from "../solutions";

const kv = (o: Record<string, string>) => Object.entries(o).map(([name, value]) => ({ name, value }));
const fill = (cells: [string, string | number][]) => cells.map(([at, value]) => ({ at, value }));

export const variations: Variation[] = [
  {
    id: "grid-paths",
    topic: "dp-2d",
    name: "Grid paths",
    change: "Base pattern. The state is ==a cell `(r, c)`== and each cell is built from its neighbours (up/left, or any higher neighbour with memoised DFS).",
    problems: [62, 329],
  },
  {
    id: "two-strings",
    topic: "dp-2d",
    name: "Two-string table",
    change: "The grid is ==prefix of string A × prefix of string B==. Each cell looks at the last characters: match → diagonal, no match → up / left (and diagonal).",
    problems: [1143, 97, 115, 72, 10],
  },
  {
    id: "knapsack",
    topic: "dp-2d",
    name: "Knapsack (items × amount)",
    change: "Rows are ==items used so far==, columns are a running total. Unbounded (reuse a coin) or 0/1 (each number once, + or −); usually squashed to one row.",
    problems: [518, 494],
  },
  {
    id: "state-machine",
    topic: "dp-2d",
    name: "State machine",
    change: "The second dimension is ==a small set of states== (holding, just sold, resting) instead of a position; each day moves between them.",
    problems: [309],
  },
  {
    id: "interval",
    topic: "dp-2d",
    name: "Interval DP",
    change: "The state is ==a range `[l, r]`== and you try every split point `k` inside it, filling short ranges before long ones.",
    problems: [312],
  },
];

export const solutions: Solution[] = [
  {
    lc: 62,
    variation: "grid-paths",
    question: "A robot starts top-left of an m × n grid and only steps right or down; count the distinct routes to the bottom-right.",
    intuition: `The last step into a cell came either from above or from the left, so ==paths to \`(r, c)\` = paths to the cell above + paths to the cell on the left==. The top row and left column have exactly one path each (a straight line). Fill the grid row by row and read the corner.`,
    algorithm: `1. Create \`dp\` as an \`m × n\` grid of 1s (first row and first column are 1).
2. For each \`r\` from 1 to \`m - 1\`:
   * For each \`c\` from 1 to \`n - 1\`:
      * ==\`dp[r][c] = dp[r - 1][c] + dp[r][c - 1]\`==.
3. Return \`dp[m - 1][n - 1]\`.`,
    visual: {
      kind: "grid",
      title: "Unique paths · 3 × 3 grid",
      rows: [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""],
      ],
      frames: [
        { caption: "First row and first column: only one straight path each → 1.", cells: fill([["0,0", 1], ["0,1", 1], ["0,2", 1], ["1,0", 1], ["2,0", 1]]), highlight: ["0,1", "0,2", "1,0", "2,0"] },
        { caption: "(1,1) = above 1 + left 1 = 2.", cells: fill([["1,1", 2]]), highlight: ["1,1", "0,1", "1,0"] },
        { caption: "(1,2) = above 1 + left 2 = 3.", cells: fill([["1,2", 3]]), highlight: ["1,2", "0,2", "1,1"] },
        { caption: "(2,1) = above 2 + left 1 = 3.", cells: fill([["2,1", 3]]), highlight: ["2,1", "1,1", "2,0"] },
        { caption: "(2,2) = above 3 + left 3 = 6 routes to the corner.", cells: fill([["2,2", 6]]), highlight: ["2,2", "1,2", "2,1"], vars: kv({ answer: "6" }) },
      ],
    },
    code: `def uniquePaths(m: int, n: int) -> int:
    dp = [[1] * n for _ in range(m)]
    for r in range(1, m):
        for c in range(1, n):
            dp[r][c] = dp[r - 1][c] + dp[r][c - 1]
    return dp[m - 1][n - 1]`,
    complexity: "Time O(m · n) · Space O(m · n) (one row is enough: O(n))",
  },
  {
    lc: 1143,
    variation: "two-strings",
    question: "Given two strings, return the length of the longest sequence of characters that appears in both in the same order (gaps allowed).",
    intuition: `Let \`dp[i][j]\` be the answer for the first \`i\` chars of \`a\` and the first \`j\` chars of \`b\`. If the ==last characters match, they extend the diagonal: \`dp[i-1][j-1] + 1\`==. If not, one of them is useless at the end, so take the better of dropping either: \`max(up, left)\`.`,
    algorithm: `1. Create \`dp\` of size \`(m + 1) × (n + 1)\` filled with 0 (row/column 0 = empty prefix).
2. ==\`dp[i][j]\` = LCS of \`a[:i]\` and \`b[:j]\`==.
3. For \`i\` from 1 to \`m\`, \`j\` from 1 to \`n\`:
   * If \`a[i - 1] == b[j - 1]\`: ==\`dp[i][j] = dp[i - 1][j - 1] + 1\`==.
   * Else: \`dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])\`.
4. Return \`dp[m][n]\`.`,
    visual: {
      kind: "grid",
      title: "LCS · \"abcd\" vs \"acbd\"",
      rows: [
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
      ],
      rowLabels: ["∅", "a", "b", "c", "d"],
      colLabels: ["∅", "a", "c", "b", "d"],
      frames: [
        { caption: "Empty prefix on either side → LCS 0.", cells: fill([["0,0", 0], ["0,1", 0], ["0,2", 0], ["0,3", 0], ["0,4", 0], ["1,0", 0], ["2,0", 0], ["3,0", 0], ["4,0", 0]]) },
        { caption: "Row 'a': a = a → diagonal 0 + 1 = 1; the rest of the row carries 1 from the left.", cells: fill([["1,1", 1], ["1,2", 1], ["1,3", 1], ["1,4", 1]]), highlight: ["1,1", "0,0"] },
        { caption: "Row 'b': b matches column b → diagonal 1 + 1 = 2.", cells: fill([["2,1", 1], ["2,2", 1], ["2,3", 2], ["2,4", 2]]), highlight: ["2,3", "1,2"], vars: kv({ best: "2 (\"ab\")" }) },
        { caption: "Row 'c': c matches column c → diagonal 1 + 1 = 2; other cells take max(up, left).", cells: fill([["3,1", 1], ["3,2", 2], ["3,3", 2], ["3,4", 2]]), highlight: ["3,2", "2,1"], vars: kv({ best: "2" }) },
        { caption: "Row 'd': d = d → diagonal dp[3][3] = 2, plus 1 = 3.", cells: fill([["4,1", 1], ["4,2", 2], ["4,3", 2], ["4,4", 3]]), highlight: ["4,4", "3,3"], vars: kv({ answer: "3 (\"abd\" or \"acd\")" }) },
      ],
    },
    code: `def longestCommonSubsequence(text1: str, text2: str) -> int:
    m, n = len(text1), len(text2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i - 1] == text2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]`,
    complexity: "Time O(m · n) · Space O(m · n)",
  },
  {
    lc: 309,
    variation: "state-machine",
    question: "Given daily stock prices, find the best total profit from any number of trades, where you must wait one day after selling before buying again.",
    intuition: `Each day you're in one of ==three states: \`hold\` (own a share), \`sold\` (sold today) or \`rest\` (no share, free to buy)==. Track the best profit for each. The cooldown is built in: you can only buy from \`rest\`, and \`sold\` only turns into \`rest\` the next day.`,
    algorithm: `1. Start with \`hold = -inf\`, \`sold = 0\`, \`rest = 0\`.
2. For each price \`p\`, update all three from yesterday's values (at once):
   * ==\`hold = max(hold, rest - p)\`== (keep holding, or buy from rest).
   * \`sold = hold + p\` (sell what you held).
   * \`rest = max(rest, sold)\` (stay idle, or yesterday's sale cooled down).
3. Return \`max(sold, rest)\`.`,
    visual: {
      kind: "array",
      title: "Stock with cooldown · [1, 3, 0, 2]",
      values: [1, 3, 0, 2],
      frames: [
        { caption: "Day 0 (1): buy from rest → hold = −1.", pointers: [{ name: "day", index: 0 }], highlight: [0], vars: kv({ hold: "-1", sold: "-inf", rest: "0" }) },
        { caption: "Day 1 (3): selling gives sold = −1 + 3 = 2. Keep hold at −1.", pointers: [{ name: "day", index: 1 }], highlight: [1], done: [0], vars: kv({ hold: "-1", sold: "2", rest: "0" }) },
        { caption: "Day 2 (0): buying uses yesterday's rest (0), not the sale → cooldown. hold = 0, rest picks up 2.", pointers: [{ name: "day", index: 2 }], highlight: [2], done: [0, 1], vars: kv({ hold: "0", sold: "-1", rest: "2" }) },
        { caption: "Day 3 (2): sold = 0 + 2 = 2, rest stays 2.", pointers: [{ name: "day", index: 3 }], highlight: [3], done: [0, 1, 2], vars: kv({ hold: "0", sold: "2", rest: "2" }) },
        { caption: "Answer max(sold, rest) = 2. Without the cooldown it would be 4.", done: [0, 1, 2, 3], vars: kv({ answer: "2" }) },
      ],
    },
    code: `def maxProfit(prices: list[int]) -> int:
    hold, sold, rest = float("-inf"), 0, 0
    for p in prices:
        hold, sold, rest = max(hold, rest - p), hold + p, max(rest, sold)
    return max(sold, rest)`,
    complexity: "Time O(n) · Space O(1)",
  },
  {
    lc: 518,
    variation: "knapsack",
    question: "Given coin values (unlimited of each) and a target amount, count the different combinations of coins that make it exactly.",
    intuition: `\`dp[a]\` = number of ways to make \`a\`. Put ==coins in the outer loop==: after processing a coin, \`dp\` only counts combinations of coins up to that one, so order never matters (1+2 and 2+1 count once). Looping \`a\` upward lets a coin be reused.`,
    algorithm: `1. Create \`dp = [0] * (amount + 1)\` with \`dp[0] = 1\` (one way to make 0: no coins).
2. ==\`dp[a]\` = ways to make \`a\` with the coins seen so far==.
3. For each \`coin\` (outer loop):
   * For \`a\` from \`coin\` up to \`amount\`:
      * ==\`dp[a] += dp[a - coin]\`== (add the ways that end with this coin).
4. Return \`dp[amount]\`.`,
    visual: {
      kind: "array",
      title: "Coin change II · amount 4, coins [1, 2, 3]",
      values: [1, 0, 0, 0, 0],
      frames: [
        { caption: "dp[0] = 1: the empty combination. Index = amount.", highlight: [0], vars: kv({ coin: "–" }) },
        { caption: "Coin 1: every amount has one way (all 1s).", values: [1, 1, 1, 1, 1], highlight: [1, 2, 3, 4], vars: kv({ coin: "1" }) },
        { caption: "Coin 2: dp[2] += dp[0] → 2, dp[3] += dp[1] → 2, dp[4] += dp[2] → 3.", values: [1, 1, 2, 2, 3], highlight: [2, 3, 4], vars: kv({ coin: "2" }) },
        { caption: "Coin 3: dp[3] += dp[0] → 3, dp[4] += dp[1] → 4.", values: [1, 1, 2, 3, 4], pointers: [{ name: "a", index: 4 }], highlight: [3, 4], vars: kv({ coin: "3" }) },
        { caption: "4 ways: 1+1+1+1, 1+1+2, 2+2, 1+3.", values: [1, 1, 2, 3, 4], done: [4], vars: kv({ answer: "4" }) },
      ],
    },
    code: `def change(amount: int, coins: list[int]) -> int:
    dp = [0] * (amount + 1)
    dp[0] = 1
    for coin in coins:
        for a in range(coin, amount + 1):
            dp[a] += dp[a - coin]
    return dp[amount]`,
    complexity: "Time O(amount · coins) · Space O(amount)",
  },
  {
    lc: 494,
    variation: "knapsack",
    question: "Put a + or − in front of every number in a list; count how many sign choices make the total equal a target.",
    intuition: `Process numbers one at a time and keep a map ==running sum → number of ways to reach it==. Each number splits every sum into \`sum + n\` and \`sum − n\`. Many sign choices land on the same sum, so the map stays small (at most \`2 · total + 1\` keys).`,
    algorithm: `1. Start with \`dp = {0: 1}\` (one way to have sum 0 before any number).
2. For each \`n\` in \`nums\`:
   * Create an empty \`nxt\` (default 0).
   * For each \`(s, ways)\` in \`dp\`:
      * ==\`nxt[s + n] += ways\` and \`nxt[s - n] += ways\`==.
   * Set \`dp = nxt\`.
3. Return \`dp.get(target, 0)\`.`,
    visual: {
      kind: "array",
      title: "Target sum · [1, 2, 1], target 2",
      values: [1, 2, 1],
      frames: [
        { caption: "Before any number: sum 0, one way.", vars: kv({ dp: "{0:1}" }) },
        { caption: "n = 1: 0 splits into +1 and −1.", pointers: [{ name: "i", index: 0 }], highlight: [0], vars: kv({ dp: "{1:1, -1:1}" }) },
        { caption: "n = 2: each sum splits again → 4 sums.", pointers: [{ name: "i", index: 1 }], highlight: [1], done: [0], vars: kv({ dp: "{3:1, -1:1, 1:1, -3:1}" }) },
        { caption: "n = 1: 3−1 and 1+1 both land on 2 → their ways add up.", pointers: [{ name: "i", index: 2 }], highlight: [2], done: [0, 1], vars: kv({ dp: "{4:1, 2:2, 0:2, -2:2, -4:1}" }) },
        { caption: "dp[2] = 2: +1+2−1 and −1+2+1.", done: [0, 1, 2], vars: kv({ answer: "2" }) },
      ],
    },
    code: `from collections import defaultdict

def findTargetSumWays(nums: list[int], target: int) -> int:
    dp = {0: 1}
    for n in nums:
        nxt = defaultdict(int)
        for s, ways in dp.items():
            nxt[s + n] += ways
            nxt[s - n] += ways
        dp = nxt
    return dp.get(target, 0)`,
    complexity: "Time O(n · total) · Space O(total)",
  },
  {
    lc: 97,
    variation: "two-strings",
    question: "Given strings s1, s2 and s3, say whether s3 can be made by weaving s1 and s2 together while keeping each one's character order.",
    intuition: `If you've used \`i\` chars of \`s1\` and \`j\` of \`s2\`, you've built exactly \`s3[:i + j]\`. So ==\`dp[i][j]\` = can the first \`i\` of \`s1\` and first \`j\` of \`s2\` form \`s3[:i + j]\`==. The last char came from \`s1\` (look up) or from \`s2\` (look left), and it must equal \`s3[i + j - 1]\`.`,
    algorithm: `1. If \`len(s1) + len(s2) != len(s3)\`, return \`False\`.
2. Create \`dp\` of size \`(m + 1) × (n + 1)\` filled with \`False\`; \`dp[0][0] = True\`.
3. For each \`i\` from 0 to \`m\`, \`j\` from 0 to \`n\` (skip \`(0, 0)\`):
   * ==From above: \`i > 0 and dp[i - 1][j] and s1[i - 1] == s3[i + j - 1]\`==.
   * From the left: \`j > 0 and dp[i][j - 1] and s2[j - 1] == s3[i + j - 1]\`.
   * \`dp[i][j]\` is \`True\` if either holds.
4. Return \`dp[m][n]\`.`,
    visual: {
      kind: "grid",
      title: "Interleaving · s1 \"ab\", s2 \"cd\", s3 \"acbd\"",
      rows: [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""],
      ],
      rowLabels: ["∅", "a", "b"],
      colLabels: ["∅", "c", "d"],
      frames: [
        { caption: "dp[0][0] = T: nothing used builds the empty prefix.", cells: fill([["0,0", "T"]]), highlight: ["0,0"] },
        { caption: "Row 0 uses only s2: 'c' ≠ s3[0] 'a' → F, and everything after is F.", cells: fill([["0,1", "F"], ["0,2", "F"]]), highlight: ["0,1", "0,2"] },
        { caption: "Column 0 uses only s1: 'a' = s3[0] → T; then 'b' ≠ s3[1] 'c' → F.", cells: fill([["1,0", "T"], ["2,0", "F"]]), highlight: ["1,0", "2,0"] },
        { caption: "(1,1): from the left dp[1][0] = T and s2 'c' = s3[1] → T (\"ac\").", cells: fill([["1,1", "T"]]), highlight: ["1,1", "1,0"] },
        { caption: "(1,2): 'd' ≠ s3[2] 'b' → F. (2,1): from above T and s1 'b' = s3[2] → T (\"acb\").", cells: fill([["1,2", "F"], ["2,1", "T"]]), highlight: ["2,1", "1,1"] },
        { caption: "(2,2): from the left T and s2 'd' = s3[3] → T. s3 is an interleaving.", cells: fill([["2,2", "T"]]), highlight: ["2,2", "2,1"], vars: kv({ answer: "True" }) },
      ],
    },
    code: `def isInterleave(s1: str, s2: str, s3: str) -> bool:
    m, n = len(s1), len(s2)
    if m + n != len(s3):
        return False
    dp = [[False] * (n + 1) for _ in range(m + 1)]
    dp[0][0] = True
    for i in range(m + 1):
        for j in range(n + 1):
            if i == 0 and j == 0:
                continue
            k = i + j - 1
            up = i > 0 and dp[i - 1][j] and s1[i - 1] == s3[k]
            left = j > 0 and dp[i][j - 1] and s2[j - 1] == s3[k]
            dp[i][j] = up or left
    return dp[m][n]`,
    complexity: "Time O(m · n) · Space O(m · n)",
  },
  {
    lc: 329,
    variation: "grid-paths",
    question: "Given a grid of integers, return the length of the longest path that only moves up/down/left/right to strictly bigger values.",
    intuition: `The longest path from a cell is ==1 + the best of its strictly larger neighbours==. Strictly increasing means no cycles, so the answer per cell never changes: compute it once with DFS and ==memoise it==. Every cell is solved once, so the whole grid is O(m · n).`,
    algorithm: `1. Create \`memo = {}\`.
2. Define \`dfs(r, c)\` = longest increasing path starting at \`(r, c)\`:
   * If \`(r, c)\` is in \`memo\`, return it.
   * Start \`best = 1\`.
   * For each of the 4 neighbours \`(nr, nc)\` inside the grid with a ==bigger value==:
      * \`best = max(best, 1 + dfs(nr, nc))\`.
   * ==Store \`memo[(r, c)] = best\`== and return it.
3. Return the max of \`dfs(r, c)\` over every cell.`,
    visual: {
      kind: "grid",
      title: "Longest increasing path · cell shows value (path length)",
      rows: [
        [3, 1, 4],
        [2, 5, 6],
        [1, 2, 9],
      ],
      frames: [
        { caption: "dfs(0,0) on 3: no bigger neighbour (1 and 2) → length 1.", cells: fill([["0,0", "3 (1)"]]), highlight: ["0,0"] },
        { caption: "dfs(0,1) on 1 recurses down to 5 → 6 → 9. 9 is a peak: length 1, so 6 gets 2 and 5 gets 3.", cells: fill([["2,2", "9 (1)"], ["1,2", "6 (2)"], ["1,1", "5 (3)"]]), highlight: ["1,1", "1,2", "2,2"], done: ["0,0"] },
        { caption: "Also from 1: right to 4 → 6 (memo 2) gives 4 length 3. Best for 1 is 1 + 3 = 4.", cells: fill([["0,2", "4 (3)"], ["0,1", "1 (4)"]]), highlight: ["0,1", "0,2"], done: ["0,0", "1,1", "1,2", "2,2"] },
        { caption: "dfs(1,0) on 2: up to 3 (memo 1) or right to 5 (memo 3) → 4. No recomputation.", cells: fill([["1,0", "2 (4)"]]), highlight: ["1,0", "1,1"], done: ["0,0", "0,1", "0,2", "1,1", "1,2", "2,2"] },
        { caption: "dfs(2,0) on 1: up to 2 (memo 4) → 5. dfs(2,1) on 2: 5 (memo 3) → 4.", cells: fill([["2,0", "1 (5)"], ["2,1", "2 (4)"]]), highlight: ["2,0", "1,0"], done: ["0,0", "0,1", "0,2", "1,0", "1,1", "1,2", "2,2"], vars: kv({ best: "5" }) },
        { caption: "Longest path 1 → 2 → 5 → 6 → 9, length 5.", highlight: ["2,0", "1,0", "1,1", "1,2", "2,2"], vars: kv({ answer: "5" }) },
      ],
    },
    code: `def longestIncreasingPath(matrix: list[list[int]]) -> int:
    rows, cols = len(matrix), len(matrix[0])
    memo = {}

    def dfs(r, c):
        if (r, c) in memo:
            return memo[(r, c)]
        best = 1
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and matrix[nr][nc] > matrix[r][c]:
                best = max(best, 1 + dfs(nr, nc))
        memo[(r, c)] = best
        return best

    return max(dfs(r, c) for r in range(rows) for c in range(cols))`,
    complexity: "Time O(m · n) · Space O(m · n)",
  },
  {
    lc: 115,
    variation: "two-strings",
    question: "Given strings s and t, count how many different ways you can delete characters from s so that what remains is exactly t.",
    intuition: `\`dp[i][j]\` = ways to form \`t[:j]\` from \`s[:i]\`. The char \`s[i-1]\` can always be ==skipped (\`dp[i-1][j]\`)==; if it equals \`t[j-1]\` it can also be ==used to match (\`dp[i-1][j-1]\`)==, and the two counts add. An empty \`t\` can be formed exactly one way from anything.`,
    algorithm: `1. Create \`dp\` of size \`(m + 1) × (n + 1)\` filled with 0; set \`dp[i][0] = 1\` for every \`i\`.
2. ==\`dp[i][j]\` = ways \`s[:i]\` contains \`t[:j]\` as a subsequence==.
3. For \`i\` from 1 to \`m\`, \`j\` from 1 to \`n\`:
   * \`dp[i][j] = dp[i - 1][j]\` (skip \`s[i - 1]\`).
   * If \`s[i - 1] == t[j - 1]\`: ==\`dp[i][j] += dp[i - 1][j - 1]\`== (use it).
4. Return \`dp[m][n]\`.`,
    visual: {
      kind: "grid",
      title: "Distinct subsequences · s \"aabb\", t \"ab\"",
      rows: [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""],
        ["", "", ""],
        ["", "", ""],
      ],
      rowLabels: ["∅", "a", "a", "b", "b"],
      colLabels: ["∅", "a", "b"],
      frames: [
        { caption: "Column ∅: one way to make an empty t (delete everything). Row ∅: can't make a non-empty t.", cells: fill([["0,0", 1], ["1,0", 1], ["2,0", 1], ["3,0", 1], ["4,0", 1], ["0,1", 0], ["0,2", 0]]) },
        { caption: "First 'a': skip (0) + use it for 'a' (1) → 1. Can't make \"ab\" yet → 0.", cells: fill([["1,1", 1], ["1,2", 0]]), highlight: ["1,1", "0,0"] },
        { caption: "Second 'a': skip (1) + use (1) → 2 ways to pick an 'a'.", cells: fill([["2,1", 2], ["2,2", 0]]), highlight: ["2,1", "1,1", "1,0"] },
        { caption: "First 'b': column a just copies 2. Column b: skip (0) + use after an 'a' (2) → 2.", cells: fill([["3,1", 2], ["3,2", 2]]), highlight: ["3,2", "2,1"] },
        { caption: "Second 'b': skip (2) + use (2) → 4 ways to form \"ab\".", cells: fill([["4,1", 2], ["4,2", 4]]), highlight: ["4,2", "3,2", "3,1"], vars: kv({ answer: "4" }) },
      ],
    },
    code: `def numDistinct(s: str, t: str) -> int:
    m, n = len(s), len(t)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = 1
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            dp[i][j] = dp[i - 1][j]
            if s[i - 1] == t[j - 1]:
                dp[i][j] += dp[i - 1][j - 1]
    return dp[m][n]`,
    complexity: "Time O(m · n) · Space O(m · n)",
  },
  {
    lc: 72,
    variation: "two-strings",
    question: "Return the fewest single-character inserts, deletes or replacements needed to turn one word into another.",
    intuition: `\`dp[i][j]\` = cost to turn \`a[:i]\` into \`b[:j]\`. If the ==last characters match, they cost nothing: take the diagonal==. Otherwise pay 1 for the cheapest of delete (up), insert (left) or replace (diagonal). Turning a prefix into the empty string costs its length.`,
    algorithm: `1. Create \`dp\` of size \`(m + 1) × (n + 1)\`; \`dp[i][0] = i\`, \`dp[0][j] = j\`.
2. ==\`dp[i][j]\` = edits to turn \`word1[:i]\` into \`word2[:j]\`==.
3. For \`i\` from 1 to \`m\`, \`j\` from 1 to \`n\`:
   * If \`word1[i - 1] == word2[j - 1]\`: \`dp[i][j] = dp[i - 1][j - 1]\`.
   * Else: ==\`dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])\`== (delete, insert, replace).
4. Return \`dp[m][n]\`.`,
    visual: {
      kind: "grid",
      title: "Edit distance · \"abc\" → \"yabd\"",
      rows: [
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
      ],
      rowLabels: ["∅", "a", "b", "c"],
      colLabels: ["∅", "y", "a", "b", "d"],
      frames: [
        { caption: "Edges: from empty you insert j chars; to empty you delete i chars.", cells: fill([["0,0", 0], ["0,1", 1], ["0,2", 2], ["0,3", 3], ["0,4", 4], ["1,0", 1], ["2,0", 2], ["3,0", 3]]) },
        { caption: "Row 'a': 'a' vs 'y' → 1 + min = 1. 'a' = 'a' → diagonal dp[0][1] = 1 (just insert y).", cells: fill([["1,1", 1], ["1,2", 1], ["1,3", 2], ["1,4", 3]]), highlight: ["1,2", "0,1"] },
        { caption: "Row 'b': 'b' = 'b' at column 3 → diagonal dp[1][2] = 1. \"ab\" → \"yab\" is one insert.", cells: fill([["2,1", 2], ["2,2", 2], ["2,3", 1], ["2,4", 2]]), highlight: ["2,3", "1,2"] },
        { caption: "Row 'c': (3,4) 'c' ≠ 'd' → 1 + min(up 2, left 2, diag 1) = 2 (replace c with d).", cells: fill([["3,1", 3], ["3,2", 3], ["3,3", 2], ["3,4", 2]]), highlight: ["3,4", "2,3"], vars: kv({ answer: "2" }) },
      ],
    },
    code: `def minDistance(word1: str, word2: str) -> int:
    m, n = len(word1), len(word2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if word1[i - 1] == word2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    return dp[m][n]`,
    complexity: "Time O(m · n) · Space O(m · n)",
  },
  {
    lc: 312,
    variation: "interval",
    question: "Popping a balloon earns left neighbour × it × right neighbour (missing neighbours count as 1); find the most coins from popping them all.",
    intuition: `Choosing the first balloon to pop changes everyone's neighbours, which is messy. Instead pick the ==last balloon \`k\` to pop in the range \`[l, r]\`==: when it pops, its neighbours are the fixed walls \`l - 1\` and \`r + 1\`, and the two sides were solved independently. Pad the list with 1s and fill short ranges first.`,
    algorithm: `1. Pad: \`nums = [1] + nums + [1]\`; create \`dp\` of size \`(n + 2) × (n + 2)\` filled with 0.
2. ==\`dp[l][r]\` = best coins from popping every balloon in \`l..r\`==.
3. For \`length\` from 1 to \`n\`, for each \`l\` (with \`r = l + length - 1\`):
   * For each \`k\` from \`l\` to \`r\` (popped last):
      * ==\`coins = nums[l - 1] * nums[k] * nums[r + 1] + dp[l][k - 1] + dp[k + 1][r]\`==.
      * \`dp[l][r] = max(dp[l][r], coins)\`.
4. Return \`dp[1][n]\`.`,
    visual: {
      kind: "grid",
      title: "Burst balloons · [2, 4, 3] → best coins for each range l..r",
      rows: [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""],
      ],
      rowLabels: ["l: 2", "l: 4", "l: 3"],
      colLabels: ["r: 2", "r: 4", "r: 3"],
      frames: [
        { caption: "Length 1: a lone balloon pops between its walls: 1·2·4 = 8, 2·4·3 = 24, 4·3·1 = 12.", cells: fill([["0,0", 8], ["1,1", 24], ["2,2", 12]]), highlight: ["0,0", "1,1", "2,2"], vars: kv({ padded: "[1, 2, 4, 3, 1]" }) },
        { caption: "[2, 4]: 2 last → 1·2·3 + dp[4] 24 = 30 beats 4 last (1·4·3 + 8 = 20).", cells: fill([["0,1", 30]]), highlight: ["0,1", "1,1"], vars: kv({ "k=2 last": "30", "k=4 last": "20" }) },
        { caption: "[4, 3]: 3 last → 2·3·1 + dp[4] 24 = 30 beats 4 last (2·4·1 + 12 = 20).", cells: fill([["1,2", 30]]), highlight: ["1,2", "1,1"], vars: kv({ "k=4 last": "20", "k=3 last": "30" }) },
        { caption: "Whole row: try each last balloon. 3 last → 1·3·1 + dp[2,4] 30 = 33 is the best.", cells: fill([["0,2", 33]]), highlight: ["0,2", "0,1"], vars: kv({ "k=2": "32", "k=4": "24", "k=3": "33", answer: "33" }) },
      ],
    },
    code: `def maxCoins(nums: list[int]) -> int:
    n = len(nums)
    nums = [1] + nums + [1]
    dp = [[0] * (n + 2) for _ in range(n + 2)]
    for length in range(1, n + 1):
        for l in range(1, n - length + 2):
            r = l + length - 1
            for k in range(l, r + 1):
                coins = nums[l - 1] * nums[k] * nums[r + 1] + dp[l][k - 1] + dp[k + 1][r]
                dp[l][r] = max(dp[l][r], coins)
    return dp[1][n]`,
    complexity: "Time O(n³) · Space O(n²)",
  },
  {
    lc: 10,
    variation: "two-strings",
    question: "Say whether a pattern with '.' (any one char) and 'x*' (zero or more of x) matches the whole string.",
    intuition: `\`dp[i][j]\` = does \`p[:j]\` match \`s[:i]\`. A normal char or \`.\` must match the last char of \`s\` and hand off to the diagonal. For \`x*\` there are two choices: ==use it zero times (\`dp[i][j-2]\`) or, if \`x\` matches \`s[i-1]\`, eat one more char and stay on the star (\`dp[i-1][j]\`)==.`,
    algorithm: `1. Create \`dp\` of size \`(m + 1) × (n + 1)\` filled with \`False\`; \`dp[0][0] = True\`.
2. ==\`dp[i][j]\` = \`s[:i]\` matches \`p[:j]\`==. \`match(i, j)\` means \`i > 0\` and \`p[j - 1]\` is \`s[i - 1]\` or \`.\`.
3. For \`i\` from 0 to \`m\`, \`j\` from 1 to \`n\`:
   * If \`p[j - 1] == "*"\`:
      * ==\`dp[i][j] = dp[i][j - 2] or (match(i, j - 1) and dp[i - 1][j])\`==.
   * Else: \`dp[i][j] = match(i, j) and dp[i - 1][j - 1]\`.
4. Return \`dp[m][n]\`.`,
    visual: {
      kind: "grid",
      title: "Regex · s \"aab\", p \"b*a*b\"",
      rows: [
        ["", "", "", "", "", ""],
        ["", "", "", "", "", ""],
        ["", "", "", "", "", ""],
        ["", "", "", "", "", ""],
      ],
      rowLabels: ["∅", "a", "a", "b"],
      colLabels: ["∅", "b", "*", "a", "*", "b"],
      frames: [
        { caption: "Empty s: \"b*\" and \"b*a*\" can vanish (use zero times) → T; anything ending in a plain char → F.", cells: fill([["0,0", "T"], ["0,1", "F"], ["0,2", "T"], ["0,3", "F"], ["0,4", "T"], ["0,5", "F"]]), highlight: ["0,2", "0,4"] },
        { caption: "s \"a\": 'b' and \"b*\" can't match 'a'. Column a: diagonal dp[0][2] T → T. Column a*: eat 'a', stay on star: dp[0][4] T → T.", cells: fill([["1,0", "F"], ["1,1", "F"], ["1,2", "F"], ["1,3", "T"], ["1,4", "T"], ["1,5", "F"]]), highlight: ["1,3", "1,4", "0,4"] },
        { caption: "s \"aa\": only a* can take the second 'a': dp[1][4] T → T.", cells: fill([["2,0", "F"], ["2,1", "F"], ["2,2", "F"], ["2,3", "F"], ["2,4", "T"], ["2,5", "F"]]), highlight: ["2,4", "1,4"] },
        { caption: "s \"aab\": last 'b' matches p's 'b' and diagonal dp[2][4] is T → T.", cells: fill([["3,0", "F"], ["3,1", "F"], ["3,2", "F"], ["3,3", "F"], ["3,4", "F"], ["3,5", "T"]]), highlight: ["3,5", "2,4"], vars: kv({ answer: "True" }) },
      ],
    },
    code: `def isMatch(s: str, p: str) -> bool:
    m, n = len(s), len(p)
    dp = [[False] * (n + 1) for _ in range(m + 1)]
    dp[0][0] = True

    def match(i, j):  # does p[j - 1] match s[i - 1]?
        return i > 0 and (p[j - 1] == s[i - 1] or p[j - 1] == ".")

    for i in range(m + 1):
        for j in range(1, n + 1):
            if p[j - 1] == "*":
                dp[i][j] = dp[i][j - 2] or (match(i, j - 1) and dp[i - 1][j])
            else:
                dp[i][j] = match(i, j) and dp[i - 1][j - 1]
    return dp[m][n]`,
    complexity: "Time O(m · n) · Space O(m · n)",
  },
];

/** Recognise-it cues for the Roadmap flashcards. */