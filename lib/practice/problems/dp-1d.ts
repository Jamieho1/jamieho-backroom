/**
 * Arena problems: dp-1d. Same problems as LeetCode, our own words, verified tests (see ../types.ts).
 * - 70 Climbing Stairs (Easy)
 * - 746 Min Cost Climbing Stairs (Easy)
 * - 198 House Robber (Medium)
 * - 213 House Robber II (Medium)
 * - 5 Longest Palindromic Substring (Medium)
 * - 647 Palindromic Substrings (Medium)
 * - 91 Decode Ways (Medium)
 * - 322 Coin Change (Medium)
 * - 152 Maximum Product Subarray (Medium)
 * - 139 Word Break (Medium)
 * - 300 Longest Increasing Subsequence (Medium)
 * - 416 Partition Equal Subset Sum (Medium)
 */
import type { ArenaProblem } from "../types";

export const arena: ArenaProblem[] = [
  {
    lc: 70,
    kind: "algorithm",
    statement: `A staircase has \`n\` steps and you start on the ground (below step 1). Each move takes you up either **1 step or 2 steps**.

Return the **number of distinct move sequences** that end exactly on step \`n\`. Two sequences are different if they differ in the size of at least one move or in the order of the moves.`,
    examples: [
      { input: "n = 4", output: "5", explanation: "1+1+1+1, 1+1+2, 1+2+1, 2+1+1 and 2+2." },
      { input: "n = 1", output: "1", explanation: "Only a single 1-step move works." },
    ],
    constraints: ["1 <= n <= 45"],
    signature: `class Solution:
    def climbStairs(self, n: int) -> int:`,
    method: "climbStairs",
    tests: [
      { id: "ex1", input: "[4]", expected: "5", visible: true },
      { id: "ex2", input: "[1]", expected: "1", visible: true },
      { id: "two", input: "[2]", expected: "2", visible: false },
      { id: "three", input: "[3]", expected: "3", visible: false },
      { id: "ten", input: "[10]", expected: "89", visible: false },
      { id: "twenty", input: "[20]", expected: "10946", visible: false },
      { id: "thirty-five", input: "[35]", expected: "14930352", visible: false },
      { id: "max", input: "[45]", expected: "1836311903", visible: false },
    ],
    solution: `class Solution:
    def climbStairs(self, n: int) -> int:
        one, two = 1, 1  # ways to reach step i - 1 and step i - 2
        for _ in range(n - 1):
            one, two = one + two, one
        return one`,
    hints: ["Think about the very last move: it either came from step n - 1 or from step n - 2.", "So ways(n) = ways(n - 1) + ways(n - 2), with ways(0) = ways(1) = 1.", "You only ever need the previous two values, so two variables are enough (O(1) space)."],
    clarify: [
      { question: "Does the order of the moves matter?", answer: "Yes. 1+2 and 2+1 are counted as two different ways." },
      { question: "Can the answer overflow?", answer: "No. With n at most 45 the count stays below 2^31." },
    ],
  },
  {
    lc: 746,
    kind: "algorithm",
    statement: `You are given an integer array \`cost\` where \`cost[i]\` is the fee for standing on step \`i\` of a staircase. Once you pay a step's fee you may move up **one or two** steps from it.

You may begin on **either step 0 or step 1** without paying anything to get there. The top of the staircase is the position just past the last step (index \`cost.length\`).

Return the **minimum total fee** needed to reach the top.`,
    examples: [
      { input: "cost = [5, 20, 4]", output: "9", explanation: "Start on step 0 (pay 5), jump two to step 2 (pay 4), then jump to the top: 5 + 4 = 9." },
      { input: "cost = [2, 9, 2, 9, 2, 9]", output: "6", explanation: "Stand only on the 2s at indices 0, 2 and 4, then jump past the end: 2 + 2 + 2 = 6." },
    ],
    constraints: ["2 <= cost.length <= 1000", "0 <= cost[i] <= 999"],
    signature: `class Solution:
    def minCostClimbingStairs(self, cost: List[int]) -> int:`,
    method: "minCostClimbingStairs",
    tests: [
      { id: "ex1", input: "[[5, 20, 4]]", expected: "9", visible: true },
      { id: "ex2", input: "[[2, 9, 2, 9, 2, 9]]", expected: "6", visible: true },
      { id: "two-steps", input: "[[7, 3]]", expected: "3", visible: false },
      { id: "zeros", input: "[[0, 0, 0, 0]]", expected: "0", visible: false },
      { id: "all-same", input: "[[4, 4, 4, 4, 4, 4, 4]]", expected: "12", visible: false },
      { id: "skip-big", input: "[[1, 100, 1, 1, 100, 1]]", expected: "4", visible: false },
      { id: "start-at-one", input: "[[50, 1, 50, 1, 50]]", expected: "2", visible: false },
      { id: "large", input: "[[(i * 37) % 101 for i in range(1000)]]", expected: "19977", visible: false },
    ],
    solution: `class Solution:
    def minCostClimbingStairs(self, cost: List[int]) -> int:
        n = len(cost)
        dp = [0] * (n + 1)  # dp[i] = cheapest way to arrive at position i
        for i in range(2, n + 1):
            dp[i] = min(dp[i - 1] + cost[i - 1], dp[i - 2] + cost[i - 2])
        return dp[n]`,
    hints: ["Let dp[i] be the cheapest total to arrive at position i (before paying cost[i]). Arriving at 0 or 1 is free.", "You reach position i from i - 1 (paying cost[i - 1]) or from i - 2 (paying cost[i - 2]); take the smaller.", "The answer is dp[n], where n = cost.length is the top."],
    clarify: [
      { question: "Do I pay for the step I start on?", answer: "Yes, you pay a step's fee when you leave it; getting onto step 0 or 1 at the start is free." },
      { question: "Is the top an actual step with a cost?", answer: "No. The top is just past the last index and costs nothing." },
    ],
  },
  {
    lc: 198,
    kind: "algorithm",
    statement: `A row of houses each holds some cash; \`nums[i]\` is the amount in house \`i\`. You want to collect as much cash as possible, but an alarm goes off if you take from **two houses that are next to each other**.

Return the **largest total** you can collect without ever taking from two adjacent houses.`,
    examples: [
      { input: "nums = [3, 10, 4, 2, 8]", output: "18", explanation: "Take houses 1 and 4: 10 + 8 = 18." },
      { input: "nums = [6, 1, 1, 6]", output: "12", explanation: "Take the first and the last house: 6 + 6 = 12." },
    ],
    constraints: ["1 <= nums.length <= 100", "0 <= nums[i] <= 400"],
    signature: `class Solution:
    def rob(self, nums: List[int]) -> int:`,
    method: "rob",
    tests: [
      { id: "ex1", input: "[[3, 10, 4, 2, 8]]", expected: "18", visible: true },
      { id: "ex2", input: "[[6, 1, 1, 6]]", expected: "12", visible: true },
      { id: "single", input: "[[7]]", expected: "7", visible: false },
      { id: "pair", input: "[[4, 9]]", expected: "9", visible: false },
      { id: "zeros", input: "[[0, 0, 0]]", expected: "0", visible: false },
      { id: "all-same", input: "[[5, 5, 5, 5, 5]]", expected: "15", visible: false },
      { id: "skip-two", input: "[[2, 1, 1, 2]]", expected: "4", visible: false },
      { id: "large", input: "[[(i * 53) % 401 for i in range(100)]]", expected: "10998", visible: false },
    ],
    solution: `class Solution:
    def rob(self, nums: List[int]) -> int:
        prev, cur = 0, 0  # best total up to house i - 2, up to house i - 1
        for n in nums:
            prev, cur = cur, max(cur, prev + n)
        return cur`,
    hints: ["Let best[i] be the most you can collect from the first i houses.", "For house i you either skip it (best[i - 1]) or take it and the best from two houses back (best[i - 2] + nums[i]).", "Only the last two best values are needed, so roll them in two variables."],
    clarify: [
      { question: "Can amounts be zero?", answer: "Yes, a house may hold 0. Amounts are never negative." },
      { question: "Do I have to take from at least one house?", answer: "No, but since amounts are non-negative, taking something never hurts." },
    ],
  },
  {
    lc: 213,
    kind: "algorithm",
    statement: `Same idea as House Robber, but the houses stand in a **circle**: house \`0\` and the last house are also neighbours. \`nums[i]\` is the cash in house \`i\`.

You may not take from any two adjacent houses (including the first and last pair). Return the **largest total** you can collect.`,
    examples: [
      { input: "nums = [4, 2, 7, 3]", output: "11", explanation: "Take houses 0 and 2: 4 + 7 = 11. They are not neighbours in a circle of 4." },
      { input: "nums = [5, 1, 1, 5]", output: "6", explanation: "Houses 0 and 3 touch in the circle, so the best is 5 + 1 = 6." },
    ],
    constraints: ["1 <= nums.length <= 100", "0 <= nums[i] <= 1000"],
    signature: `class Solution:
    def rob(self, nums: List[int]) -> int:`,
    method: "rob",
    tests: [
      { id: "ex1", input: "[[4, 2, 7, 3]]", expected: "11", visible: true },
      { id: "ex2", input: "[[5, 1, 1, 5]]", expected: "6", visible: true },
      { id: "single", input: "[[9]]", expected: "9", visible: false },
      { id: "pair", input: "[[3, 8]]", expected: "8", visible: false },
      { id: "triple", input: "[[6, 2, 6]]", expected: "6", visible: false },
      { id: "zeros", input: "[[0, 0, 0, 0]]", expected: "0", visible: false },
      { id: "all-same", input: "[[4, 4, 4, 4, 4]]", expected: "8", visible: false },
      { id: "ends-heavy", input: "[[10, 1, 1, 1, 10]]", expected: "11", visible: false },
      { id: "large", input: "[[(i * 71) % 1001 for i in range(100)]]", expected: "26803", visible: false },
    ],
    solution: `class Solution:
    def rob(self, nums: List[int]) -> int:
        def line(houses: List[int]) -> int:
            prev, cur = 0, 0
            for n in houses:
                prev, cur = cur, max(cur, prev + n)
            return cur

        if len(nums) == 1:
            return nums[0]
        return max(line(nums[:-1]), line(nums[1:]))`,
    hints: ["The first and last houses can't both be taken. So at least one of them is left out.", "Solve the straight-line House Robber twice: once without the last house, once without the first, and take the larger.", "Watch the single-house case: dropping one end would leave nothing."],
    clarify: [
      { question: "What if there is only one house?", answer: "Take it; it has no other neighbour." },
      { question: "With two houses, are they adjacent?", answer: "Yes, so you can only take one of them." },
    ],
  },
  {
    lc: 5,
    kind: "algorithm",
    statement: `Given a string \`s\`, return the **longest contiguous substring of \`s\` that reads the same forwards and backwards** (a palindrome).

If several palindromic substrings share the maximum length, returning any one of them is accepted.`,
    examples: [
      { input: "s = \"racecars\"", output: "\"racecar\"", explanation: "\"racecar\" (length 7) is the longest palindrome inside the string." },
      { input: "s = \"xy\"", output: "\"x\"", explanation: "No two-letter palindrome exists, so any single character is fine (\"y\" is also accepted)." },
    ],
    constraints: ["1 <= s.length <= 1000", "s contains only English letters and digits"],
    signature: `class Solution:
    def longestPalindrome(self, s: str) -> str:`,
    method: "longestPalindrome",
    driver: `def run(ns, args):
    # Accepts any palindromic substring of maximum length (ties are allowed).
    s = args[0]
    got = ns["Solution"]().longestPalindrome(s)
    best = 0
    for i in range(len(s)):
        for l, r in ((i, i), (i, i + 1)):
            while l >= 0 and r < len(s) and s[l] == s[r]:
                l -= 1
                r += 1
            best = max(best, r - l - 1)
    ok = isinstance(got, str) and got in s and got == got[::-1] and len(got) == best
    return True if ok else got`,
    tests: [
      { id: "ex1", input: "[\"racecars\"]", expected: "True", visible: true },
      { id: "ex2", input: "[\"xy\"]", expected: "True", visible: true },
      { id: "single", input: "[\"q\"]", expected: "True", visible: false },
      { id: "all-same", input: "[\"aaaa\"]", expected: "True", visible: false },
      { id: "even", input: "[\"pqqr\"]", expected: "True", visible: false },
      { id: "inner", input: "[\"zxabbaqw\"]", expected: "True", visible: false },
      { id: "whole", input: "[\"abcba\"]", expected: "True", visible: false },
      { id: "digits", input: "[\"12321456\"]", expected: "True", visible: false },
      { id: "long-same", input: "[\"a\" * 1000]", expected: "True", visible: false },
      { id: "large", input: "[\"xyz\" * 160 + \"abcdcba\" + \"xyz\" * 160]", expected: "True", visible: false },
    ],
    solution: `class Solution:
    def longestPalindrome(self, s: str) -> str:
        start, best = 0, 0
        for i in range(len(s)):
            for l, r in ((i, i), (i, i + 1)):  # odd and even centers
                while l >= 0 and r < len(s) and s[l] == s[r]:
                    l -= 1
                    r += 1
                if r - l - 1 > best:
                    start, best = l + 1, r - l - 1
        return s[start:start + best]`,
    hints: ["Every palindrome has a center: a single character (odd length) or the gap between two characters (even length).", "From each of the 2n - 1 centers, expand outwards while the two ends match, and remember the widest window.", "That's O(n^2) time and O(1) extra space. A dp[i][j] = 'is s[i..j] a palindrome' table also works."],
    clarify: [
      { question: "Must the palindrome be contiguous?", answer: "Yes, it's a substring, not a subsequence." },
      { question: "What if there's a tie?", answer: "Any palindrome of the maximum length is accepted." },
      { question: "Is the comparison case-sensitive?", answer: "Yes, 'A' and 'a' are different characters." },
    ],
  },
  {
    lc: 647,
    kind: "algorithm",
    statement: `Given a string \`s\`, return **how many of its substrings are palindromes** (read the same forwards and backwards).

A substring is any contiguous, non-empty run of characters. Substrings at different positions count separately even if their text is identical.`,
    examples: [
      { input: "s = \"aba\"", output: "4", explanation: "\"a\", \"b\", \"a\" and \"aba\"." },
      { input: "s = \"zzz\"", output: "6", explanation: "Three \"z\", two \"zz\" and one \"zzz\"." },
    ],
    constraints: ["1 <= s.length <= 1000", "s consists of lowercase English letters"],
    signature: `class Solution:
    def countSubstrings(self, s: str) -> int:`,
    method: "countSubstrings",
    tests: [
      { id: "ex1", input: "[\"aba\"]", expected: "4", visible: true },
      { id: "ex2", input: "[\"zzz\"]", expected: "6", visible: true },
      { id: "single", input: "[\"k\"]", expected: "1", visible: false },
      { id: "distinct", input: "[\"abcd\"]", expected: "4", visible: false },
      { id: "even", input: "[\"abba\"]", expected: "6", visible: false },
      { id: "mixed", input: "[\"abacdc\"]", expected: "8", visible: false },
      { id: "long-same", input: "[\"a\" * 1000]", expected: "500500", visible: false },
      { id: "large", input: "[\"ab\" * 500]", expected: "250500", visible: false },
    ],
    solution: `class Solution:
    def countSubstrings(self, s: str) -> int:
        count = 0
        for i in range(len(s)):
            for l, r in ((i, i), (i, i + 1)):  # odd and even centers
                while l >= 0 and r < len(s) and s[l] == s[r]:
                    count += 1
                    l -= 1
                    r += 1
        return count`,
    hints: ["Each palindrome is determined by its center and its radius.", "Expand from each of the 2n - 1 centers; every successful expansion step is one more palindrome.", "Checking every substring directly costs O(n^3). Expanding is O(n^2) with no extra memory."],
    clarify: [
      { question: "Do identical substrings at different positions both count?", answer: "Yes, each position is counted separately." },
      { question: "Do single characters count?", answer: "Yes, every single character is a palindrome." },
    ],
  },
  {
    lc: 91,
    kind: "algorithm",
    statement: `Letters are turned into numbers with the code \`A -> "1"\`, \`B -> "2"\`, ..., \`Z -> "26"\`. You receive a string \`s\` of digits that came from such an encoding, but the boundaries between letters were lost.

Return **how many different ways** the digits can be split back into valid letter codes.

- Every code is one of \`"1"\` to \`"26"\`. A code can't have a leading zero, so \`"0"\`, \`"05"\` or \`"00"\` are never valid pieces.
- If the string can't be split at all, return \`0\`.`,
    examples: [
      { input: "s = \"121\"", output: "3", explanation: "\"1 2 1\" (ABA), \"12 1\" (LA) and \"1 21\" (AU)." },
      { input: "s = \"40\"", output: "0", explanation: "\"0\" is not a letter and \"40\" is above 26, so nothing works." },
    ],
    constraints: ["1 <= s.length <= 100", "s contains only digits and may start with '0'", "The answer fits in a 32-bit integer"],
    signature: `class Solution:
    def numDecodings(self, s: str) -> int:`,
    method: "numDecodings",
    tests: [
      { id: "ex1", input: "[\"121\"]", expected: "3", visible: true },
      { id: "ex2", input: "[\"40\"]", expected: "0", visible: true },
      { id: "zero", input: "[\"0\"]", expected: "0", visible: false },
      { id: "ten", input: "[\"10\"]", expected: "1", visible: false },
      { id: "double-zero", input: "[\"100\"]", expected: "0", visible: false },
      { id: "leading-zero", input: "[\"07\"]", expected: "0", visible: false },
      { id: "forced", input: "[\"2101\"]", expected: "1", visible: false },
      { id: "over-26", input: "[\"27\"]", expected: "1", visible: false },
      { id: "single", input: "[\"7\"]", expected: "1", visible: false },
      { id: "large", input: "[\"1\" * 40]", expected: "165580141", visible: false },
    ],
    solution: `class Solution:
    def numDecodings(self, s: str) -> int:
        n = len(s)
        dp = [0] * (n + 1)  # dp[i] = ways to decode the first i digits
        dp[0] = 1
        for i in range(1, n + 1):
            if s[i - 1] != "0":
                dp[i] += dp[i - 1]
            if i >= 2 and 10 <= int(s[i - 2:i]) <= 26:
                dp[i] += dp[i - 2]
        return dp[n]`,
    hints: ["Let dp[i] be the number of ways to decode the first i digits, with dp[0] = 1 for the empty prefix.", "The last piece is one digit (allowed if it isn't '0') or two digits (allowed if they form 10..26). Add the matching dp values.", "Zeros are the trap: a '0' can only be the second digit of 10 or 20."],
    clarify: [
      { question: "Is '05' a valid code for E?", answer: "No. Codes never have a leading zero." },
      { question: "What should I return if no split works?", answer: "Return 0." },
    ],
  },
  {
    lc: 322,
    kind: "algorithm",
    statement: `You have an unlimited supply of coins of each denomination in \`coins\`, and you need to pay exactly \`amount\`.

Return the **smallest number of coins** whose values add up to \`amount\`. If no combination of coins reaches it exactly, return \`-1\`. Paying an amount of \`0\` takes \`0\` coins.`,
    examples: [
      { input: "coins = [2, 5, 10], amount = 27", output: "4", explanation: "10 + 10 + 5 + 2 uses 4 coins." },
      { input: "coins = [4], amount = 7", output: "-1", explanation: "Multiples of 4 never equal 7." },
    ],
    constraints: ["1 <= coins.length <= 12", "1 <= coins[i] <= 2^31 - 1", "0 <= amount <= 10^4"],
    signature: `class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:`,
    method: "coinChange",
    tests: [
      { id: "ex1", input: "[[2, 5, 10], 27]", expected: "4", visible: true },
      { id: "ex2", input: "[[4], 7]", expected: "-1", visible: true },
      { id: "zero-amount", input: "[[3], 0]", expected: "0", visible: false },
      { id: "greedy-fails", input: "[[1, 4, 5], 8]", expected: "2", visible: false },
      { id: "impossible", input: "[[3, 7], 11]", expected: "-1", visible: false },
      { id: "exact-coin", input: "[[2, 9], 9]", expected: "1", visible: false },
      { id: "huge-coin", input: "[[2147483647], 2]", expected: "-1", visible: false },
      { id: "large", input: "[[7, 13, 29], 9973]", expected: "345", visible: false },
    ],
    solution: `class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:
        dp = [0] + [amount + 1] * amount  # dp[a] = fewest coins for a (amount + 1 means unreachable)
        for a in range(1, amount + 1):
            for c in coins:
                if c <= a:
                    dp[a] = min(dp[a], dp[a - c] + 1)
        return dp[amount] if dp[amount] <= amount else -1`,
    hints: ["Greedy (biggest coin first) can fail. Try coins [1, 4, 5] with amount 8.", "Let dp[a] be the fewest coins that make a. Then dp[a] = 1 + min(dp[a - c]) over every coin c <= a, with dp[0] = 0.", "Fill dp from 1 up to amount; use a sentinel larger than amount for 'unreachable' and turn it into -1 at the end."],
    clarify: [
      { question: "Can I use the same coin value more than once?", answer: "Yes, every denomination is unlimited." },
      { question: "What if amount is 0?", answer: "Return 0; no coins are needed." },
    ],
  },
  {
    lc: 152,
    kind: "algorithm",
    statement: `Given an integer array \`nums\`, find the **non-empty contiguous subarray** whose elements multiply to the largest value, and return that product.

The answer is guaranteed to fit in a 32-bit signed integer.`,
    examples: [
      { input: "nums = [3, -1, 4, -2]", output: "24", explanation: "The whole array: 3 * -1 * 4 * -2 = 24." },
      { input: "nums = [-5, 0, -1]", output: "0", explanation: "Any subarray with both negatives also contains the 0, so 0 is the best." },
    ],
    constraints: ["1 <= nums.length <= 2 * 10^4", "-10 <= nums[i] <= 10", "The product of any subarray fits in a 32-bit integer"],
    signature: `class Solution:
    def maxProduct(self, nums: List[int]) -> int:`,
    method: "maxProduct",
    tests: [
      { id: "ex1", input: "[[3, -1, 4, -2]]", expected: "24", visible: true },
      { id: "ex2", input: "[[-5, 0, -1]]", expected: "0", visible: true },
      { id: "single-neg", input: "[[-3]]", expected: "-3", visible: false },
      { id: "zero-start", input: "[[0, 2]]", expected: "2", visible: false },
      { id: "all-neg", input: "[[-2, -3, -4]]", expected: "12", visible: false },
      { id: "mixed", input: "[[2, -5, -2, -4, 3]]", expected: "24", visible: false },
      { id: "all-same", input: "[[-2, -2, -2, -2]]", expected: "16", visible: false },
      { id: "zeros", input: "[[0, 0, 0]]", expected: "0", visible: false },
      { id: "large", input: "[[(-1 if i % 3 == 0 else 1) for i in range(6000)] + [5]]", expected: "5", visible: false },
    ],
    solution: `class Solution:
    def maxProduct(self, nums: List[int]) -> int:
        res = max(nums)
        cur_max, cur_min = 1, 1  # largest and smallest product of a subarray ending here
        for n in nums:
            cand = (n, n * cur_max, n * cur_min)
            cur_max, cur_min = max(cand), min(cand)
            res = max(res, cur_max)
        return res`,
    hints: ["Unlike sums, a very negative product can become the largest after one more negative number.", "Track both the largest and the smallest product of a subarray ending at the current index.", "At each element the new max/min are among: the element itself, element * old max, element * old min."],
    clarify: [
      { question: "Can the subarray be empty?", answer: "No, it must contain at least one element." },
      { question: "Can the array contain zeros and negatives?", answer: "Yes, both; a zero breaks any product passing through it." },
    ],
  },
  {
    lc: 139,
    kind: "algorithm",
    statement: `Given a string \`s\` and a list of words \`wordDict\`, decide whether \`s\` can be cut into a sequence of **one or more dictionary words** that, joined in order, give back exactly \`s\`.

Return \`true\` if such a split exists and \`false\` otherwise. A dictionary word may be used any number of times.`,
    examples: [
      { input: "s = \"sunflower\", wordDict = [\"sun\", \"flow\", \"flower\", \"er\"]", output: "True", explanation: "\"sun\" + \"flower\" (or \"sun\" + \"flow\" + \"er\")." },
      { input: "s = \"carpets\", wordDict = [\"car\", \"pet\", \"carp\"]", output: "False", explanation: "Whatever you try, the final \"s\" is left over." },
    ],
    constraints: ["1 <= s.length <= 300", "1 <= wordDict.length <= 1000", "1 <= wordDict[i].length <= 20", "All strings are lowercase English letters", "All dictionary words are distinct"],
    signature: `class Solution:
    def wordBreak(self, s: str, wordDict: List[str]) -> bool:`,
    method: "wordBreak",
    tests: [
      { id: "ex1", input: "[\"sunflower\", [\"sun\", \"flow\", \"flower\", \"er\"]]", expected: "True", visible: true },
      { id: "ex2", input: "[\"carpets\", [\"car\", \"pet\", \"carp\"]]", expected: "False", visible: true },
      { id: "reuse", input: "[\"abab\", [\"ab\"]]", expected: "True", visible: false },
      { id: "single", input: "[\"q\", [\"q\"]]", expected: "True", visible: false },
      { id: "single-miss", input: "[\"q\", [\"z\"]]", expected: "False", visible: false },
      { id: "backtrack", input: "[\"bookcase\", [\"bo\", \"book\", \"ok\", \"case\", \"kcase\"]]", expected: "True", visible: false },
      { id: "prefix-trap", input: "[\"applepie\", [\"app\", \"apple\", \"lepie\"]]", expected: "True", visible: false },
      { id: "large-false", input: "[\"a\" * 200 + \"b\", [\"a\", \"aa\", \"aaa\", \"aaaa\", \"aaaaa\", \"aaaaaa\"]]", expected: "False", visible: false },
      { id: "large-true", input: "[\"ab\" * 150, [\"a\", \"b\", \"ab\", \"aba\", \"bab\"]]", expected: "True", visible: false },
    ],
    solution: `class Solution:
    def wordBreak(self, s: str, wordDict: List[str]) -> bool:
        words = set(wordDict)
        dp = [False] * (len(s) + 1)  # dp[i] = the first i characters can be split
        dp[0] = True
        for i in range(1, len(s) + 1):
            for w in words:
                if i >= len(w) and dp[i - len(w)] and s[i - len(w):i] == w:
                    dp[i] = True
                    break
        return dp[len(s)]`,
    hints: ["Let dp[i] be true when the prefix of length i can be split into dictionary words; dp[0] is true.", "dp[i] is true if some word w ends at position i and dp[i - len(w)] is true.", "Plain recursion re-checks the same suffixes over and over; storing dp makes it polynomial."],
    clarify: [
      { question: "Can a word be used more than once?", answer: "Yes, any number of times." },
      { question: "Must every character of s be used?", answer: "Yes, the pieces must cover s exactly with nothing left over." },
    ],
  },
  {
    lc: 300,
    kind: "algorithm",
    statement: `Given an integer array \`nums\`, return the length of its **longest strictly increasing subsequence**.

A subsequence keeps the original order but may skip any elements (it doesn't need to be contiguous). Strictly increasing means every element is larger than the one before it, so equal values can't both be used.`,
    examples: [
      { input: "nums = [5, 2, 8, 6, 3, 6, 9, 7]", output: "4", explanation: "For example 2, 3, 6, 9." },
      { input: "nums = [4, 4, 4]", output: "1", explanation: "Equal values don't count as increasing, so only one can be picked." },
    ],
    constraints: ["1 <= nums.length <= 2500", "-10^4 <= nums[i] <= 10^4"],
    signature: `class Solution:
    def lengthOfLIS(self, nums: List[int]) -> int:`,
    method: "lengthOfLIS",
    tests: [
      { id: "ex1", input: "[[5, 2, 8, 6, 3, 6, 9, 7]]", expected: "4", visible: true },
      { id: "ex2", input: "[[4, 4, 4]]", expected: "1", visible: true },
      { id: "single", input: "[[1]]", expected: "1", visible: false },
      { id: "sorted", input: "[list(range(1, 11))]", expected: "10", visible: false },
      { id: "reversed", input: "[list(range(10, 0, -1))]", expected: "1", visible: false },
      { id: "dip", input: "[[3, 1, 2, 1, 8, 5, 6]]", expected: "4", visible: false },
      { id: "negatives", input: "[[-5, -10, -3, -4, 0, -1]]", expected: "3", visible: false },
      { id: "large", input: "[[(i * 7919) % 2503 - 1250 for i in range(2500)]]", expected: "49", visible: false },
    ],
    solution: `class Solution:
    def lengthOfLIS(self, nums: List[int]) -> int:
        # tails[k] = smallest possible last value of an increasing subsequence of length k + 1
        tails = []
        for n in nums:
            i = bisect_left(tails, n)
            if i == len(tails):
                tails.append(n)
            else:
                tails[i] = n
        return len(tails)`,
    hints: ["O(n^2) DP: let dp[i] be the longest increasing subsequence ending at index i; dp[i] = 1 + max(dp[j]) over j < i with nums[j] < nums[i].", "For O(n log n), keep tails[k] = the smallest last value of any increasing subsequence of length k + 1. The list stays sorted.", "For each number, binary-search the first tail >= it and replace it (or append). The answer is the length of tails."],
    clarify: [
      { question: "Does the subsequence have to be contiguous?", answer: "No, elements may be skipped as long as the order is kept." },
      { question: "Do equal values count as increasing?", answer: "No, it must be strictly increasing." },
    ],
  },
  {
    lc: 416,
    kind: "algorithm",
    statement: `Given an array \`nums\` of positive integers, decide whether you can split all of its elements into **two groups with exactly the same sum**.

Every element must go into exactly one of the two groups. Return \`true\` if such a split exists, otherwise \`false\`.`,
    examples: [
      { input: "nums = [3, 1, 5, 9, 4, 2]", output: "True", explanation: "The total is 24; {3, 9} and {1, 5, 4, 2} both sum to 12." },
      { input: "nums = [2, 3, 7]", output: "False", explanation: "The total is 12, but no group of these numbers sums to 6." },
    ],
    constraints: ["1 <= nums.length <= 200", "1 <= nums[i] <= 100"],
    signature: `class Solution:
    def canPartition(self, nums: List[int]) -> bool:`,
    method: "canPartition",
    tests: [
      { id: "ex1", input: "[[3, 1, 5, 9, 4, 2]]", expected: "True", visible: true },
      { id: "ex2", input: "[[2, 3, 7]]", expected: "False", visible: true },
      { id: "single", input: "[[1]]", expected: "False", visible: false },
      { id: "pair", input: "[[1, 1]]", expected: "True", visible: false },
      { id: "odd-total", input: "[[1, 2, 4]]", expected: "False", visible: false },
      { id: "even-no", input: "[[2, 2, 3, 5]]", expected: "False", visible: false },
      { id: "all-same", input: "[[7, 7, 7, 7]]", expected: "True", visible: false },
      { id: "large-true", input: "[[i % 50 + 1 for i in range(200)]]", expected: "True", visible: false },
      { id: "large-false", input: "[[2] * 199 + [100]]", expected: "False", visible: false },
    ],
    solution: `class Solution:
    def canPartition(self, nums: List[int]) -> bool:
        total = sum(nums)
        if total % 2:
            return False
        target = total // 2
        dp = [False] * (target + 1)  # dp[s] = some subset seen so far sums to s
        dp[0] = True
        for n in nums:
            for s in range(target, n - 1, -1):  # backwards so each number is used once
                dp[s] = dp[s] or dp[s - n]
        return dp[target]`,
    hints: ["If the total is odd, it's impossible. Otherwise the question becomes: does some subset sum to total / 2?", "Keep a boolean array reachable[s] for subset sums, starting with reachable[0] = true.", "For each number, update sums from high to low (reachable[s] |= reachable[s - n]) so a number isn't reused."],
    clarify: [
      { question: "Can one group be empty?", answer: "Only if the other has sum 0, which can't happen with positive numbers, so in practice both groups are non-empty." },
      { question: "Do the groups need the same number of elements?", answer: "No, only equal sums." },
    ],
  },
];
