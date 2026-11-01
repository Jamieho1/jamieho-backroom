/**
 * dp-1d: NeetCode 150 problems, written in Jamie's format (see arrays-hashing.ts).
 * Problems:
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
import type { Solution, Variation } from "../solutions";

const kv = (o: Record<string, string>) => Object.entries(o).map(([name, value]) => ({ name, value }));

export const variations: Variation[] = [
  {
    id: "step-recurrence",
    topic: "dp-1d",
    name: "Last one or two steps",
    change: "Base pattern. ==`dp[i]` is built from `dp[i - 1]` and `dp[i - 2]`== only (Fibonacci shape), so two variables are enough.",
    problems: [70, 746, 91],
  },
  {
    id: "take-skip",
    topic: "dp-1d",
    name: "Take or skip each item",
    change: "Each item is ==either taken or skipped==; the recurrence is the better of the two. Taking may block a neighbour (robber) or use up a budget (subset sum).",
    problems: [198, 213, 416],
  },
  {
    id: "palindrome-expand",
    topic: "dp-1d",
    name: "Expand around centre",
    change: "Instead of a table, ==grow outwards from each of the 2n − 1 centres== while both ends match. Same O(n²), O(1) space.",
    problems: [5, 647],
  },
  {
    id: "unbounded",
    topic: "dp-1d",
    name: "Unbounded pieces",
    change: "`dp[i]` tries ==every piece (coin, word) that could end at i==, and pieces can be reused as often as you like.",
    problems: [322, 139],
  },
  {
    id: "max-min-product",
    topic: "dp-1d",
    name: "Track max and min",
    change: "A negative number flips the order, so carry ==both the largest and the smallest== product ending here.",
    problems: [152],
  },
  {
    id: "lis",
    topic: "dp-1d",
    name: "Best chain ending here",
    change: "`dp[i]` looks back at ==every earlier j== that can link to i, not just the last two. O(n²).",
    problems: [300],
  },
];

export const solutions: Solution[] = [
  {
    lc: 70,
    variation: "step-recurrence",
    question: "You can climb a staircase of n steps one or two at a time; count the different ways to reach the top.",
    intuition: `The last move onto step \`i\` was either a 1-step from \`i - 1\` or a 2-step from \`i - 2\`. So ==\`ways(i) = ways(i - 1) + ways(i - 2)\`==, which is Fibonacci. Only the last two values matter, so ==keep two variables== instead of a table.`,
    algorithm: `1. ==State: \`dp[i]\` = number of ways to stand on step \`i\`==. \`dp[0] = dp[1] = 1\`.
2. For \`i\` from 2 to \`n\`:
   * ==\`dp[i] = dp[i - 1] + dp[i - 2]\`==.
3. Return \`dp[n]\`.
   * In code, \`one\` = \`dp[i - 1]\` and \`two\` = \`dp[i - 2]\` roll forward.`,
    visual: {
      kind: "array",
      title: "Climbing stairs · n = 5",
      values: [1, 1, "", "", "", ""],
      frames: [
        { caption: "Base: 1 way to be at step 0 (do nothing) and 1 way to reach step 1.", highlight: [0, 1], vars: kv({ "dp[i]": "ways to reach step i" }) },
        { caption: "Step 2 = from step 1 + from step 0 = 1 + 1 = 2.", values: [1, 1, 2, "", "", ""], pointers: [{ name: "i", index: 2 }], highlight: [0, 1, 2], done: [] },
        { caption: "Step 3 = 2 + 1 = 3.", values: [1, 1, 2, 3, "", ""], pointers: [{ name: "i", index: 3 }], highlight: [1, 2, 3], done: [0] },
        { caption: "Step 4 = 3 + 2 = 5.", values: [1, 1, 2, 3, 5, ""], pointers: [{ name: "i", index: 4 }], highlight: [2, 3, 4], done: [0, 1] },
        { caption: "Step 5 = 5 + 3 = 8 → answer 8.", values: [1, 1, 2, 3, 5, 8], pointers: [{ name: "i", index: 5 }], highlight: [5], done: [0, 1, 2, 3, 4], vars: kv({ answer: "8" }) },
      ],
    },
    code: `def climbStairs(n: int) -> int:
    one, two = 1, 1  # ways to reach step i - 1 and i - 2
    for _ in range(n - 1):
        one, two = one + two, one
    return one`,
    complexity: "Time O(n) · Space O(1)",
  },
  {
    lc: 746,
    variation: "step-recurrence",
    question: "Each stair has a price you pay when you step off it, moving up one or two at a time; starting on stair 0 or 1, find the cheapest way past the last stair.",
    intuition: `To stand on stair \`i\` you came from \`i - 1\` (paying its price) or \`i - 2\` (paying that one). ==Take the cheaper of the two==. The "top" is one past the last stair, and the first two stairs are free to start on.`,
    algorithm: `1. ==State: \`dp[i]\` = cheapest cost to stand on stair \`i\`==, with \`dp[0] = dp[1] = 0\`. The top is \`i = n\`.
2. For \`i\` from 2 to \`n\`:
   * ==\`dp[i] = min(dp[i - 1] + cost[i - 1], dp[i - 2] + cost[i - 2])\`==.
3. Return \`dp[n]\`.`,
    visual: {
      kind: "array",
      title: "Min cost stairs · cost [1, 4, 2, 6, 1]",
      values: [0, 0, "", "", "", ""],
      frames: [
        { caption: "Starting on stair 0 or 1 is free. Index 5 is the top.", highlight: [0, 1], vars: kv({ cost: "[1, 4, 2, 6, 1]" }) },
        { caption: "dp[2] = min(0 + 4, 0 + 1) = 1 (jump two from stair 0).", values: [0, 0, 1, "", "", ""], pointers: [{ name: "i", index: 2 }], highlight: [2], done: [0, 1] },
        { caption: "dp[3] = min(1 + 2, 0 + 4) = 3.", values: [0, 0, 1, 3, "", ""], pointers: [{ name: "i", index: 3 }], highlight: [3], done: [0, 1, 2] },
        { caption: "dp[4] = min(3 + 6, 1 + 2) = 3: skip the pricey stair 3.", values: [0, 0, 1, 3, 3, ""], pointers: [{ name: "i", index: 4 }], highlight: [4], done: [0, 1, 2, 3] },
        { caption: "Top: dp[5] = min(3 + 1, 3 + 6) = 4. Path 0 → 2 → 4 → top pays 1 + 2 + 1.", values: [0, 0, 1, 3, 3, 4], pointers: [{ name: "i", index: 5 }], highlight: [5], done: [0, 1, 2, 3, 4], vars: kv({ answer: "4" }) },
      ],
    },
    code: `def minCostClimbingStairs(cost: list[int]) -> int:
    n = len(cost)
    dp = [0] * (n + 1)
    for i in range(2, n + 1):
        dp[i] = min(dp[i - 1] + cost[i - 1], dp[i - 2] + cost[i - 2])
    return dp[n]`,
    complexity: "Time O(n) · Space O(n) (O(1) with two variables)",
  },
  {
    lc: 198,
    variation: "take-skip",
    question: "Houses in a row each hold some cash and you can't take from two neighbours; return the most you can collect.",
    intuition: `At each house you either ==skip it== (keep the best so far) or ==take it== (its cash plus the best from two houses back). The answer for the first \`i\` houses only needs the previous two answers, so roll two variables.`,
    algorithm: `1. ==State: \`dp[i]\` = most cash from houses \`0..i\`==.
2. For each house \`i\`:
   * ==\`dp[i] = max(dp[i - 1], dp[i - 2] + nums[i])\`== (skip vs take).
3. Return the last value.
   * In code, \`prev\` = \`dp[i - 2]\` and \`cur\` = \`dp[i - 1]\`.`,
    visual: {
      kind: "array",
      title: "House robber · [3, 1, 4, 9, 2]",
      values: [3, 1, 4, 9, 2],
      frames: [
        { caption: "The houses. Now fill dp[i] = best from the first i + 1 houses.", vars: kv({ nums: "[3, 1, 4, 9, 2]" }) },
        { caption: "dp[0] = 3. dp[1] = max(skip → 3, take → 1) = 3.", values: [3, 3, "", "", ""], pointers: [{ name: "i", index: 1 }], highlight: [0, 1], vars: kv({ nums: "[3, 1, 4, 9, 2]" }) },
        { caption: "dp[2] = max(skip → 3, take 4 + dp[0] 3 = 7) = 7.", values: [3, 3, 7, "", ""], pointers: [{ name: "i", index: 2 }], highlight: [2], done: [0, 1], vars: kv({ nums: "[3, 1, 4, 9, 2]" }) },
        { caption: "dp[3] = max(skip → 7, take 9 + dp[1] 3 = 12) = 12.", values: [3, 3, 7, 12, ""], pointers: [{ name: "i", index: 3 }], highlight: [3], done: [0, 1, 2], vars: kv({ nums: "[3, 1, 4, 9, 2]" }) },
        { caption: "dp[4] = max(skip → 12, take 2 + dp[2] 7 = 9) = 12 → answer 12 (houses 0 and 3).", values: [3, 3, 7, 12, 12], pointers: [{ name: "i", index: 4 }], highlight: [4], done: [0, 1, 2, 3], vars: kv({ answer: "12" }) },
      ],
    },
    code: `def rob(nums: list[int]) -> int:
    prev, cur = 0, 0  # best up to i - 2, best up to i - 1
    for n in nums:
        prev, cur = cur, max(cur, prev + n)
    return cur`,
    complexity: "Time O(n) · Space O(1)",
  },
  {
    lc: 213,
    variation: "take-skip",
    question: "Same no-two-neighbours robbery, but the houses form a circle, so the first and last are neighbours too.",
    intuition: `The circle only adds one rule: ==you can't take both the first and the last house==. So the answer is the better of two plain-row runs: ==one without the last house, one without the first==. A single house is the special case.`,
    algorithm: `1. If there's only one house, return it.
2. ==Run House Robber on \`nums[:-1]\`== (drop the last).
3. ==Run it on \`nums[1:]\`== (drop the first).
4. Return the larger result.
   * Each run: \`prev, cur = cur, max(cur, prev + n)\`.`,
    visual: {
      kind: "array",
      title: "House robber II · circle [4, 1, 2, 7]",
      values: [4, 1, 2, 7],
      frames: [
        { caption: "4 and 7 sit next to each other on the circle, so 4 + 7 = 11 is not allowed.", highlight: [0, 3], vars: kv({ nums: "[4, 1, 2, 7]" }) },
        { caption: "Run 1 drops the last house: best of [4, 1, 2] is 4 + 2 = 6.", values: [4, 4, 6, "–"], range: [0, 2], highlight: [2], vars: kv({ nums: "[4, 1, 2, 7]", "run 1": "6" }) },
        { caption: "Run 2 drops the first house: best of [1, 2, 7] is 1 + 7 = 8.", values: ["–", 1, 2, 8], range: [1, 3], highlight: [3], vars: kv({ nums: "[4, 1, 2, 7]", "run 1": "6", "run 2": "8" }) },
        { caption: "max(6, 8) = 8 → answer 8.", values: [4, 1, 2, 7], highlight: [1, 3], vars: kv({ answer: "8" }) },
      ],
    },
    code: `def rob(nums: list[int]) -> int:
    def line(houses: list[int]) -> int:
        prev, cur = 0, 0
        for n in houses:
            prev, cur = cur, max(cur, prev + n)
        return cur

    if len(nums) == 1:
        return nums[0]
    return max(line(nums[:-1]), line(nums[1:]))`,
    complexity: "Time O(n) · Space O(n) for the slices (O(1) with indexes)",
  },
  {
    lc: 5,
    variation: "palindrome-expand",
    question: "Return the longest contiguous piece of a string that reads the same forwards and backwards.",
    intuition: `Every palindrome mirrors around a centre: ==a single letter (odd length) or the gap between two letters (even length)==. From each of those centres, ==expand while both ends match==, and keep the longest span seen.`,
    algorithm: `1. Track \`start\` and \`best\` length.
2. For each index \`i\`, try two centres: \`(i, i)\` and \`(i, i + 1)\`:
   * ==While \`l\` and \`r\` are in bounds and \`s[l] == s[r]\`==, move \`l -= 1\`, \`r += 1\`.
   * The palindrome is \`s[l + 1 : r]\` with length \`r - l - 1\`; keep it if it's longer.
3. Return \`s[start : start + best]\`.`,
    visual: {
      kind: "array",
      title: "Longest palindrome · \"cabbad\"",
      values: ["c", "a", "b", "b", "a", "d"],
      frames: [
        { caption: "Odd centres at c and a only give length 1; the even gaps c|a and a|b don't match.", pointers: [{ name: "i", index: 1 }], highlight: [1], vars: kv({ best: "\"c\" (1)" }) },
        { caption: "i = 2, even centre (2, 3): b and b match → \"bb\".", pointers: [{ name: "l", index: 2 }, { name: "r", index: 3 }], range: [2, 3], vars: kv({ best: "\"bb\" (2)" }) },
        { caption: "Expand: s[1] and s[4] are both a → \"abba\".", pointers: [{ name: "l", index: 1 }, { name: "r", index: 4 }], range: [1, 4], vars: kv({ best: "\"abba\" (4)" }) },
        { caption: "Expand again: c != d → stop. Span is l + 1 .. r - 1.", pointers: [{ name: "l", index: 0 }, { name: "r", index: 5 }], range: [1, 4], highlight: [0, 5], vars: kv({ best: "\"abba\" (4)" }) },
        { caption: "No later centre beats length 4 → answer \"abba\".", range: [1, 4], done: [1, 2, 3, 4], vars: kv({ answer: "abba" }) },
      ],
    },
    code: `def longestPalindrome(s: str) -> str:
    start, best = 0, 0
    for i in range(len(s)):
        for l, r in ((i, i), (i, i + 1)):
            while l >= 0 and r < len(s) and s[l] == s[r]:
                l -= 1
                r += 1
            if r - l - 1 > best:
                start, best = l + 1, r - l - 1
    return s[start:start + best]`,
    complexity: "Time O(n²) · Space O(1)",
  },
  {
    lc: 647,
    variation: "palindrome-expand",
    question: "Count how many contiguous pieces of a string are palindromes (the same piece at different positions counts separately).",
    intuition: `Same centres as the longest-palindrome problem, but ==every successful expansion step is one more palindrome==. Count them instead of tracking the longest. Odd and even centres together cover every palindrome exactly once.`,
    algorithm: `1. \`count = 0\`.
2. For each \`i\`, for each centre \`(i, i)\` and \`(i, i + 1)\`:
   * While in bounds and \`s[l] == s[r]\`:
      * ==\`count += 1\`== (s[l..r] is a palindrome).
      * \`l -= 1\`, \`r += 1\`.
3. Return \`count\`.`,
    visual: {
      kind: "array",
      title: "Count palindromes · \"abaa\"",
      values: ["a", "b", "a", "a"],
      frames: [
        { caption: "i = 0: \"a\" counts. Even gap a|b doesn't match.", pointers: [{ name: "i", index: 0 }], highlight: [0], vars: kv({ count: "1" }) },
        { caption: "i = 1: \"b\" counts, then expand: a == a → \"aba\" counts too.", pointers: [{ name: "l", index: 0 }, { name: "r", index: 2 }], range: [0, 2], vars: kv({ count: "3" }) },
        { caption: "i = 2: \"a\" counts; expanding b vs a fails. Even gap (2, 3): \"aa\" counts.", pointers: [{ name: "l", index: 2 }, { name: "r", index: 3 }], range: [2, 3], vars: kv({ count: "5" }) },
        { caption: "i = 3: \"a\" counts. Total 6.", pointers: [{ name: "i", index: 3 }], highlight: [3], done: [0, 1, 2], vars: kv({ count: "6", answer: "6" }) },
      ],
    },
    code: `def countSubstrings(s: str) -> int:
    count = 0
    for i in range(len(s)):
        for l, r in ((i, i), (i, i + 1)):
            while l >= 0 and r < len(s) and s[l] == s[r]:
                count += 1
                l -= 1
                r += 1
    return count`,
    complexity: "Time O(n²) · Space O(1)",
  },
  {
    lc: 91,
    variation: "step-recurrence",
    question: "Letters A–Z are written as the numbers 1–26; given a string of digits, count the ways to read it back as letters.",
    intuition: `The last letter used either ==one digit== (1–9, never "0") or ==two digits== (10–26). So it's Climbing Stairs where each step is only allowed if the digits form a valid code. Zeros are the trap: "0" alone is never a letter.`,
    algorithm: `1. ==State: \`dp[i]\` = ways to decode the first \`i\` digits==, with \`dp[0] = 1\` (empty prefix).
2. For \`i\` from 1 to \`n\`:
   * If \`s[i - 1] != "0"\`, add \`dp[i - 1]\` (one-digit letter).
   * If \`10 <= int(s[i - 2:i]) <= 26\`, add \`dp[i - 2]\` (two-digit letter).
   * ==\`dp[i] = dp[i - 1]·[one ok] + dp[i - 2]·[two ok]\`==
3. Return \`dp[n]\`.`,
    visual: {
      kind: "array",
      title: "Decode ways · \"1201\"",
      values: [1, "", "", "", ""],
      frames: [
        { caption: "dp[0] = 1: one way to decode nothing.", pointers: [{ name: "i", index: 0 }], highlight: [0], vars: kv({ s: "1 2 0 1" }) },
        { caption: "i = 1, \"1\": one-digit ok → dp[1] = dp[0] = 1.", values: [1, 1, "", "", ""], pointers: [{ name: "i", index: 1 }], highlight: [1], done: [0], vars: kv({ s: "1 2 0 1" }) },
        { caption: "i = 2, \"2\" ok and \"12\" ok → dp[2] = dp[1] + dp[0] = 2 (1,2 or 12).", values: [1, 1, 2, "", ""], pointers: [{ name: "i", index: 2 }], highlight: [0, 1, 2], vars: kv({ s: "1 2 0 1" }) },
        { caption: "i = 3, \"0\" alone is invalid; \"20\" ok → dp[3] = dp[1] = 1. The 2 is forced into 20.", values: [1, 1, 2, 1, ""], pointers: [{ name: "i", index: 3 }], highlight: [1, 3], done: [0, 2], vars: kv({ s: "1 2 0 1" }) },
        { caption: "i = 4, \"1\" ok, \"01\" invalid → dp[4] = dp[3] = 1. Only 1,20,1 works.", values: [1, 1, 2, 1, 1], pointers: [{ name: "i", index: 4 }], highlight: [3, 4], done: [0, 1, 2], vars: kv({ answer: "1" }) },
      ],
    },
    code: `def numDecodings(s: str) -> int:
    n = len(s)
    dp = [0] * (n + 1)
    dp[0] = 1
    for i in range(1, n + 1):
        if s[i - 1] != "0":
            dp[i] += dp[i - 1]
        if i >= 2 and 10 <= int(s[i - 2:i]) <= 26:
            dp[i] += dp[i - 2]
    return dp[n]`,
    complexity: "Time O(n) · Space O(n) (O(1) with two variables)",
  },
  {
    lc: 322,
    variation: "unbounded",
    question: "Given coin values (unlimited supply of each) and an amount, return the fewest coins that add up to it, or -1 if impossible.",
    intuition: `Greedy (biggest coin first) can fail: with coins 1, 3, 4 and amount 6 it gives 4+1+1 but 3+3 is better. Instead ==solve every smaller amount first==: the best for \`a\` is ==one coin \`c\` plus the best for \`a - c\`==, tried over every coin.`,
    algorithm: `1. ==State: \`dp[a]\` = fewest coins that make amount \`a\`==. \`dp[0] = 0\`, everything else starts at \`amount + 1\` (acts as infinity).
2. For \`a\` from 1 to \`amount\`:
   * For each coin \`c <= a\`:
      * ==\`dp[a] = min(dp[a], dp[a - c] + 1)\`==.
3. Return \`dp[amount]\` if it's ≤ \`amount\`, else \`-1\`.`,
    visual: {
      kind: "array",
      title: "Coin change · coins [1, 3, 4], amount 6",
      values: [0, "", "", "", "", "", ""],
      frames: [
        { caption: "dp[0] = 0. Index = amount.", highlight: [0], vars: kv({ coins: "[1, 3, 4]" }) },
        { caption: "Amounts 1 and 2 can only use 1s → 1 and 2 coins.", values: [0, 1, 2, "", "", "", ""], highlight: [1, 2], done: [0], vars: kv({ coins: "[1, 3, 4]" }) },
        { caption: "Amounts 3 and 4 are a single coin each → 1.", values: [0, 1, 2, 1, 1, "", ""], highlight: [3, 4], done: [0, 1, 2], vars: kv({ coins: "[1, 3, 4]" }) },
        { caption: "a = 5: coin 1 → dp[4]+1 = 2, coin 3 → dp[2]+1 = 3, coin 4 → dp[1]+1 = 2. Min 2.", values: [0, 1, 2, 1, 1, 2, ""], pointers: [{ name: "a", index: 5 }], highlight: [5], done: [0, 1, 2, 3, 4], vars: kv({ coins: "[1, 3, 4]" }) },
        { caption: "a = 6: coin 1 → 3, coin 3 → dp[3]+1 = 2, coin 4 → dp[2]+1 = 3. Answer 2 (3+3), greedy would say 3.", values: [0, 1, 2, 1, 1, 2, 2], pointers: [{ name: "a", index: 6 }, { name: "a-c", index: 3 }], highlight: [3, 6], done: [0, 1, 2, 4, 5], vars: kv({ answer: "2" }) },
      ],
    },
    code: `def coinChange(coins: list[int], amount: int) -> int:
    dp = [0] + [amount + 1] * amount
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a:
                dp[a] = min(dp[a], dp[a - c] + 1)
    return dp[amount] if dp[amount] <= amount else -1`,
    complexity: "Time O(amount · coins) · Space O(amount)",
  },
  {
    lc: 152,
    variation: "max-min-product",
    question: "Given a list of integers (possibly negative or zero), return the largest product of any contiguous run of them.",
    intuition: `With sums you only keep the best run ending here. With products, ==a very negative run times a negative number becomes very positive==. So carry ==both the max and the min product ending at \`i\`==; the new max is the best of \`n\`, \`n·max\` and \`n·min\`. Zero resets both, since \`n\` alone wins.`,
    algorithm: `1. \`res = max(nums)\`, \`cur_max = cur_min = 1\`.
2. For each \`n\`:
   * \`cand = (n, n * cur_max, n * cur_min)\`.
   * ==\`cur_max = max(cand)\`, \`cur_min = min(cand)\`== (computed from the old values together).
   * \`res = max(res, cur_max)\`.
3. Return \`res\`.`,
    visual: {
      kind: "array",
      title: "Max product subarray · [2, 3, -2, 4, -1]",
      values: [2, 3, -2, 4, -1],
      frames: [
        { caption: "n = 2: max = min = 2.", pointers: [{ name: "i", index: 0 }], highlight: [0], vars: kv({ max: "2", min: "2", res: "2" }) },
        { caption: "n = 3: candidates 3, 6, 6 → max 6, min 3.", pointers: [{ name: "i", index: 1 }], highlight: [1], done: [0], vars: kv({ max: "6", min: "3", res: "6" }) },
        { caption: "n = -2: candidates -2, -12, -6 → max -2, but min -12 is kept for later.", pointers: [{ name: "i", index: 2 }], highlight: [2], done: [0, 1], vars: kv({ max: "-2", min: "-12", res: "6" }) },
        { caption: "n = 4: candidates 4, -8, -48 → max 4, min -48.", pointers: [{ name: "i", index: 3 }], highlight: [3], done: [0, 1, 2], vars: kv({ max: "4", min: "-48", res: "6" }) },
        { caption: "n = -1: -48 × -1 = 48 flips to the top → res 48 (the whole array).", pointers: [{ name: "i", index: 4 }], range: [0, 4], vars: kv({ max: "48", min: "-4", res: "48", answer: "48" }) },
      ],
    },
    code: `def maxProduct(nums: list[int]) -> int:
    res = max(nums)
    cur_max, cur_min = 1, 1
    for n in nums:
        cand = (n, n * cur_max, n * cur_min)
        cur_max, cur_min = max(cand), min(cand)
        res = max(res, cur_max)
    return res`,
    complexity: "Time O(n) · Space O(1)",
  },
  {
    lc: 139,
    variation: "unbounded",
    question: "Given a string and a list of dictionary words (each usable any number of times), say whether the string can be split entirely into those words.",
    intuition: `A prefix of length \`i\` is splittable if ==some word ends exactly at \`i\` and the part before it was already splittable==. Build that answer for every prefix length, from short to long. Words can be reused, just like coins.`,
    algorithm: `1. ==State: \`dp[i]\` = can \`s[:i]\` be split into words==. \`dp[0] = True\`.
2. For \`i\` from 1 to \`len(s)\`:
   * For each word \`w\`:
      * ==If \`dp[i - len(w)]\` and \`s[i - len(w):i] == w\`==, set \`dp[i] = True\` and stop.
3. Return \`dp[len(s)]\`.`,
    visual: {
      kind: "array",
      title: "Word break · \"applepie\" with app, apple, pie",
      values: ["T", "", "", "", "", "", "", "", ""],
      frames: [
        { caption: "dp[0] = True: the empty prefix needs no words. Index = prefix length.", highlight: [0], vars: kv({ words: "app, apple, pie" }) },
        { caption: "i = 3: \"app\" ends here and dp[0] is True → dp[3] = True.", values: ["T", "F", "F", "T", "", "", "", "", ""], pointers: [{ name: "i", index: 3 }], highlight: [0, 3], vars: kv({ words: "app, apple, pie" }) },
        { caption: "i = 4: no word ends at \"appl\" → False.", values: ["T", "F", "F", "T", "F", "", "", "", ""], pointers: [{ name: "i", index: 4 }], highlight: [4], done: [0, 3], vars: kv({ words: "app, apple, pie" }) },
        { caption: "i = 5: \"apple\" ends here and dp[0] is True → dp[5] = True.", values: ["T", "F", "F", "T", "F", "T", "", "", ""], pointers: [{ name: "i", index: 5 }], highlight: [0, 5], done: [3], vars: kv({ words: "app, apple, pie" }) },
        { caption: "i = 6, 7: nothing fits (\"lep\" isn't a word) → False.", values: ["T", "F", "F", "T", "F", "T", "F", "F", ""], highlight: [6, 7], done: [0, 3, 5], vars: kv({ words: "app, apple, pie" }) },
        { caption: "i = 8: \"pie\" ends here and dp[5] is True → True. apple + pie.", values: ["T", "F", "F", "T", "F", "T", "F", "F", "T"], pointers: [{ name: "i", index: 8 }], highlight: [5, 8], done: [0, 3], vars: kv({ answer: "True" }) },
      ],
    },
    code: `def wordBreak(s: str, wordDict: list[str]) -> bool:
    words = set(wordDict)
    dp = [False] * (len(s) + 1)
    dp[0] = True
    for i in range(1, len(s) + 1):
        for w in words:
            if i >= len(w) and dp[i - len(w)] and s[i - len(w):i] == w:
                dp[i] = True
                break
    return dp[len(s)]`,
    complexity: "Time O(n · m · k) for m words of length ≤ k · Space O(n)",
  },
  {
    lc: 300,
    variation: "lis",
    question: "Given a list of integers, return the length of the longest strictly increasing sequence you can pick out of it, keeping the original order.",
    intuition: `Ask for each position: ==what's the longest increasing chain that ends right here?== It's 1 plus the best chain ending at any earlier, smaller value. The answer is the biggest of those. (An O(n log n) version keeps a "smallest tail per length" list and binary-searches it.)`,
    algorithm: `1. ==State: \`dp[i]\` = longest increasing subsequence that ends at index \`i\`==. Start every \`dp[i] = 1\`.
2. For each \`i\`, for each \`j < i\`:
   * If \`nums[j] < nums[i]\`, ==\`dp[i] = max(dp[i], dp[j] + 1)\`==.
3. Return \`max(dp)\`.`,
    visual: {
      kind: "array",
      title: "LIS · [5, 2, 8, 6, 3, 6, 9, 7]",
      values: [5, 2, 8, 6, 3, 6, 9, 7],
      frames: [
        { caption: "The input. Below, the values are replaced by dp: best chain ending at each index.", vars: kv({ nums: "[5, 2, 8, 6, 3, 6, 9, 7]" }) },
        { caption: "5 and 2 have nothing smaller before them → 1. 8 extends 5 or 2 → 2.", values: [1, 1, 2, "", "", "", "", ""], pointers: [{ name: "i", index: 2 }], highlight: [2], done: [0, 1], vars: kv({ nums: "[5, 2, 8, 6, 3, 6, 9, 7]" }) },
        { caption: "6 extends 5 or 2 → 2. 3 extends 2 → 2.", values: [1, 1, 2, 2, 2, "", "", ""], pointers: [{ name: "i", index: 4 }], highlight: [3, 4], done: [0, 1, 2], vars: kv({ nums: "[5, 2, 8, 6, 3, 6, 9, 7]" }) },
        { caption: "Second 6: best earlier smaller is 3 (dp 2) → 3, chain 2, 3, 6.", values: [1, 1, 2, 2, 2, 3, "", ""], pointers: [{ name: "i", index: 5 }, { name: "j", index: 4 }], highlight: [4, 5], done: [0, 1, 2, 3], vars: kv({ nums: "[5, 2, 8, 6, 3, 6, 9, 7]" }) },
        { caption: "9 extends that 6 → 4. 7 also extends it → 4.", values: [1, 1, 2, 2, 2, 3, 4, 4], pointers: [{ name: "i", index: 7 }], highlight: [6, 7], done: [0, 1, 2, 3, 4, 5], vars: kv({ nums: "[5, 2, 8, 6, 3, 6, 9, 7]" }) },
        { caption: "max(dp) = 4, e.g. 2, 3, 6, 9.", values: [1, 1, 2, 2, 2, 3, 4, 4], highlight: [1, 4, 5, 6], vars: kv({ answer: "4" }) },
      ],
    },
    code: `def lengthOfLIS(nums: list[int]) -> int:
    dp = [1] * len(nums)
    for i in range(len(nums)):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp)`,
    complexity: "Time O(n²) · Space O(n)",
  },
  {
    lc: 416,
    variation: "take-skip",
    question: "Given a list of positive integers, say whether it can be split into two groups with equal sums.",
    intuition: `Two equal halves means ==one group sums to exactly \`total / 2\`== (so an odd total is impossible). That's 0/1 subset sum: each number is taken or skipped once. Keep a boolean per reachable sum and ==loop sums downwards== so a number can't be used twice in the same pass.`,
    algorithm: `1. If \`sum(nums)\` is odd, return \`False\`. \`target = sum // 2\`.
2. ==State: \`dp[s]\` = some subset seen so far sums to \`s\`==. \`dp[0] = True\`.
3. For each \`n\`:
   * For \`s\` from \`target\` ==down to== \`n\`:
      * ==\`dp[s] = dp[s] or dp[s - n]\`== (skip or take \`n\`).
4. Return \`dp[target]\`.`,
    visual: {
      kind: "array",
      title: "Partition equal subset · [3, 1, 1, 2, 2, 1] → target 5",
      values: ["T", "", "", "", "", ""],
      frames: [
        { caption: "Total 10 → target 5. Index = a subset sum; only 0 is reachable at the start.", highlight: [0], vars: kv({ nums: "[3, 1, 1, 2, 2, 1]" }) },
        { caption: "Take 3: sum 3 becomes reachable.", values: ["T", "", "", "T", "", ""], highlight: [3], done: [0], vars: kv({ n: "3" }) },
        { caption: "Take 1 (looping 5 down to 1): 4 = 3 + 1 and 1 = 0 + 1.", values: ["T", "T", "", "T", "T", ""], highlight: [1, 4], done: [0, 3], vars: kv({ n: "1" }) },
        { caption: "Next 1: 5 = 4 + 1 and 2 = 1 + 1 → target reached.", values: ["T", "T", "T", "T", "T", "T"], pointers: [{ name: "target", index: 5 }], highlight: [2, 5], done: [0, 1, 3, 4], vars: kv({ n: "1", answer: "True" }) },
      ],
    },
    code: `def canPartition(nums: list[int]) -> bool:
    total = sum(nums)
    if total % 2:
        return False
    target = total // 2
    dp = [False] * (target + 1)
    dp[0] = True
    for n in nums:
        for s in range(target, n - 1, -1):
            dp[s] = dp[s] or dp[s - n]
    return dp[target]`,
    complexity: "Time O(n · target) · Space O(target)",
  },
];

/** Recognise-it cues for the Roadmap flashcards. */