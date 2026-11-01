/**
 * Arena problems: dp-2d. Same problems as LeetCode, our own words, verified tests (see ../types.ts).
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
import type { ArenaProblem } from "../types";

export const arena: ArenaProblem[] = [
  {
    lc: 62,
    kind: "algorithm",
    statement: `A robot sits in the top-left cell of an \`m\` x \`n\` grid (\`m\` rows, \`n\` columns) and wants to reach the bottom-right cell. On every move it can go **one cell right or one cell down**, never left or up.

Return the **number of different routes** from the top-left to the bottom-right cell.`,
    examples: [
      { input: "m = 3, n = 4", output: "10", explanation: "Every route is some ordering of 2 down-moves and 3 right-moves: C(5, 2) = 10." },
      { input: "m = 1, n = 5", output: "1", explanation: "A single row: the only route is right, right, right, right." },
    ],
    constraints: ["1 <= m, n <= 100", "The answer is at most 2 * 10^9"],
    signature: `class Solution:
    def uniquePaths(self, m: int, n: int) -> int:`,
    method: "uniquePaths",
    tests: [
      { id: "ex1", input: "[3, 4]", expected: "10", visible: true },
      { id: "ex2", input: "[1, 5]", expected: "1", visible: true },
      { id: "one-cell", input: "[1, 1]", expected: "1", visible: false },
      { id: "two-by-two", input: "[2, 2]", expected: "2", visible: false },
      { id: "square", input: "[5, 5]", expected: "70", visible: false },
      { id: "tall", input: "[10, 3]", expected: "55", visible: false },
      { id: "long-column", input: "[100, 1]", expected: "1", visible: false },
      { id: "large", input: "[17, 18]", expected: "1166803110", visible: false },
    ],
    solution: `class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        dp = [[1] * n for _ in range(m)]  # first row and column: exactly one route
        for r in range(1, m):
            for c in range(1, n):
                dp[r][c] = dp[r - 1][c] + dp[r][c - 1]
        return dp[m - 1][n - 1]`,
    hints: ["A cell can only be entered from the cell above it or the cell to its left.", "So paths[r][c] = paths[r - 1][c] + paths[r][c - 1], and every cell in the first row or first column has exactly 1 path.", "A single row of length n is enough memory; there's also a closed form C(m + n - 2, m - 1)."],
    clarify: [
      { question: "Are there obstacles?", answer: "No, every cell is open." },
      { question: "Is the start cell counted as a move?", answer: "No. You count routes, and a 1 x 1 grid has exactly one (empty) route." },
    ],
  },
  {
    lc: 1143,
    kind: "algorithm",
    statement: `Given two strings \`text1\` and \`text2\`, return the length of their **longest common subsequence**: the longest string that can be obtained from **both** of them by deleting zero or more characters without changing the order of the remaining ones.

If the strings share no characters, return \`0\`.`,
    examples: [
      { input: "text1 = \"kitchen\", text2 = \"thicken\"", output: "4", explanation: "\"then\" (or \"icen\") appears, in order, inside both strings." },
      { input: "text1 = \"abc\", text2 = \"xyz\"", output: "0", explanation: "No character is shared." },
    ],
    constraints: ["1 <= text1.length, text2.length <= 1000", "Both strings contain only lowercase English letters"],
    signature: `class Solution:
    def longestCommonSubsequence(self, text1: str, text2: str) -> int:`,
    method: "longestCommonSubsequence",
    tests: [
      { id: "ex1", input: "[\"kitchen\", \"thicken\"]", expected: "4", visible: true },
      { id: "ex2", input: "[\"abc\", \"xyz\"]", expected: "0", visible: true },
      { id: "identical", input: "[\"dynamic\", \"dynamic\"]", expected: "7", visible: false },
      { id: "single-match", input: "[\"q\", \"q\"]", expected: "1", visible: false },
      { id: "single-miss", input: "[\"q\", \"r\"]", expected: "0", visible: false },
      { id: "subseq", input: "[\"bdf\", \"abcdef\"]", expected: "3", visible: false },
      { id: "all-same", input: "[\"aaaa\", \"aa\"]", expected: "2", visible: false },
      { id: "large", input: "[\"abcde\" * 120, \"aebdc\" * 120]", expected: "360", visible: false },
    ],
    solution: `class Solution:
    def longestCommonSubsequence(self, text1: str, text2: str) -> int:
        m, n = len(text1), len(text2)
        dp = [[0] * (n + 1) for _ in range(m + 1)]  # dp[i][j] = LCS of text1[:i] and text2[:j]
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if text1[i - 1] == text2[j - 1]:
                    dp[i][j] = dp[i - 1][j - 1] + 1
                else:
                    dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
        return dp[m][n]`,
    hints: ["Let dp[i][j] be the LCS length of the first i characters of text1 and the first j of text2.", "If the last characters match, dp[i][j] = dp[i - 1][j - 1] + 1; otherwise drop one of them: max(dp[i - 1][j], dp[i][j - 1]).", "Row 0 and column 0 are all zeros (an empty prefix shares nothing)."],
    clarify: [
      { question: "Is a subsequence the same as a substring?", answer: "No, the characters don't have to be adjacent, only in order." },
      { question: "Do I return the subsequence itself?", answer: "No, only its length." },
    ],
  },
  {
    lc: 309,
    kind: "algorithm",
    statement: `\`prices[i]\` is the price of one share on day \`i\`. You may complete as many buy-then-sell trades as you like, with these rules:

- You hold at most **one share** at a time, so you must sell before buying again.
- After you sell, you must wait **one full day** (a cooldown) before you can buy again. Selling on day \`i\` means the next buy is on day \`i + 2\` at the earliest.

Return the **maximum total profit**. If no trade helps, return \`0\`.`,
    examples: [
      { input: "prices = [2, 6, 1, 3, 8]", output: "9", explanation: "Buy at 2, sell at 6, cool down on the day priced 1, buy at 3 and sell at 8: 4 + 5 = 9." },
      { input: "prices = [9, 7, 4]", output: "0", explanation: "Prices only fall, so it's best not to trade." },
    ],
    constraints: ["1 <= prices.length <= 5000", "0 <= prices[i] <= 1000"],
    signature: `class Solution:
    def maxProfit(self, prices: List[int]) -> int:`,
    method: "maxProfit",
    tests: [
      { id: "ex1", input: "[[2, 6, 1, 3, 8]]", expected: "9", visible: true },
      { id: "ex2", input: "[[9, 7, 4]]", expected: "0", visible: true },
      { id: "single", input: "[[5]]", expected: "0", visible: false },
      { id: "pair", input: "[[1, 2]]", expected: "1", visible: false },
      { id: "all-same", input: "[[3, 3, 3, 3]]", expected: "0", visible: false },
      { id: "cooldown-hurts", input: "[[1, 4, 2, 5]]", expected: "4", visible: false },
      { id: "rising", input: "[[1, 2, 3, 4, 5, 6]]", expected: "5", visible: false },
      { id: "zigzag", input: "[[1, 5, 1, 5, 1, 5, 1, 5]]", expected: "8", visible: false },
      { id: "large", input: "[[(i * 37) % 97 * 10 for i in range(5000)]]", expected: "705960", visible: false },
    ],
    solution: `class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        # hold: best profit while owning a share; sold: just sold today; rest: free to buy
        hold, sold, rest = float("-inf"), 0, 0
        for p in prices:
            hold, sold, rest = max(hold, rest - p), hold + p, max(rest, sold)
        return max(sold, rest)`,
    hints: ["Model each day with states: holding a share, just sold (in cooldown tomorrow), or resting with no share.", "hold = max(hold, rest - price); sold = hold + price; rest = max(rest, sold), all computed from yesterday's values.", "The answer is the better of ending in 'sold' or 'rest'; you never want to end while holding."],
    clarify: [
      { question: "Can I buy and sell on the same day?", answer: "No useful effect: a sell needs an earlier buy, and after a sell you must skip a day before buying." },
      { question: "Is there a transaction fee?", answer: "No, only the one-day cooldown after each sale." },
    ],
  },
  {
    lc: 518,
    kind: "algorithm",
    statement: `You have an unlimited number of coins of each value in \`coins\`. Return **how many different combinations** of coins add up to exactly \`amount\`.

Combinations are unordered: \`1 + 2\` and \`2 + 1\` are the same combination. If \`amount\` can't be made, return \`0\`. An amount of \`0\` has exactly one combination (take no coins).`,
    examples: [
      { input: "amount = 6, coins = [1, 3]", output: "3", explanation: "1+1+1+1+1+1, 3+1+1+1 and 3+3." },
      { input: "amount = 7, coins = [4]", output: "0", explanation: "7 isn't a multiple of 4." },
    ],
    constraints: ["1 <= coins.length <= 300", "1 <= coins[i] <= 5000", "All coin values are distinct", "0 <= amount <= 5000", "The answer fits in a 32-bit signed integer"],
    signature: `class Solution:
    def change(self, amount: int, coins: List[int]) -> int:`,
    method: "change",
    tests: [
      { id: "ex1", input: "[6, [1, 3]]", expected: "3", visible: true },
      { id: "ex2", input: "[7, [4]]", expected: "0", visible: true },
      { id: "zero", input: "[0, [5]]", expected: "1", visible: false },
      { id: "one-coin", input: "[9, [9]]", expected: "1", visible: false },
      { id: "too-big", input: "[3, [5, 10]]", expected: "0", visible: false },
      { id: "several", input: "[10, [2, 5, 3, 6]]", expected: "5", visible: false },
      { id: "ones", input: "[12, [1]]", expected: "1", visible: false },
      { id: "large", input: "[500, [1, 2, 5, 10, 20, 50, 100, 200]]", expected: "6295434", visible: false },
    ],
    solution: `class Solution:
    def change(self, amount: int, coins: List[int]) -> int:
        dp = [0] * (amount + 1)  # dp[a] = combinations for a using the coins processed so far
        dp[0] = 1
        for coin in coins:  # coins in the outer loop => each combination counted once
            for a in range(coin, amount + 1):
                dp[a] += dp[a - coin]
        return dp[amount]`,
    hints: ["Let ways[i][a] be the number of combinations of amount a using only the first i coin types.", "ways[i][a] = ways[i - 1][a] (skip coin i) + ways[i][a - coin_i] (use it once more). ways[*][0] = 1.", "Collapsed to 1D: loop coins on the outside and amounts on the inside; swapping the loops would count orderings instead."],
    clarify: [
      { question: "Does order matter?", answer: "No. 2 + 1 and 1 + 2 are one combination." },
      { question: "What's the answer for amount 0?", answer: "1: the empty combination." },
    ],
  },
  {
    lc: 494,
    kind: "algorithm",
    statement: `You get an integer array \`nums\` and an integer \`target\`. Put a \`+\` or a \`-\` sign in front of **every** element, then add everything up.

Return the **number of sign assignments** whose total equals \`target\`. Assignments differ if at least one position has a different sign, even when the elements are equal (so zeros double the count).`,
    examples: [
      { input: "nums = [2, 1, 1], target = 2", output: "2", explanation: "+2 +1 -1 and +2 -1 +1." },
      { input: "nums = [5], target = -5", output: "1", explanation: "Only -5." },
    ],
    constraints: ["1 <= nums.length <= 20", "0 <= nums[i] <= 1000", "0 <= sum(nums) <= 1000", "-1000 <= target <= 1000"],
    signature: `class Solution:
    def findTargetSumWays(self, nums: List[int], target: int) -> int:`,
    method: "findTargetSumWays",
    tests: [
      { id: "ex1", input: "[[2, 1, 1], 2]", expected: "2", visible: true },
      { id: "ex2", input: "[[5], -5]", expected: "1", visible: true },
      { id: "zeros", input: "[[0, 0, 1], 1]", expected: "4", visible: false },
      { id: "unreachable", input: "[[3, 4], 2]", expected: "0", visible: false },
      { id: "too-far", input: "[[1, 2], 10]", expected: "0", visible: false },
      { id: "single-zero", input: "[[0], 0]", expected: "2", visible: false },
      { id: "all-same", input: "[[2, 2, 2, 2], 0]", expected: "6", visible: false },
      { id: "large-ones", input: "[[1] * 20, 0]", expected: "184756", visible: false },
      { id: "large-range", input: "[list(range(1, 21)), 10]", expected: "15029", visible: false },
    ],
    solution: `class Solution:
    def findTargetSumWays(self, nums: List[int], target: int) -> int:
        dp = {0: 1}  # running sum -> number of sign assignments reaching it
        for n in nums:
            nxt = {}
            for s, ways in dp.items():
                nxt[s + n] = nxt.get(s + n, 0) + ways
                nxt[s - n] = nxt.get(s - n, 0) + ways
            dp = nxt
        return dp.get(target, 0)`,
    hints: ["Brute force tries 2^n sign patterns, but many patterns share the same running sum.", "Process elements one at a time, keeping a map from 'sum so far' to 'number of ways to reach it'.", "Alternative: if P is the set of + elements, sum(P) = (total + target) / 2, which turns it into counting subsets (0/1 knapsack)."],
    clarify: [
      { question: "Must every element get a sign?", answer: "Yes, none can be left out." },
      { question: "Do zeros matter?", answer: "Yes, +0 and -0 count as two different assignments." },
    ],
  },
  {
    lc: 97,
    kind: "algorithm",
    statement: `Given three strings \`s1\`, \`s2\` and \`s3\`, decide whether \`s3\` can be built by **interleaving** \`s1\` and \`s2\`: walking through both strings and repeatedly taking the next character from either one, so that every character of \`s1\` and \`s2\` is used exactly once and each string's own order is kept.

Return \`true\` if \`s3\` is such an interleaving, otherwise \`false\`.`,
    examples: [
      { input: "s1 = \"ab\", s2 = \"cd\", s3 = \"acbd\"", output: "True", explanation: "Take a (s1), c (s2), b (s1), d (s2)." },
      { input: "s1 = \"ab\", s2 = \"cd\", s3 = \"adcb\"", output: "False", explanation: "\"d\" can't come before \"c\" because s2's order must be kept." },
    ],
    constraints: ["0 <= s1.length, s2.length <= 100", "0 <= s3.length <= 200", "All strings are lowercase English letters"],
    signature: `class Solution:
    def isInterleave(self, s1: str, s2: str, s3: str) -> bool:`,
    method: "isInterleave",
    tests: [
      { id: "ex1", input: "[\"ab\", \"cd\", \"acbd\"]", expected: "True", visible: true },
      { id: "ex2", input: "[\"ab\", \"cd\", \"adcb\"]", expected: "False", visible: true },
      { id: "all-empty", input: "[\"\", \"\", \"\"]", expected: "True", visible: false },
      { id: "one-empty", input: "[\"\", \"xyz\", \"xyz\"]", expected: "True", visible: false },
      { id: "length-mismatch", input: "[\"a\", \"b\", \"abc\"]", expected: "False", visible: false },
      { id: "same-letters", input: "[\"aab\", \"aac\", \"aaabac\"]", expected: "True", visible: false },
      { id: "choose-wisely", input: "[\"aabd\", \"abdc\", \"aabdbadc\"]", expected: "False", visible: false },
      { id: "large-false", input: "[\"a\" * 60, \"a\" * 60, \"a\" * 119 + \"b\"]", expected: "False", visible: false },
      { id: "large-true", input: "[\"abc\" * 30, \"abd\" * 30, \"\".join(x + y for x, y in zip(\"abc\" * 30, \"abd\" * 30))]", expected: "True", visible: false },
    ],
    solution: `class Solution:
    def isInterleave(self, s1: str, s2: str, s3: str) -> bool:
        m, n = len(s1), len(s2)
        if m + n != len(s3):
            return False
        dp = [[False] * (n + 1) for _ in range(m + 1)]  # dp[i][j]: s1[:i] and s2[:j] form s3[:i + j]
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
    hints: ["If len(s1) + len(s2) != len(s3), the answer is immediately false.", "Let dp[i][j] mean: the first i chars of s1 and first j chars of s2 can form the first i + j chars of s3.", "dp[i][j] is true if (dp[i - 1][j] and s1[i - 1] == s3[i + j - 1]) or (dp[i][j - 1] and s2[j - 1] == s3[i + j - 1])."],
    clarify: [
      { question: "Do the pieces have to alternate one character at a time?", answer: "No, you may take several characters in a row from the same string." },
      { question: "Can any of the strings be empty?", answer: "Yes, all three may be empty." },
    ],
  },
  {
    lc: 329,
    kind: "algorithm",
    statement: `Given an \`m\` x \`n\` grid of integers \`matrix\`, find the longest path in which **every step moves to an adjacent cell (up, down, left or right) holding a strictly larger value**. Diagonal moves and moves off the grid are not allowed.

Return the **number of cells** on the longest such path. A single cell on its own is a path of length 1.`,
    examples: [
      { input: "matrix = [[3, 4, 5], [2, 1, 6], [9, 8, 7]]", output: "9", explanation: "Start at 1 and spiral outwards: 1, 2, 3, 4, 5, 6, 7, 8, 9." },
      { input: "matrix = [[7, 7], [7, 7]]", output: "1", explanation: "No neighbour is strictly larger, so each path is a single cell." },
    ],
    constraints: ["1 <= m, n <= 200", "0 <= matrix[i][j] <= 2^31 - 1"],
    signature: `class Solution:
    def longestIncreasingPath(self, matrix: List[List[int]]) -> int:`,
    method: "longestIncreasingPath",
    tests: [
      { id: "ex1", input: "[[[3, 4, 5], [2, 1, 6], [9, 8, 7]]]", expected: "9", visible: true },
      { id: "ex2", input: "[[[7, 7], [7, 7]]]", expected: "1", visible: true },
      { id: "one-cell", input: "[[[42]]]", expected: "1", visible: false },
      { id: "row", input: "[[[1, 2, 3, 4]]]", expected: "4", visible: false },
      { id: "column-down", input: "[[[9], [5], [1]]]", expected: "3", visible: false },
      { id: "peak", input: "[[[1, 2, 1], [2, 5, 2], [1, 2, 1]]]", expected: "3", visible: false },
      { id: "snake", input: "[[[1, 2, 3], [6, 5, 4], [7, 8, 9]]]", expected: "9", visible: false },
      { id: "large", input: "[[[r + c for c in range(100)] for r in range(100)]]", expected: "199", visible: false },
    ],
    solution: `class Solution:
    def longestIncreasingPath(self, matrix: List[List[int]]) -> int:
        rows, cols = len(matrix), len(matrix[0])
        memo = {}  # (r, c) -> longest increasing path starting at (r, c)

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
    hints: ["Because each step must go strictly up, a path can never revisit a cell, so no 'visited' set is needed.", "Let best(r, c) be the longest path starting at (r, c): 1 + the max of best over strictly larger neighbours.", "Memoize best(r, c) so each cell is solved once: O(m * n) total."],
    clarify: [
      { question: "Can I move diagonally?", answer: "No, only up, down, left and right." },
      { question: "Do equal neighbouring values continue a path?", answer: "No, each step must be strictly larger." },
    ],
  },
  {
    lc: 115,
    kind: "algorithm",
    statement: `Given strings \`s\` and \`t\`, count the **number of different ways to pick characters from \`s\`** (keeping their order) so that the picked characters spell exactly \`t\`.

Two ways are different if they use a different set of positions in \`s\`. Return the count; it fits in a 32-bit signed integer.`,
    examples: [
      { input: "s = \"aabb\", t = \"ab\"", output: "4", explanation: "Either 'a' can pair with either 'b': 2 * 2 = 4." },
      { input: "s = \"xyz\", t = \"yx\"", output: "0", explanation: "There is no 'x' after the 'y'." },
    ],
    constraints: ["1 <= s.length, t.length <= 1000", "s and t consist of English letters"],
    signature: `class Solution:
    def numDistinct(self, s: str, t: str) -> int:`,
    method: "numDistinct",
    tests: [
      { id: "ex1", input: "[\"aabb\", \"ab\"]", expected: "4", visible: true },
      { id: "ex2", input: "[\"xyz\", \"yx\"]", expected: "0", visible: true },
      { id: "equal", input: "[\"code\", \"code\"]", expected: "1", visible: false },
      { id: "t-longer", input: "[\"ab\", \"abc\"]", expected: "0", visible: false },
      { id: "choose", input: "[\"aaaa\", \"aa\"]", expected: "6", visible: false },
      { id: "single", input: "[\"q\", \"q\"]", expected: "1", visible: false },
      { id: "case", input: "[\"aA\", \"a\"]", expected: "1", visible: false },
      { id: "large", input: "[\"abc\" * 40, \"abcabcabc\"]", expected: "1101716330", visible: false },
      { id: "large-miss", input: "[\"ab\" * 400, \"ba\" * 400]", expected: "0", visible: false },
    ],
    solution: `class Solution:
    def numDistinct(self, s: str, t: str) -> int:
        m, n = len(s), len(t)
        dp = [[0] * (n + 1) for _ in range(m + 1)]  # dp[i][j] = ways s[:i] can form t[:j]
        for i in range(m + 1):
            dp[i][0] = 1  # the empty target is formed exactly once
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                dp[i][j] = dp[i - 1][j]
                if s[i - 1] == t[j - 1]:
                    dp[i][j] += dp[i - 1][j - 1]
        return dp[m][n]`,
    hints: ["Let dp[i][j] be the number of ways the first i characters of s can form the first j characters of t.", "You can always skip s[i - 1] (dp[i - 1][j]); if it equals t[j - 1] you can also use it (add dp[i - 1][j - 1]).", "dp[i][0] = 1 for every i (empty target), and dp[0][j] = 0 for j > 0."],
    clarify: [
      { question: "Does each way have to keep the order of s?", answer: "Yes, the chosen positions must be increasing." },
      { question: "What if t is longer than s?", answer: "Then the answer is 0." },
    ],
  },
  {
    lc: 72,
    kind: "algorithm",
    statement: `Given two strings \`word1\` and \`word2\`, return the **minimum number of single-character edits** needed to turn \`word1\` into \`word2\`.

The allowed edits, each costing 1, are:
- **insert** one character anywhere,
- **delete** one character,
- **replace** one character with another.`,
    examples: [
      { input: "word1 = \"sunday\", word2 = \"saturday\"", output: "3", explanation: "Insert \"a\", insert \"t\", then replace \"n\" with \"r\"." },
      { input: "word1 = \"\", word2 = \"abc\"", output: "3", explanation: "Insert all three characters." },
    ],
    constraints: ["0 <= word1.length, word2.length <= 500", "Both strings are lowercase English letters"],
    signature: `class Solution:
    def minDistance(self, word1: str, word2: str) -> int:`,
    method: "minDistance",
    tests: [
      { id: "ex1", input: "[\"sunday\", \"saturday\"]", expected: "3", visible: true },
      { id: "ex2", input: "[\"\", \"abc\"]", expected: "3", visible: true },
      { id: "both-empty", input: "[\"\", \"\"]", expected: "0", visible: false },
      { id: "same", input: "[\"equal\", \"equal\"]", expected: "0", visible: false },
      { id: "to-empty", input: "[\"gone\", \"\"]", expected: "4", visible: false },
      { id: "replace-all", input: "[\"aaa\", \"bbb\"]", expected: "3", visible: false },
      { id: "shift", input: "[\"abcdef\", \"bcdefa\"]", expected: "2", visible: false },
      { id: "large", input: "[\"kitten\" * 80, \"sitting\" * 70]", expected: "260", visible: false },
    ],
    solution: `class Solution:
    def minDistance(self, word1: str, word2: str) -> int:
        m, n = len(word1), len(word2)
        dp = [[0] * (n + 1) for _ in range(m + 1)]  # dp[i][j] = edits to turn word1[:i] into word2[:j]
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
    hints: ["Let dp[i][j] be the edits needed to turn the first i chars of word1 into the first j chars of word2.", "If the last characters match, dp[i][j] = dp[i - 1][j - 1]. Otherwise 1 + min(delete: dp[i - 1][j], insert: dp[i][j - 1], replace: dp[i - 1][j - 1]).", "Base cases: dp[i][0] = i (delete everything) and dp[0][j] = j (insert everything)."],
    clarify: [
      { question: "Do all three operations cost the same?", answer: "Yes, each costs exactly 1." },
      { question: "Can either word be empty?", answer: "Yes, both may be empty." },
    ],
  },
  {
    lc: 312,
    kind: "algorithm",
    statement: `A row of balloons is given as \`nums\`, where \`nums[i]\` is the number painted on balloon \`i\`. You pop the balloons one at a time, in any order you choose, until none are left.

Popping balloon \`i\` earns \`left * nums[i] * right\` coins, where \`left\` and \`right\` are the numbers on the balloons **currently** next to it. If there's no balloon on one side, treat that side as a \`1\`. After a pop, its two neighbours become adjacent.

Return the **maximum total coins** you can earn.`,
    examples: [
      { input: "nums = [2, 4, 3]", output: "33", explanation: "Pop 4 first (2*4*3 = 24), then 2 (1*2*3 = 6), then 3 (1*3*1 = 3): 33." },
      { input: "nums = [7]", output: "7", explanation: "Popping the only balloon earns 1*7*1." },
    ],
    constraints: ["1 <= nums.length <= 300", "0 <= nums[i] <= 100"],
    signature: `class Solution:
    def maxCoins(self, nums: List[int]) -> int:`,
    method: "maxCoins",
    tests: [
      { id: "ex1", input: "[[2, 4, 3]]", expected: "33", visible: true },
      { id: "ex2", input: "[[7]]", expected: "7", visible: true },
      { id: "ones", input: "[[1, 1]]", expected: "2", visible: false },
      { id: "zeros", input: "[[0, 0, 0]]", expected: "0", visible: false },
      { id: "with-zero", input: "[[5, 0, 5]]", expected: "30", visible: false },
      { id: "all-same", input: "[[3, 3, 3, 3]]", expected: "66", visible: false },
      { id: "mixed", input: "[[9, 1, 8, 2, 7]]", expected: "760", visible: false },
      { id: "large", input: "[[(i * 37) % 101 for i in range(100)]]", expected: "37284291", visible: false },
    ],
    solution: `class Solution:
    def maxCoins(self, nums: List[int]) -> int:
        n = len(nums)
        nums = [1] + nums + [1]
        dp = [[0] * (n + 2) for _ in range(n + 2)]  # dp[l][r] = best for balloons l..r (1-indexed)
        for length in range(1, n + 1):
            for l in range(1, n - length + 2):
                r = l + length - 1
                for k in range(l, r + 1):  # k is the LAST balloon popped in l..r
                    coins = nums[l - 1] * nums[k] * nums[r + 1] + dp[l][k - 1] + dp[k + 1][r]
                    dp[l][r] = max(dp[l][r], coins)
        return dp[1][n]`,
    hints: ["Choosing the first balloon to pop makes the two sides depend on each other. Instead think about which balloon is popped last.", "Pad with 1s at both ends. If k is the last one popped in the range l..r, its neighbours at that moment are l - 1 and r + 1, and the two sides are independent.", "dp[l][r] = max over k of nums[l - 1] * nums[k] * nums[r + 1] + dp[l][k - 1] + dp[k + 1][r]; fill by increasing range length (O(n^3))."],
    clarify: [
      { question: "What counts as the neighbour after some pops?", answer: "The nearest balloon still unpopped on that side, or 1 if none remains." },
      { question: "Can a balloon show 0?", answer: "Yes; popping it earns 0, but it still affects its neighbours' products while it exists." },
    ],
  },
  {
    lc: 10,
    kind: "algorithm",
    statement: `Implement pattern matching where the pattern \`p\` may contain two special characters:

- \`.\` matches **any single character**.
- \`*\` matches **zero or more copies of the character right before it** (that character may itself be \`.\`).

Return \`true\` only if the pattern matches the **whole** string \`s\`, not just part of it.`,
    examples: [
      { input: "s = \"xyy\", p = \"xy*\"", output: "True", explanation: "\"y*\" absorbs both y characters." },
      { input: "s = \"abc\", p = \"a.c\"", output: "True", explanation: "\".\" stands for \"b\"." },
      { input: "s = \"ab\", p = \".*c\"", output: "False", explanation: "\".*\" can match \"ab\", but the pattern still needs a \"c\" at the end." },
    ],
    constraints: ["1 <= s.length <= 20", "1 <= p.length <= 20", "s has only lowercase English letters", "p has only lowercase English letters, '.' and '*'", "Every '*' has a valid character (a letter or '.') right before it"],
    signature: `class Solution:
    def isMatch(self, s: str, p: str) -> bool:`,
    method: "isMatch",
    tests: [
      { id: "ex1", input: "[\"xyy\", \"xy*\"]", expected: "True", visible: true },
      { id: "ex2", input: "[\"abc\", \"a.c\"]", expected: "True", visible: true },
      { id: "ex3", input: "[\"ab\", \".*c\"]", expected: "False", visible: true },
      { id: "zero-copies", input: "[\"b\", \"a*b\"]", expected: "True", visible: false },
      { id: "dot-star", input: "[\"anything\", \".*\"]", expected: "True", visible: false },
      { id: "partial", input: "[\"abcd\", \"abc\"]", expected: "False", visible: false },
      { id: "too-short", input: "[\"a\", \"aa\"]", expected: "False", visible: false },
      { id: "mixed", input: "[\"banana\", \"b.na*n.*\"]", expected: "True", visible: false },
      { id: "star-chain", input: "[\"aaa\", \"a*a*a*a\"]", expected: "True", visible: false },
      { id: "large-false", input: "[\"a\" * 20, \"a*\" * 9 + \"b\"]", expected: "False", visible: false },
      { id: "large-true", input: "[\"a\" * 19 + \"b\", \"a*\" * 9 + \".b\"]", expected: "True", visible: false },
    ],
    solution: `class Solution:
    def isMatch(self, s: str, p: str) -> bool:
        m, n = len(s), len(p)
        dp = [[False] * (n + 1) for _ in range(m + 1)]  # dp[i][j]: s[:i] matches p[:j]
        dp[0][0] = True

        def match(i, j):  # does p[j - 1] match s[i - 1]?
            return i > 0 and (p[j - 1] == s[i - 1] or p[j - 1] == ".")

        for i in range(m + 1):
            for j in range(1, n + 1):
                if p[j - 1] == "*":
                    # use "x*" zero times, or let it eat one more matching character
                    dp[i][j] = dp[i][j - 2] or (match(i, j - 1) and dp[i - 1][j])
                else:
                    dp[i][j] = match(i, j) and dp[i - 1][j - 1]
        return dp[m][n]`,
    hints: ["Let dp[i][j] mean: the first i characters of s are fully matched by the first j characters of p.", "For a normal char or '.', dp[i][j] = (it matches s[i - 1]) and dp[i - 1][j - 1].", "For 'x*': either skip the pair (dp[i][j - 2]) or, if x matches s[i - 1], consume that char and stay on the star (dp[i - 1][j])."],
    clarify: [
      { question: "Is a partial match enough?", answer: "No, the pattern must match the entire string." },
      { question: "Can '*' appear at the start of the pattern?", answer: "No, every '*' follows a letter or '.'." },
    ],
  },
];
