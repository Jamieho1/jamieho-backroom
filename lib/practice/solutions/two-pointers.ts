/**
 * two-pointers: NeetCode 150 problems, written in Jamie's format (see arrays-hashing.ts).
 * Problems:
 * - 125 Valid Palindrome (Easy)
 * - 167 Two Sum II - Input Array Is Sorted (Medium)
 * - 15 3Sum (Medium)
 * - 11 Container With Most Water (Medium)
 * - 42 Trapping Rain Water (Hard)
 */
import type { Solution, Variation } from "../solutions";

const kv = (o: Record<string, string>) => Object.entries(o).map(([name, value]) => ({ name, value }));

export const variations: Variation[] = [
  {
    id: "converge",
    topic: "two-pointers",
    name: "Converge from both ends",
    change: "Base pattern. Start `l` at the left and `r` at the right and ==move them toward each other==, deciding which one to move from a comparison.",
    problems: [125, 167],
  },
  {
    id: "fix-one",
    topic: "two-pointers",
    name: "Fix one, then converge",
    change: "Sort first, ==fix one element with an outer loop==, then run the converging pair on the rest. Skip equal neighbours to avoid duplicate answers.",
    problems: [15],
  },
  {
    id: "shorter-side",
    topic: "two-pointers",
    name: "Move the shorter wall",
    change: "Pointers start at both ends, but the rule is greedy: ==always move the side with the smaller height==, because the smaller side is what limits the answer.",
    problems: [11, 42],
  },
];

export const solutions: Solution[] = [
  {
    lc: 125,
    variation: "converge",
    question: "Given a string, say whether it reads the same forwards and backwards once you ignore case and anything that isn't a letter or digit.",
    intuition: `A palindrome mirrors around its centre, so ==compare the outermost characters and walk inward==. Characters that aren't letters or digits don't count, so ==skip them in place== instead of building a cleaned copy. One mismatch is enough to say no.`,
    algorithm: `1. Set \`l = 0\` and \`r = len(s) - 1\`.
2. While \`l < r\`:
   * Move \`l\` right while \`s[l]\` ==isn't alphanumeric== (and \`l < r\`).
   * Move \`r\` left while \`s[r]\` isn't alphanumeric (and \`l < r\`).
   * If \`s[l].lower() != s[r].lower()\`, return \`False\`.
   * Step both inward: \`l += 1\`, \`r -= 1\`.
3. Return \`True\`: every pair matched.`,
    visual: {
      kind: "array",
      title: "Valid palindrome · \"a,b A\"",
      values: ["a", ",", "b", "␣", "A"],
      frames: [
        { caption: "l=0 'a', r=4 'A' → equal ignoring case. Step both inward.", pointers: [{ name: "l", index: 0 }, { name: "r", index: 4 }], highlight: [0, 4] },
        { caption: "l=1 is ',' → not a letter or digit, skip it.", pointers: [{ name: "l", index: 1 }, { name: "r", index: 3 }], highlight: [1], done: [0, 4] },
        { caption: "r=3 is a space → skip it. Now l = r = 2.", pointers: [{ name: "l", index: 2 }, { name: "r", index: 2 }], highlight: [3], done: [0, 4] },
        { caption: "l is no longer < r → every pair matched. Return True.", pointers: [{ name: "l", index: 2 }, { name: "r", index: 2 }], done: [0, 2, 4], vars: kv({ answer: "True" }) },
      ],
    },
    code: `def isPalindrome(s: str) -> bool:
    l, r = 0, len(s) - 1
    while l < r:
        while l < r and not s[l].isalnum():
            l += 1
        while l < r and not s[r].isalnum():
            r -= 1
        if s[l].lower() != s[r].lower():
            return False
        l += 1
        r -= 1
    return True`,
    complexity: "Time O(n) · Space O(1)",
  },
  {
    lc: 167,
    variation: "converge",
    question: "Given a sorted list of numbers and a target, return the 1-based positions of the two numbers that sum to it, using O(1) extra space.",
    intuition: `Because the list is sorted, the sum tells you which way to go. ==Too small? Move \`l\` right== to a bigger number. ==Too big? Move \`r\` left== to a smaller one. Each step throws away a value that can't be part of any answer, so one pass is enough and no hash map is needed.`,
    algorithm: `1. Set \`l = 0\` and \`r = len(numbers) - 1\`.
2. While \`l < r\`:
   * Compute \`s = numbers[l] + numbers[r]\`.
   * If \`s == target\`, return \`[l + 1, r + 1]\` (1-based).
   * If ==\`s < target\`, \`l += 1\`==.
   * Else ==\`r -= 1\`==.
3. The problem guarantees one answer, so the loop always returns.`,
    visual: {
      kind: "array",
      title: "Two Sum II · target 10",
      values: [2, 3, 4, 6, 9],
      frames: [
        { caption: "2 + 9 = 11 > 10 → too big, move r left.", pointers: [{ name: "l", index: 0 }, { name: "r", index: 4 }], range: [0, 4], highlight: [0, 4], vars: kv({ sum: "11" }) },
        { caption: "2 + 6 = 8 < 10 → too small, move l right.", pointers: [{ name: "l", index: 0 }, { name: "r", index: 3 }], range: [0, 3], highlight: [0, 3], done: [4], vars: kv({ sum: "8" }) },
        { caption: "3 + 6 = 9 < 10 → still too small, move l right.", pointers: [{ name: "l", index: 1 }, { name: "r", index: 3 }], range: [1, 3], highlight: [1, 3], done: [0, 4], vars: kv({ sum: "9" }) },
        { caption: "4 + 6 = 10 → found. Return 1-based [3, 4].", pointers: [{ name: "l", index: 2 }, { name: "r", index: 3 }], range: [2, 3], highlight: [2, 3], done: [0, 1, 4], vars: kv({ sum: "10", answer: "[3, 4]" }) },
      ],
    },
    code: `def twoSum(numbers: list[int], target: int) -> list[int]:
    l, r = 0, len(numbers) - 1
    while l < r:
        s = numbers[l] + numbers[r]
        if s == target:
            return [l + 1, r + 1]
        if s < target:
            l += 1
        else:
            r -= 1
    return []`,
    complexity: "Time O(n) · Space O(1)",
  },
  {
    lc: 15,
    variation: "fix-one",
    question: "Given a list of integers, return every distinct triple of values that adds up to zero.",
    intuition: `Sort the list, then ==fix the first number \`a\`== and the problem becomes Two Sum II on the rest with target \`-a\`. Sorting also makes duplicates sit next to each other, so ==skip a value equal to the one before it== (for \`a\` and for \`l\` after a hit) and every triple comes out once.`,
    algorithm: `1. Sort \`nums\`.
2. For each index \`i\` with value \`a\`:
   * If \`a > 0\`, stop: three positives can't sum to 0.
   * If ==\`a == nums[i - 1]\`==, skip it (same first number as last time).
   * Set \`l = i + 1\`, \`r = len(nums) - 1\`.
   * While \`l < r\`:
      * \`s = a + nums[l] + nums[r]\`.
      * \`s < 0\` → \`l += 1\`; \`s > 0\` → \`r -= 1\`.
      * \`s == 0\` → record the triple, move both, then ==move \`l\` past repeats==.
3. Return the triples.`,
    visual: {
      kind: "array",
      title: "3Sum · sorted [-4, -1, -1, 0, 1, 2]",
      values: [-4, -1, -1, 0, 1, 2],
      frames: [
        { caption: "Fix a = -4. Need l + r = 4, but the biggest pair is 1 + 2 = 3. l walks right, no triple.", pointers: [{ name: "i", index: 0 }, { name: "l", index: 1 }, { name: "r", index: 5 }], highlight: [0], range: [1, 5], vars: kv({ res: "[]" }) },
        { caption: "Fix a = -1. -1 + -1 + 2 = 0 → record it, move l and r.", pointers: [{ name: "i", index: 1 }, { name: "l", index: 2 }, { name: "r", index: 5 }], highlight: [1, 2, 5], done: [0], vars: kv({ res: "[[-1,-1,2]]" }) },
        { caption: "-1 + 0 + 1 = 0 → record it. l and r cross, done with this a.", pointers: [{ name: "i", index: 1 }, { name: "l", index: 3 }, { name: "r", index: 4 }], highlight: [1, 3, 4], done: [0], vars: kv({ res: "[[-1,-1,2], [-1,0,1]]" }) },
        { caption: "i=2 is -1 again → same as the previous a, skip to avoid repeats.", pointers: [{ name: "i", index: 2 }], highlight: [2], done: [0, 1], vars: kv({ res: "[[-1,-1,2], [-1,0,1]]" }) },
        { caption: "Fix a = 0: 0 + 1 + 2 = 3 > 0, r moves, pointers cross. Then a = 1 > 0 → stop.", pointers: [{ name: "i", index: 3 }, { name: "l", index: 4 }, { name: "r", index: 5 }], highlight: [3], done: [0, 1, 2], vars: kv({ answer: "[[-1,-1,2], [-1,0,1]]" }) },
      ],
    },
    code: `def threeSum(nums: list[int]) -> list[list[int]]:
    nums.sort()
    res = []
    for i, a in enumerate(nums):
        if a > 0:
            break
        if i > 0 and a == nums[i - 1]:
            continue
        l, r = i + 1, len(nums) - 1
        while l < r:
            s = a + nums[l] + nums[r]
            if s < 0:
                l += 1
            elif s > 0:
                r -= 1
            else:
                res.append([a, nums[l], nums[r]])
                l += 1
                r -= 1
                while l < r and nums[l] == nums[l - 1]:
                    l += 1
    return res`,
    complexity: "Time O(n²) · Space O(1) extra (O(n) for the sort in Python)",
  },
  {
    lc: 11,
    variation: "shorter-side",
    question: "Given wall heights along a line, pick two walls that together hold the most water and return that amount.",
    intuition: `Water held = ==\`min(height[l], height[r]) × (r - l)\`==. Start with the widest pair. Moving the taller wall inward can only shrink the width while the shorter wall still caps the height, so it can never help. ==Always move the shorter wall==: it's the only move that might find a taller limit.`,
    algorithm: `Area of a pair:

* width = \`r - l\`
* height = the shorter wall, \`min(height[l], height[r])\`

1. Set \`l = 0\`, \`r = len(height) - 1\`, \`best = 0\`.
2. While \`l < r\`:
   * \`best = max(best, (r - l) * min(height[l], height[r]))\`.
   * If ==\`height[l] < height[r]\`, \`l += 1\`==.
   * Else \`r -= 1\`.
3. Return \`best\`.`,
    visual: {
      kind: "array",
      title: "Most water · [1, 8, 6, 2, 5, 4, 8, 3, 7]",
      values: [1, 8, 6, 2, 5, 4, 8, 3, 7],
      frames: [
        { caption: "Width 8, height min(1, 7) = 1 → 8. Left wall is shorter → move l.", pointers: [{ name: "l", index: 0 }, { name: "r", index: 8 }], highlight: [0, 8], vars: kv({ area: "8", best: "8" }) },
        { caption: "Width 7, height min(8, 7) = 7 → 49. Right wall is shorter → move r.", pointers: [{ name: "l", index: 1 }, { name: "r", index: 8 }], highlight: [1, 8], done: [0], vars: kv({ area: "49", best: "49" }) },
        { caption: "Width 6, height min(8, 3) = 3 → 18. Move r.", pointers: [{ name: "l", index: 1 }, { name: "r", index: 7 }], highlight: [1, 7], done: [0, 8], vars: kv({ area: "18", best: "49" }) },
        { caption: "Width 5, height 8 → 40. Tie: moving either side is fine.", pointers: [{ name: "l", index: 1 }, { name: "r", index: 6 }], highlight: [1, 6], done: [0, 7, 8], vars: kv({ area: "40", best: "49" }) },
        { caption: "Every remaining pair is narrower and none beats 49. Answer 49.", done: [0, 1, 6, 7, 8], highlight: [1, 8], vars: kv({ answer: "49" }) },
      ],
    },
    code: `def maxArea(height: list[int]) -> int:
    l, r = 0, len(height) - 1
    best = 0
    while l < r:
        best = max(best, (r - l) * min(height[l], height[r]))
        if height[l] < height[r]:
            l += 1
        else:
            r -= 1
    return best`,
    complexity: "Time O(n) · Space O(1)",
  },
  {
    lc: 42,
    variation: "shorter-side",
    question: "Given bar heights of width 1, work out how much rainwater gets trapped between the bars.",
    intuition: `Water above bar \`i\` is ==\`min(maxLeft, maxRight) - height[i]\`==. With pointers at both ends, keep \`leftMax\` and \`rightMax\`. ==Move the side with the smaller max==: on that side the smaller max is the real limit (the other side already has something at least as tall), so you can add its water right away.`,
    algorithm: `1. If \`height\` is empty, return 0.
2. Set \`l = 0\`, \`r = n - 1\`, \`leftMax = height[l]\`, \`rightMax = height[r]\`, \`res = 0\`.
3. While \`l < r\`:
   * If ==\`leftMax < rightMax\`==:
      * \`l += 1\`, \`leftMax = max(leftMax, height[l])\`.
      * ==\`res += leftMax - height[l]\`== (never negative: the max includes this bar).
   * Else do the same on the right:
      * \`r -= 1\`, \`rightMax = max(rightMax, height[r])\`.
      * \`res += rightMax - height[r]\`.
4. Return \`res\`.`,
    visual: {
      kind: "array",
      title: "Trapping rain water · [4, 2, 0, 3, 2, 5]",
      values: [4, 2, 0, 3, 2, 5],
      frames: [
        { caption: "leftMax 4 < rightMax 5 → the left side is the limit. Work from the left.", pointers: [{ name: "l", index: 0 }, { name: "r", index: 5 }], highlight: [0, 5], vars: kv({ leftMax: "4", rightMax: "5", res: "0" }) },
        { caption: "l=1: water = 4 − 2 = 2.", pointers: [{ name: "l", index: 1 }, { name: "r", index: 5 }], highlight: [1], done: [0], vars: kv({ leftMax: "4", rightMax: "5", res: "2" }) },
        { caption: "l=2: water = 4 − 0 = 4.", pointers: [{ name: "l", index: 2 }, { name: "r", index: 5 }], highlight: [2], done: [0, 1], vars: kv({ leftMax: "4", rightMax: "5", res: "6" }) },
        { caption: "l=3: water = 4 − 3 = 1.", pointers: [{ name: "l", index: 3 }, { name: "r", index: 5 }], highlight: [3], done: [0, 1, 2], vars: kv({ leftMax: "4", rightMax: "5", res: "7" }) },
        { caption: "l=4: water = 4 − 2 = 2.", pointers: [{ name: "l", index: 4 }, { name: "r", index: 5 }], highlight: [4], done: [0, 1, 2, 3], vars: kv({ leftMax: "4", rightMax: "5", res: "9" }) },
        { caption: "l=5 meets r. leftMax becomes 5, water 0. Answer 9.", pointers: [{ name: "l", index: 5 }, { name: "r", index: 5 }], done: [0, 1, 2, 3, 4, 5], vars: kv({ leftMax: "5", rightMax: "5", answer: "9" }) },
      ],
    },
    code: `def trap(height: list[int]) -> int:
    if not height:
        return 0
    l, r = 0, len(height) - 1
    left_max, right_max = height[l], height[r]
    res = 0
    while l < r:
        if left_max < right_max:
            l += 1
            left_max = max(left_max, height[l])
            res += left_max - height[l]
        else:
            r -= 1
            right_max = max(right_max, height[r])
            res += right_max - height[r]
    return res`,
    complexity: "Time O(n) · Space O(1)",
  },
];

/** Recognise-it cues for the Roadmap flashcards. */