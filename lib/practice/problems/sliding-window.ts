/**
 * Arena problems: sliding-window. Same problems as LeetCode, our own words, verified tests (see ../types.ts).
 * - 121 Best Time to Buy and Sell Stock (Easy)
 * - 3 Longest Substring Without Repeating Characters (Medium)
 * - 424 Longest Repeating Character Replacement (Medium)
 * - 567 Permutation in String (Medium)
 * - 76 Minimum Window Substring (Hard)
 * - 239 Sliding Window Maximum (Hard)
 */
import type { ArenaProblem } from "../types";

export const arena: ArenaProblem[] = [
  {
    lc: 121,
    kind: "algorithm",
    statement: `\`prices[i]\` is a stock's price on day \`i\`. You may make **at most one trade**: buy one share on some day, then sell it on a **strictly later** day.

Return the largest profit you can make. If no trade makes money, return \`0\` (you simply don't trade).`,
    examples: [
      { input: "prices = [9, 4, 6, 2, 8, 5]", output: "6", explanation: "Buy at 2 (day 3), sell at 8 (day 4): profit 6." },
      { input: "prices = [10, 8, 5, 3]", output: "0", explanation: "Prices only fall, so the best choice is not to trade." },
    ],
    constraints: ["1 <= prices.length <= 10^5", "0 <= prices[i] <= 10^4"],
    signature: `class Solution:
    def maxProfit(self, prices: List[int]) -> int:`,
    method: "maxProfit",
    tests: [
      { id: "ex1", input: "[[9, 4, 6, 2, 8, 5]]", expected: "6", visible: true },
      { id: "ex2", input: "[[10, 8, 5, 3]]", expected: "0", visible: true },
      { id: "single", input: "[[5]]", expected: "0", visible: false },
      { id: "flat", input: "[[3, 3, 3, 3]]", expected: "0", visible: false },
      { id: "rising", input: "[[1, 2, 3, 4, 5, 6]]", expected: "5", visible: false },
      { id: "low-late", input: "[[4, 11, 1, 6]]", expected: "7", visible: false },
      { id: "zeros", input: "[[0, 0, 10000]]", expected: "10000", visible: false },
      { id: "dip-recover", input: "[[7, 2, 5, 1, 3, 6, 4]]", expected: "5", visible: false },
      { id: "big", input: "[[(i * 37) % 10001 for i in range(100000)]]", expected: "10000", visible: false },
    ],
    solution: `class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        l, best = 0, 0
        for r in range(1, len(prices)):
            if prices[r] < prices[l]:
                l = r
            else:
                best = max(best, prices[r] - prices[l])
        return best`,
    hints: ["For each selling day, the best buy is the cheapest price seen before it.", "Track the running minimum as you sweep left to right.", "Profit for day r is prices[r] - min so far; keep the largest."],
    clarify: [
      { question: "Can I buy and sell on the same day?", answer: "That gives 0 profit, which is the same as not trading." },
      { question: "Can I make several trades?", answer: "No, at most one buy followed by one sell." },
      { question: "What if the price never rises?", answer: "Return 0." },
    ],
  },
  {
    lc: 3,
    kind: "algorithm",
    statement: `Given a string \`s\`, return the length of the longest **substring** (a contiguous run of characters) in which **no character appears twice**.

- \`s\` may be empty, in which case the answer is \`0\`.
- Characters can be letters, digits, symbols or spaces; they are compared exactly (case-sensitive).`,
    examples: [
      { input: "s = \"pwwkewxy\"", output: "5", explanation: "\"kewxy\" has 5 distinct characters." },
      { input: "s = \"zzzz\"", output: "1", explanation: "Any window longer than 1 repeats z." },
      { input: "s = \"tmmzuxt\"", output: "5", explanation: "\"mzuxt\" has length 5." },
    ],
    constraints: ["0 <= s.length <= 5 * 10^4", "s consists of English letters, digits, symbols and spaces."],
    signature: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:`,
    method: "lengthOfLongestSubstring",
    tests: [
      { id: "ex1", input: "[\"pwwkewxy\"]", expected: "5", visible: true },
      { id: "ex2", input: "[\"zzzz\"]", expected: "1", visible: true },
      { id: "ex3", input: "[\"tmmzuxt\"]", expected: "5", visible: true },
      { id: "empty", input: "[\"\"]", expected: "0", visible: false },
      { id: "space", input: "[\" \"]", expected: "1", visible: false },
      { id: "all-distinct", input: "[\"abcdefg\"]", expected: "7", visible: false },
      { id: "case", input: "[\"aAbBaA\"]", expected: "4", visible: false },
      { id: "abba", input: "[\"abba\"]", expected: "2", visible: false },
      { id: "symbols", input: "[\"a b!c a\"]", expected: "5", visible: false },
      { id: "big", input: "[\"\".join(chr(33 + (i * 7) % 90) for i in range(50000))]", expected: "90", visible: false },
    ],
    solution: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        seen = set()
        l, best = 0, 0
        for r, c in enumerate(s):
            while c in seen:
                seen.remove(s[l])
                l += 1
            seen.add(c)
            best = max(best, r - l + 1)
        return best`,
    hints: ["Keep a window [l, r] that never contains a repeat.", "When s[r] is already in the window, move l right until it isn't.", "A set (or last-seen index map) gives O(1) membership checks."],
    clarify: [
      { question: "Substring or subsequence?", answer: "Substring: characters must be contiguous." },
      { question: "Is it case-sensitive?", answer: "Yes, 'a' and 'A' are different characters." },
      { question: "What about the empty string?", answer: "Return 0." },
    ],
  },
  {
    lc: 424,
    kind: "algorithm",
    statement: `You have a string \`s\` of uppercase English letters and an integer \`k\`. You may change **at most \`k\`** characters of \`s\` into any other uppercase letter.

Return the length of the longest substring that can be made to consist of **one repeated letter** after those changes.`,
    examples: [
      { input: "s = \"BAAB\", k = 1", output: "3", explanation: "Change one B to get \"AAA\" + \"B\" or \"B\" + \"AAA\": length 3." },
      { input: "s = \"XYXXZXX\", k = 2", output: "7", explanation: "Turn Y and Z into X: the whole string becomes X, length 7." },
    ],
    constraints: ["1 <= s.length <= 10^5", "s contains only uppercase English letters", "0 <= k <= s.length"],
    signature: `class Solution:
    def characterReplacement(self, s: str, k: int) -> int:`,
    method: "characterReplacement",
    tests: [
      { id: "ex1", input: "[\"BAAB\", 1]", expected: "3", visible: true },
      { id: "ex2", input: "[\"XYXXZXX\", 2]", expected: "7", visible: true },
      { id: "k-zero", input: "[\"AABBBCC\", 0]", expected: "3", visible: false },
      { id: "single", input: "[\"Q\", 0]", expected: "1", visible: false },
      { id: "k-covers-all", input: "[\"ABCD\", 4]", expected: "4", visible: false },
      { id: "uniform", input: "[\"MMMM\", 2]", expected: "4", visible: false },
      { id: "mid", input: "[\"AABABBA\", 1]", expected: "4", visible: false },
      { id: "spread", input: "[\"ABCABCABC\", 2]", expected: "4", visible: false },
      { id: "big", input: "[\"\".join(chr(65 + (i * i) % 26) for i in range(100000)), 300]", expected: "326", visible: false },
    ],
    solution: `class Solution:
    def characterReplacement(self, s: str, k: int) -> int:
        count = {}
        l, maxf, best = 0, 0, 0
        for r, c in enumerate(s):
            count[c] = count.get(c, 0) + 1
            maxf = max(maxf, count[c])
            while (r - l + 1) - maxf > k:
                count[s[l]] -= 1
                l += 1
            best = max(best, r - l + 1)
        return best`,
    hints: ["A window is fixable when (window length - count of its most common letter) <= k.", "Grow the window to the right; shrink from the left while it isn't fixable.", "You don't need to lower the max frequency when shrinking: the answer only grows when a bigger max is found."],
    clarify: [
      { question: "Must the k changes all go to the same letter?", answer: "They should; the goal is a run of one letter, so changing to anything else doesn't help." },
      { question: "Do I have to use all k changes?", answer: "No, at most k." },
      { question: "Can k be 0?", answer: "Yes; then the answer is the longest existing run." },
    ],
  },
  {
    lc: 567,
    kind: "algorithm",
    statement: `Given two strings \`s1\` and \`s2\`, return \`True\` if some **contiguous substring of \`s2\`** is a rearrangement (permutation) of \`s1\`, i.e. it has exactly the same letters with the same counts. Otherwise return \`False\`.

- If \`s1\` is longer than \`s2\`, the answer is \`False\`.`,
    examples: [
      { input: "s1 = \"abc\", s2 = \"xxcabyy\"", output: "True", explanation: "\"cab\" (indices 2..4) uses the same letters as \"abc\"." },
      { input: "s1 = \"ab\", s2 = \"axxb\"", output: "False", explanation: "a and b never sit next to each other." },
    ],
    constraints: ["1 <= s1.length, s2.length <= 10^4", "Both strings contain only lowercase English letters."],
    signature: `class Solution:
    def checkInclusion(self, s1: str, s2: str) -> bool:`,
    method: "checkInclusion",
    tests: [
      { id: "ex1", input: "[\"abc\", \"xxcabyy\"]", expected: "True", visible: true },
      { id: "ex2", input: "[\"ab\", \"axxb\"]", expected: "False", visible: true },
      { id: "longer", input: "[\"abcd\", \"abc\"]", expected: "False", visible: false },
      { id: "equal", input: "[\"listen\", \"silent\"]", expected: "True", visible: false },
      { id: "single-hit", input: "[\"z\", \"abz\"]", expected: "True", visible: false },
      { id: "counts-matter", input: "[\"aab\", \"abab\"]", expected: "True", visible: false },
      { id: "counts-miss", input: "[\"aabb\", \"ababa\"]", expected: "True", visible: false },
      { id: "at-start", input: "[\"ba\", \"abzzz\"]", expected: "True", visible: false },
      { id: "big", input: "[\"\".join(chr(97 + i % 26) for i in range(26)), \"\".join(chr(97 + (i * 3) % 26) for i in range(9990)) + \"zyxwvutsrqponmlkjihgfedcba\"]", expected: "True", visible: false },
      { id: "big-miss", input: "[\"aaaab\", \"a\" * 9999 + \"c\"]", expected: "False", visible: false },
    ],
    solution: `class Solution:
    def checkInclusion(self, s1: str, s2: str) -> bool:
        m = len(s1)
        if m > len(s2):
            return False
        need, win = [0] * 26, [0] * 26
        for i in range(m):
            need[ord(s1[i]) - ord("a")] += 1
            win[ord(s2[i]) - ord("a")] += 1
        if need == win:
            return True
        for r in range(m, len(s2)):
            win[ord(s2[r]) - ord("a")] += 1
            win[ord(s2[r - m]) - ord("a")] -= 1
            if win == need:
                return True
        return False`,
    hints: ["Any match is a window of s2 with length exactly len(s1).", "Compare letter counts instead of sorting each window.", "Slide the window one step at a time: add the new letter, remove the one leaving."],
    clarify: [
      { question: "Does the order inside the substring matter?", answer: "No, any arrangement of s1's letters counts." },
      { question: "Must the substring be contiguous?", answer: "Yes." },
      { question: "What if s1 is longer than s2?", answer: "Return False." },
    ],
  },
  {
    lc: 76,
    kind: "algorithm",
    statement: `Given strings \`s\` and \`t\`, return the **shortest substring of \`s\`** that contains every character of \`t\`, **counting duplicates** (if \`t\` has two \`a\`s, the window needs at least two \`a\`s).

- If no such substring exists, return the empty string \`""\`.
- Inputs are chosen so that the shortest window is unique.
- Letters are case-sensitive.`,
    examples: [
      { input: "s = \"XAYBZCAB\", t = \"ABC\"", output: "\"CAB\"", explanation: "\"CAB\" (the last three letters) holds A, B and C; every other valid window, like \"AYBZC\", is longer." },
      { input: "s = \"q\", t = \"qq\"", output: "\"\"", explanation: "t needs two q's but s only has one." },
    ],
    constraints: ["1 <= s.length, t.length <= 10^5", "s and t consist of uppercase and lowercase English letters."],
    signature: `class Solution:
    def minWindow(self, s: str, t: str) -> str:`,
    method: "minWindow",
    tests: [
      { id: "ex1", input: "[\"XAYBZCAB\", \"ABC\"]", expected: "\"CAB\"", visible: true },
      { id: "ex2", input: "[\"q\", \"qq\"]", expected: "\"\"", visible: true },
      { id: "same", input: "[\"k\", \"k\"]", expected: "\"k\"", visible: false },
      { id: "whole", input: "[\"abc\", \"cba\"]", expected: "\"abc\"", visible: false },
      { id: "dups", input: "[\"aaflslflsldkalskaaa\", \"aaa\"]", expected: "\"aaa\"", visible: false },
      { id: "case", input: "[\"aAbBa\", \"Ab\"]", expected: "\"Ab\"", visible: false },
      { id: "missing", input: "[\"abcdef\", \"g\"]", expected: "\"\"", visible: false },
      { id: "t-longer", input: "[\"ab\", \"abc\"]", expected: "\"\"", visible: false },
      { id: "inside", input: "[\"xxxxDOGxxCATDxx\", \"TAD\"]", expected: "\"ATD\"", visible: false },
      { id: "big", input: "[\"a\" * 50000 + \"b\" + \"a\" * 49999 + \"c\", \"bc\"]", expected: "\"b\" + \"a\" * 49999 + \"c\"", visible: false },
    ],
    solution: `class Solution:
    def minWindow(self, s: str, t: str) -> str:
        count_t = {}
        for c in t:
            count_t[c] = count_t.get(c, 0) + 1
        window = {}
        have, need = 0, len(count_t)
        best_len, best_l = float("inf"), 0
        l = 0
        for r, c in enumerate(s):
            window[c] = window.get(c, 0) + 1
            if c in count_t and window[c] == count_t[c]:
                have += 1
            while have == need:
                if r - l + 1 < best_len:
                    best_len, best_l = r - l + 1, l
                window[s[l]] -= 1
                if s[l] in count_t and window[s[l]] < count_t[s[l]]:
                    have -= 1
                l += 1
        return s[best_l : best_l + best_len] if best_len != float("inf") else ""`,
    hints: ["Count what t needs, then expand a window over s until it satisfies every count.", "Once the window is valid, shrink it from the left as far as it stays valid, recording the best.", "Track how many distinct characters are fully satisfied so the validity check is O(1)."],
    clarify: [
      { question: "Do duplicates in t matter?", answer: "Yes, the window must contain each character at least as many times as t does." },
      { question: "Is it case-sensitive?", answer: "Yes." },
      { question: "What if no window works?", answer: "Return the empty string." },
    ],
  },
  {
    lc: 239,
    kind: "algorithm",
    statement: `You get an integer array \`nums\` and a window size \`k\`. A window covering \`k\` consecutive elements starts at index 0 and slides right one step at a time until it touches the last element.

Return a list with the **maximum value of each window position**, in order from left to right (so the result has \`len(nums) - k + 1\` entries).

- Aim for **O(n)** total time.`,
    examples: [
      { input: "nums = [2, -1, 4, 0, 3, 1, 5], k = 3", output: "[4, 4, 4, 3, 5]", explanation: "Windows: [2,-1,4] -> 4, [-1,4,0] -> 4, [4,0,3] -> 4, [0,3,1] -> 3, [3,1,5] -> 5." },
      { input: "nums = [6], k = 1", output: "[6]" },
    ],
    constraints: ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4", "1 <= k <= nums.length"],
    signature: `class Solution:
    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:`,
    method: "maxSlidingWindow",
    tests: [
      { id: "ex1", input: "[[2, -1, 4, 0, 3, 1, 5], 3]", expected: "[4, 4, 4, 3, 5]", visible: true },
      { id: "ex2", input: "[[6], 1]", expected: "[6]", visible: true },
      { id: "k-one", input: "[[3, -2, 7, 1], 1]", expected: "[3, -2, 7, 1]", visible: false },
      { id: "k-full", input: "[[3, -2, 7, 1], 4]", expected: "[7]", visible: false },
      { id: "decreasing", input: "[[9, 8, 7, 6, 5], 2]", expected: "[9, 8, 7, 6]", visible: false },
      { id: "increasing", input: "[[1, 2, 3, 4, 5], 3]", expected: "[3, 4, 5]", visible: false },
      { id: "dups", input: "[[4, 4, 4, 1, 4], 2]", expected: "[4, 4, 4, 4]", visible: false },
      { id: "negatives", input: "[[-5, -9, -1, -3, -7], 3]", expected: "[-1, -1, -1]", visible: false },
      { id: "big-cycle", input: "[[i % 1000 for i in range(100000)], 1000]", expected: "[999] * 99001", visible: false },
      { id: "big-desc", input: "[list(range(10000, -10000, -1)) * 5, 700]", expected: "(list(range(10000, -9301, -1)) + [10000] * 699) * 4 + list(range(10000, -9301, -1))", visible: false },
    ],
    solution: `class Solution:
    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:
        q = deque()  # indexes whose values are decreasing
        res = []
        for r, n in enumerate(nums):
            while q and nums[q[-1]] < n:
                q.pop()
            q.append(r)
            if q[0] <= r - k:
                q.popleft()
            if r >= k - 1:
                res.append(nums[q[0]])
        return res`,
    hints: ["Recomputing each window's max is O(n·k). Which elements can never be a future maximum?", "Once a bigger value arrives, smaller values before it are useless: drop them.", "Keep a deque of indexes with decreasing values; the front is the current max, and pop it when it leaves the window."],
    clarify: [
      { question: "How long is the output?", answer: "len(nums) - k + 1 values, one per window position." },
      { question: "Can values repeat?", answer: "Yes." },
      { question: "Can k equal the array length?", answer: "Yes, then there's a single window." },
    ],
  },
];
