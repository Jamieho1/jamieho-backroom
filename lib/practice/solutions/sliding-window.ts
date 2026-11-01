/**
 * sliding-window: NeetCode 150 problems, written in Jamie's format (see arrays-hashing.ts).
 * Problems:
 * - 121 Best Time to Buy and Sell Stock (Easy)
 * - 3 Longest Substring Without Repeating Characters (Medium)
 * - 424 Longest Repeating Character Replacement (Medium)
 * - 567 Permutation in String (Medium)
 * - 76 Minimum Window Substring (Hard)
 * - 239 Sliding Window Maximum (Hard)
 */
import type { Solution, Variation } from "../solutions";

const kv = (o: Record<string, string>) => Object.entries(o).map(([name, value]) => ({ name, value }));

export const variations: Variation[] = [
  {
    id: "longest-valid",
    topic: "sliding-window",
    name: "Grow, shrink while invalid (longest)",
    change: "Base pattern. Move `r` forward every step; ==shrink `l` only while the window breaks the rule==, then record the window size as a candidate for the longest.",
    problems: [3, 424],
  },
  {
    id: "running-min",
    topic: "sliding-window",
    name: "Jump left to the best start",
    change: "No shrinking one step at a time: when `r` finds a ==better starting point, `l` jumps straight to `r`==. The window is \"buy at `l`, sell at `r`\".",
    problems: [121],
  },
  {
    id: "fixed-count",
    topic: "sliding-window",
    name: "Fixed-size window + counts",
    change: "The window ==size is fixed== (the length of the pattern). Slide it by adding one char on the right and removing one on the left, and compare letter counts.",
    problems: [567],
  },
  {
    id: "shortest-valid",
    topic: "sliding-window",
    name: "Grow until valid, shrink while valid (shortest)",
    change: "Flip the base pattern: ==shrink `l` while the window is still valid==, recording the size each time, because you want the smallest window that works. A `have`/`need` counter makes \"valid?\" O(1).",
    problems: [76],
  },
  {
    id: "monotonic-deque",
    topic: "sliding-window",
    name: "Fixed window + monotonic deque",
    change: "You need the max of every window, so keep a ==deque of indexes with decreasing values==. The front is always the window max; drop it once it slides out.",
    problems: [239],
  },
];

export const solutions: Solution[] = [
  {
    lc: 121,
    variation: "running-min",
    question: "Given daily prices, find the biggest profit from buying on one day and selling on a later day (0 if you can't profit).",
    intuition: `For each sell day, the best buy day is ==the cheapest day before it==. Keep \`l\` on the lowest price seen so far and let \`r\` scan forward. If \`prices[r]\` is even lower, ==\`l\` jumps to \`r\`==: no earlier day can beat a new low.`,
    algorithm: `1. Set \`l = 0\` (buy day) and \`best = 0\`.
2. For \`r\` from 1 to \`n - 1\` (sell day):
   * If ==\`prices[r] < prices[l]\`==, move \`l = r\` (new cheapest buy).
   * Otherwise update \`best = max(best, prices[r] - prices[l])\`.
3. Return \`best\`.`,
    visual: {
      kind: "array",
      title: "Best time to buy and sell · [7, 1, 5, 3, 6, 4]",
      values: [7, 1, 5, 3, 6, 4],
      frames: [
        { caption: "r=1: price 1 < 7 → new cheapest day, l jumps to 1.", pointers: [{ name: "l", index: 1 }, { name: "r", index: 1 }], highlight: [1], done: [0], vars: kv({ best: "0" }) },
        { caption: "r=2: sell at 5, bought at 1 → profit 4.", pointers: [{ name: "l", index: 1 }, { name: "r", index: 2 }], range: [1, 2], vars: kv({ profit: "4", best: "4" }) },
        { caption: "r=3: 3 − 1 = 2, not better.", pointers: [{ name: "l", index: 1 }, { name: "r", index: 3 }], range: [1, 3], vars: kv({ profit: "2", best: "4" }) },
        { caption: "r=4: 6 − 1 = 5 → new best.", pointers: [{ name: "l", index: 1 }, { name: "r", index: 4 }], range: [1, 4], highlight: [1, 4], vars: kv({ profit: "5", best: "5" }) },
        { caption: "r=5: 4 − 1 = 3, not better. Answer 5 (buy at 1, sell at 6).", pointers: [{ name: "l", index: 1 }, { name: "r", index: 5 }], range: [1, 5], highlight: [1, 4], vars: kv({ answer: "5" }) },
      ],
    },
    code: `def maxProfit(prices: list[int]) -> int:
    l, best = 0, 0
    for r in range(1, len(prices)):
        if prices[r] < prices[l]:
            l = r
        else:
            best = max(best, prices[r] - prices[l])
    return best`,
    complexity: "Time O(n) · Space O(1)",
  },
  {
    lc: 3,
    variation: "longest-valid",
    question: "Given a string, return the length of the longest stretch of characters with no character repeated.",
    intuition: `Keep a window \`[l, r]\` with no repeats and a set of its characters. Adding \`s[r]\` can only break the rule if it's already in the set, so ==shrink from the left until that old copy is gone==. The window is always valid, so its size is a candidate answer.`,
    algorithm: `1. Create an empty set \`seen\`, set \`l = 0\` and \`best = 0\`.
2. For each \`r\` and character \`c\`:
   * ==While \`c\` is in \`seen\`==: remove \`s[l]\` and move \`l\` forward.
   * Add \`c\` to \`seen\`.
   * Update \`best = max(best, r - l + 1)\`.
3. Return \`best\`.`,
    visual: {
      kind: "array",
      title: "Longest substring, no repeats · \"abcabcbb\"",
      values: ["a", "b", "c", "a", "b", "c", "b", "b"],
      frames: [
        { caption: "r=0..2: a, b, c are all new → window \"abc\", size 3.", pointers: [{ name: "l", index: 0 }, { name: "r", index: 2 }], range: [0, 2], vars: kv({ seen: "{a, b, c}", best: "3" }) },
        { caption: "r=3: 'a' already in the window → drop s[0]='a', l=1.", pointers: [{ name: "l", index: 1 }, { name: "r", index: 3 }], range: [1, 3], highlight: [3], done: [0], vars: kv({ seen: "{b, c, a}", best: "3" }) },
        { caption: "r=4, r=5: same story, each repeat pushes l one step. Size stays 3.", pointers: [{ name: "l", index: 3 }, { name: "r", index: 5 }], range: [3, 5], done: [0, 1, 2], vars: kv({ seen: "{a, b, c}", best: "3" }) },
        { caption: "r=6: 'b' repeats → drop 'a' then 'b', l=5. Window \"cb\".", pointers: [{ name: "l", index: 5 }, { name: "r", index: 6 }], range: [5, 6], highlight: [6], done: [0, 1, 2, 3, 4], vars: kv({ seen: "{c, b}", best: "3" }) },
        { caption: "r=7: 'b' repeats → drop 'c' and 'b', l=7. Answer 3.", pointers: [{ name: "l", index: 7 }, { name: "r", index: 7 }], range: [7, 7], done: [0, 1, 2, 3, 4, 5, 6], vars: kv({ seen: "{b}", answer: "3" }) },
      ],
    },
    code: `def lengthOfLongestSubstring(s: str) -> int:
    seen = set()
    l, best = 0, 0
    for r, c in enumerate(s):
        while c in seen:
            seen.remove(s[l])
            l += 1
        seen.add(c)
        best = max(best, r - l + 1)
    return best`,
    complexity: "Time O(n) · Space O(k) for k distinct characters",
  },
  {
    lc: 424,
    variation: "longest-valid",
    question: "Given an uppercase string and k, find the longest stretch you can turn into one repeated letter by changing at most k characters.",
    intuition: `In a window, keep the most common letter and change the rest. So the window is valid when ==\`size - maxCount <= k\`==. Grow \`r\`; when it breaks, slide \`l\` forward. \`maxCount\` never needs to go down: ==the answer only improves when a bigger \`maxCount\` shows up==, so a stale value is safe.`,
    algorithm: `1. Create \`count = {}\`, set \`l = 0\`, \`maxf = 0\`, \`best = 0\`.
2. For each \`r\` and letter \`c\`:
   * Add 1 to \`count[c]\` and update \`maxf = max(maxf, count[c])\`.
   * ==While \`(r - l + 1) - maxf > k\`==:
      * Subtract 1 from \`count[s[l]]\` and move \`l\` forward.
   * Update \`best = max(best, r - l + 1)\`.
3. Return \`best\`.`,
    visual: {
      kind: "array",
      title: "Character replacement · \"AABABBA\", k = 1",
      values: ["A", "A", "B", "A", "B", "B", "A"],
      frames: [
        { caption: "r=0..2: \"AAB\" → 3 − maxf 2 = 1 change ≤ k. Valid.", pointers: [{ name: "l", index: 0 }, { name: "r", index: 2 }], range: [0, 2], vars: kv({ count: "A:2 B:1", maxf: "2", best: "3" }) },
        { caption: "r=3: \"AABA\" → 4 − 3 = 1 change. Valid, best 4.", pointers: [{ name: "l", index: 0 }, { name: "r", index: 3 }], range: [0, 3], highlight: [2], vars: kv({ count: "A:3 B:1", maxf: "3", best: "4" }) },
        { caption: "r=4: size 5 − 3 = 2 > k → drop s[0], l=1. Window slides, keeps size 4.", pointers: [{ name: "l", index: 1 }, { name: "r", index: 4 }], range: [1, 4], done: [0], vars: kv({ count: "A:2 B:2", maxf: "3 (stale, ok)", best: "4" }) },
        { caption: "r=5: too big again → drop s[1], l=2. \"BABB\" needs 1 change.", pointers: [{ name: "l", index: 2 }, { name: "r", index: 5 }], range: [2, 5], done: [0, 1], vars: kv({ count: "A:1 B:3", maxf: "3", best: "4" }) },
        { caption: "r=6: too big → drop s[2], l=3. No window beats 4. Answer 4.", pointers: [{ name: "l", index: 3 }, { name: "r", index: 6 }], range: [3, 6], done: [0, 1, 2], vars: kv({ count: "A:2 B:2", answer: "4" }) },
      ],
    },
    code: `def characterReplacement(s: str, k: int) -> int:
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
    complexity: "Time O(n) · Space O(26) = O(1)",
  },
  {
    lc: 567,
    variation: "fixed-count",
    question: "Given two strings, say whether some rearrangement of the first appears as a contiguous block inside the second.",
    intuition: `A rearrangement has exactly the same letter counts and the same length. So slide a ==window of length \`len(s1)\`== across \`s2\` and compare its 26 counts to \`s1\`'s. Each slide ==adds one letter and removes one==, so updating the counts is O(1).`,
    algorithm: `1. If \`len(s1) > len(s2)\`, return \`False\`.
2. Build \`need\` (counts of \`s1\`) and \`win\` (counts of the first \`len(s1)\` letters of \`s2\`), each \`[0] * 26\`.
3. If \`need == win\`, return \`True\`.
4. For \`r\` from \`len(s1)\` to \`len(s2) - 1\`:
   * ==Add \`s2[r]\`== to \`win\` and ==remove \`s2[r - len(s1)]\`==.
   * If \`win == need\`, return \`True\`.
5. Return \`False\`.`,
    visual: {
      kind: "array",
      title: "Permutation in string · \"ab\" in \"eidbaooo\"",
      values: ["e", "i", "d", "b", "a", "o", "o", "o"],
      frames: [
        { caption: "First window \"ei\" vs need {a:1, b:1} → no match.", range: [0, 1], vars: kv({ need: "a:1 b:1", win: "e:1 i:1" }) },
        { caption: "Slide: add 'd', remove 'e' → \"id\". No match.", pointers: [{ name: "r", index: 2 }], range: [1, 2], done: [0], vars: kv({ need: "a:1 b:1", win: "i:1 d:1" }) },
        { caption: "Slide: add 'b', remove 'i' → \"db\". Close, still no.", pointers: [{ name: "r", index: 3 }], range: [2, 3], done: [0, 1], vars: kv({ need: "a:1 b:1", win: "d:1 b:1" }) },
        { caption: "Slide: add 'a', remove 'd' → \"ba\". Counts equal → True.", pointers: [{ name: "r", index: 4 }], range: [3, 4], highlight: [3, 4], done: [0, 1, 2], vars: kv({ need: "a:1 b:1", win: "b:1 a:1", answer: "True" }) },
      ],
    },
    code: `def checkInclusion(s1: str, s2: str) -> bool:
    m = len(s1)
    if m > len(s2):
        return False
    need, win = [0] * 26, [0] * 26
    for i in range(m):
        need[ord(s1[i]) - ord('a')] += 1
        win[ord(s2[i]) - ord('a')] += 1
    if need == win:
        return True
    for r in range(m, len(s2)):
        win[ord(s2[r]) - ord('a')] += 1
        win[ord(s2[r - m]) - ord('a')] -= 1
        if win == need:
            return True
    return False`,
    complexity: "Time O(26 · n) = O(n) · Space O(1)",
  },
  {
    lc: 76,
    variation: "shortest-valid",
    question: "Given strings s and t, return the shortest block of s that contains every character of t (with repeats), or \"\" if none.",
    intuition: `Grow \`r\` until the window covers \`t\`, then ==shrink \`l\` while it still covers \`t\`==, recording each size: that finds the shortest valid window ending at \`r\`. Instead of comparing whole count maps, track ==\`have\` = how many distinct letters already meet their required count==; the window is valid when \`have == need\`.`,
    algorithm: `1. Count \`t\` into \`countT\`. Set \`need = len(countT)\`, \`have = 0\`, \`window = {}\`, \`l = 0\`.
2. For each \`r\` and character \`c\`:
   * Add 1 to \`window[c]\`.
   * If \`c\` is in \`countT\` and \`window[c] == countT[c]\`, add 1 to \`have\`.
   * ==While \`have == need\`==:
      * If \`r - l + 1\` beats the best length, save \`(l, r)\`.
      * Subtract 1 from \`window[s[l]]\`; if that drops it below \`countT[s[l]]\`, subtract 1 from \`have\`.
      * Move \`l\` forward.
3. Return the saved slice, or \`""\` if nothing was saved.`,
    visual: {
      kind: "array",
      title: "Minimum window · s = \"ADOBECODEBANC\", t = \"ABC\"",
      values: ["A", "D", "O", "B", "E", "C", "O", "D", "E", "B", "A", "N", "C"],
      frames: [
        { caption: "Grow r to 5: \"ADOBEC\" has A, B, C → have = need = 3. Save size 6.", pointers: [{ name: "l", index: 0 }, { name: "r", index: 5 }], range: [0, 5], highlight: [0, 3, 5], vars: kv({ have: "3 / 3", best: "\"ADOBEC\" (6)" }) },
        { caption: "Shrink: drop 'A' → A missing, have = 2. Stop shrinking.", pointers: [{ name: "l", index: 1 }, { name: "r", index: 5 }], range: [1, 5], done: [0], vars: kv({ have: "2 / 3", best: "\"ADOBEC\" (6)" }) },
        { caption: "Grow r to 10 (an 'A' again) → valid. Shrink past D, O, B, E: sizes 10..7, none beat 6.", pointers: [{ name: "l", index: 5 }, { name: "r", index: 10 }], range: [5, 10], highlight: [5, 9, 10], done: [0, 1, 2, 3, 4], vars: kv({ have: "3 / 3", best: "\"ADOBEC\" (6)" }) },
        { caption: "Drop 'C' at l=5 → have = 2. Stop.", pointers: [{ name: "l", index: 6 }, { name: "r", index: 10 }], range: [6, 10], done: [0, 1, 2, 3, 4, 5], vars: kv({ have: "2 / 3", best: "\"ADOBEC\" (6)" }) },
        { caption: "Grow r to 12 ('C') → valid again. Shrink O, D, E: size 5 \"EBANC\", then size 4 \"BANC\" → new best.", pointers: [{ name: "l", index: 9 }, { name: "r", index: 12 }], range: [9, 12], highlight: [9, 10, 12], done: [0, 1, 2, 3, 4, 5, 6, 7, 8], vars: kv({ have: "3 / 3", best: "\"BANC\" (4)" }) },
        { caption: "Drop 'B' → have = 2, string is used up. Answer \"BANC\".", pointers: [{ name: "l", index: 10 }, { name: "r", index: 12 }], range: [10, 12], done: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], vars: kv({ have: "2 / 3", answer: "\"BANC\"" }) },
      ],
    },
    code: `from collections import Counter

def minWindow(s: str, t: str) -> str:
    if not t:
        return ""
    countT = Counter(t)
    window = {}
    have, need = 0, len(countT)
    best_len, best_l, best_r = float("inf"), 0, 0
    l = 0
    for r, c in enumerate(s):
        window[c] = window.get(c, 0) + 1
        if c in countT and window[c] == countT[c]:
            have += 1
        while have == need:
            if r - l + 1 < best_len:
                best_len, best_l, best_r = r - l + 1, l, r
            window[s[l]] -= 1
            if s[l] in countT and window[s[l]] < countT[s[l]]:
                have -= 1
            l += 1
    return s[best_l : best_r + 1] if best_len != float("inf") else ""`,
    complexity: "Time O(n + m) · Space O(k) for k distinct characters",
  },
  {
    lc: 239,
    variation: "monotonic-deque",
    question: "Given a list of integers and a window size k, return the largest value in every window of k consecutive elements.",
    intuition: `Rescanning each window is O(n · k). A number smaller than a newer number to its right ==can never be a window max again==, so throw it away. That leaves a deque of indexes whose values are decreasing: ==the front is the current max==, and you pop it once its index slides out of the window.`,
    algorithm: `1. Create an empty deque \`q\` (indexes) and \`res = []\`.
2. For each \`r\` and value \`n\`:
   * ==While \`q\` is not empty and \`nums[q[-1]] < n\`==, pop from the back.
   * Append \`r\` to the back.
   * If ==\`q[0] <= r - k\`== (front is outside the window), pop it from the front.
   * If \`r >= k - 1\`, append \`nums[q[0]]\` to \`res\`.
3. Return \`res\`.`,
    visual: {
      kind: "array",
      title: "Sliding window max · k = 3",
      values: [1, 3, -1, -3, 5, 3, 6, 7],
      frames: [
        { caption: "r=0: deque [1]. r=1: 3 > 1 → pop 1, deque [3].", pointers: [{ name: "r", index: 1 }], range: [0, 1], vars: kv({ deque: "[3]", res: "[]" }) },
        { caption: "r=2: −1 < 3 → push. First full window, max = front = 3.", pointers: [{ name: "r", index: 2 }], range: [0, 2], highlight: [1], vars: kv({ deque: "[3, −1]", res: "[3]" }) },
        { caption: "r=3: push −3. Front 3 (index 1) is still inside → max 3.", pointers: [{ name: "r", index: 3 }], range: [1, 3], highlight: [1], vars: kv({ deque: "[3, −1, −3]", res: "[3, 3]" }) },
        { caption: "r=4: 5 beats everything → pop all three. Max 5.", pointers: [{ name: "r", index: 4 }], range: [2, 4], highlight: [4], vars: kv({ deque: "[5]", res: "[3, 3, 5]" }) },
        { caption: "r=5: 3 < 5 → push. Max still 5.", pointers: [{ name: "r", index: 5 }], range: [3, 5], highlight: [4], vars: kv({ deque: "[5, 3]", res: "[3, 3, 5, 5]" }) },
        { caption: "r=6: 6 pops 3 and 5 → max 6. r=7: 7 pops 6 → max 7.", pointers: [{ name: "r", index: 7 }], range: [5, 7], highlight: [7], vars: kv({ deque: "[7]", answer: "[3, 3, 5, 5, 6, 7]" }) },
      ],
    },
    code: `from collections import deque

def maxSlidingWindow(nums: list[int], k: int) -> list[int]:
    q = deque()  # indexes, values decreasing
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
    complexity: "Time O(n) · Space O(k)",
  },
];

/** Recognise-it cues for the Roadmap flashcards. */