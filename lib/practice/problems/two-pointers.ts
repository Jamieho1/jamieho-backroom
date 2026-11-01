/**
 * Arena problems: two-pointers. Same problems as LeetCode, our own words, verified tests (see ../types.ts).
 * - 125 Valid Palindrome (Easy)
 * - 167 Two Sum II - Input Array Is Sorted (Medium)
 * - 15 3Sum (Medium)
 * - 11 Container With Most Water (Medium)
 * - 42 Trapping Rain Water (Hard)
 */
import type { ArenaProblem } from "../types";

export const arena: ArenaProblem[] = [
  {
    lc: 125,
    kind: "algorithm",
    statement: `Given a string \`s\`, decide whether it reads the same forwards and backwards **after cleaning it up**:

1. Drop every character that is not a letter or a digit (spaces, punctuation, symbols).
2. Treat uppercase and lowercase letters as equal.

Return \`true\` if the cleaned string is a palindrome, otherwise \`false\`. A string that becomes empty after cleaning counts as a palindrome.`,
    examples: [
      { input: "s = \"Top spot!\"", output: "true", explanation: "Cleaned it becomes \"topspot\", which is the same reversed." },
      { input: "s = \"hello, world\"", output: "false", explanation: "\"helloworld\" reversed is \"dlrowolleh\"." },
    ],
    constraints: ["1 <= s.length <= 2 * 10^5", "s consists of printable ASCII characters"],
    signature: `class Solution:
    def isPalindrome(self, s: str) -> bool:`,
    method: "isPalindrome",
    tests: [
      { id: "ex1", input: "[\"Top spot!\"]", expected: "True", visible: true },
      { id: "ex2", input: "[\"hello, world\"]", expected: "False", visible: true },
      { id: "only-space", input: "[\" \"]", expected: "True", visible: false },
      { id: "only-punct", input: "[\".,!?\"]", expected: "True", visible: false },
      { id: "digit-letter", input: "[\"a1\"]", expected: "False", visible: false },
      { id: "mixed-case", input: "[\"Ab1bA\"]", expected: "True", visible: false },
      { id: "digits", input: "[\"12 3:21\"]", expected: "True", visible: false },
      { id: "quotes", input: "[\"No 'x' in Nixon\"]", expected: "True", visible: false },
      { id: "near-miss", input: "[\"abca\"]", expected: "False", visible: false },
      { id: "big-false", input: "[\"ab\" * 100000]", expected: "False", visible: false },
      { id: "big-true", input: "[\"Aa,\" * 50000 + \"a\"]", expected: "True", visible: false },
    ],
    solution: `class Solution:
    def isPalindrome(self, s: str) -> bool:
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
    hints: ["Building a cleaned copy and comparing it to its reverse works, but costs O(n) extra space.", "Put one pointer at each end and move them inward, skipping characters that aren't letters or digits."],
    clarify: [
      { question: "Do digits count?", answer: "Yes, letters and digits are both kept; everything else is ignored." },
      { question: "Is it case-sensitive?", answer: "No, 'A' and 'a' are equal." },
      { question: "What if nothing is left after cleaning?", answer: "Return true; an empty string is a palindrome." },
    ],
  },
  {
    lc: 167,
    kind: "algorithm",
    statement: `You get an integer array \`numbers\` sorted in **non-decreasing order** and an integer \`target\`. Find the two entries that add up to \`target\` and return their positions as \`[index1, index2]\`, where the positions are **1-based** and \`index1 < index2\`.

- Exactly one such pair exists.
- The same entry can't be used twice (but two equal values at different positions are fine).
- Use only O(1) extra space.`,
    examples: [
      { input: "numbers = [1,3,4,8,11], target = 15", output: "[3,5]", explanation: "4 + 11 = 15; they sit at 1-based positions 3 and 5." },
      { input: "numbers = [-4,-1,0,6], target = -5", output: "[1,2]" },
    ],
    constraints: ["2 <= numbers.length <= 3 * 10^4", "-1000 <= numbers[i] <= 1000", "numbers is sorted in non-decreasing order", "-1000 <= target <= 1000", "Exactly one answer exists"],
    signature: `class Solution:
    def twoSum(self, numbers: List[int], target: int) -> List[int]:`,
    method: "twoSum",
    tests: [
      { id: "ex1", input: "[[1,3,4,8,11], 15]", expected: "[3, 5]", visible: true },
      { id: "ex2", input: "[[-4,-1,0,6], -5]", expected: "[1, 2]", visible: true },
      { id: "two-equal", input: "[[2,2], 4]", expected: "[1, 2]", visible: false },
      { id: "ends", input: "[[-10,-3,2,9,20], 10]", expected: "[1, 5]", visible: false },
      { id: "zeros", input: "[[0,0,3,4], 0]", expected: "[1, 2]", visible: false },
      { id: "middle-dups", input: "[[3,5,5,9], 10]", expected: "[2, 3]", visible: false },
      { id: "negative-target", input: "[[-8,-6,-1,4,7], -14]", expected: "[1, 2]", visible: false },
      { id: "big", input: "[[-1000] * 29998 + [999, 1000], 1999]", expected: "[29999, 30000]", visible: false },
    ],
    solution: `class Solution:
    def twoSum(self, numbers: List[int], target: int) -> List[int]:
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
    hints: ["A hash map works, but it ignores the fact that the array is sorted and uses O(n) space.", "Start with the smallest and largest values. If their sum is too small, which pointer should move?"],
    clarify: [
      { question: "Are the returned indices 0- or 1-based?", answer: "1-based, smaller one first." },
      { question: "Can values repeat?", answer: "Yes, but there is exactly one valid pair." },
      { question: "Is extra memory allowed?", answer: "Only O(1) extra space." },
    ],
  },
  {
    lc: 15,
    kind: "algorithm",
    statement: `Given an integer array \`nums\`, return **every distinct triple of values** \`[a, b, c]\` taken from three different positions such that \`a + b + c == 0\`.

- Triples are compared by their values: \`[-1, 0, 1]\` and \`[0, 1, -1]\` are the same triple and must appear only once.
- A value may be used more than once in a triple only if it occurs at that many different positions (e.g. \`[0, 0, 0]\` needs three zeros).
- If no triple works, return an empty list.
- The triples can be listed in any order, and the numbers inside each triple can be in any order.`,
    examples: [
      { input: "nums = [-2,0,1,1,2]", output: "[[-2,0,2],[-2,1,1]]" },
      { input: "nums = [1,2,-3,4]", output: "[[-3,1,2]]" },
      { input: "nums = [1,2,3]", output: "[]", explanation: "All values are positive, so no triple can sum to 0." },
    ],
    constraints: ["3 <= nums.length <= 3000", "-10^5 <= nums[i] <= 10^5"],
    signature: `class Solution:
    def threeSum(self, nums: List[int]) -> List[List[int]]:`,
    method: "threeSum",
    driver: `def run(ns, args):
    # triples in any order, numbers inside a triple in any order
    res = ns["Solution"]().threeSum(*args)
    return sorted(sorted(t) for t in res)
`,
    tests: [
      { id: "ex1", input: "[[-2,0,1,1,2]]", expected: "[[-2, 0, 2], [-2, 1, 1]]", visible: true },
      { id: "ex2", input: "[[1,2,-3,4]]", expected: "[[-3, 1, 2]]", visible: true },
      { id: "ex3", input: "[[1,2,3]]", expected: "[]", visible: true },
      { id: "three-zeros", input: "[[0,0,0]]", expected: "[[0, 0, 0]]", visible: false },
      { id: "many-zeros", input: "[[0,0,0,0,0]]", expected: "[[0, 0, 0]]", visible: false },
      { id: "two-zeros-only", input: "[[0,0,1]]", expected: "[]", visible: false },
      { id: "duplicates", input: "[[-1,-1,2,2,-1,0,1]]", expected: "[[-1, -1, 2], [-1, 0, 1]]", visible: false },
      { id: "many", input: "[[-4,-2,-2,-2,0,1,2,2,2,3,3,4,4,6,6]]", expected: "[[-4, -2, 6], [-4, 0, 4], [-4, 1, 3], [-4, 2, 2], [-2, -2, 4], [-2, 0, 2]]", visible: false },
      { id: "big-zeros", input: "[[0] * 3000]", expected: "[[0, 0, 0]]", visible: false },
      { id: "big-pairs", input: "[[1] * 1500 + [-2] * 1500]", expected: "[[-2, 1, 1]]", visible: false },
    ],
    solution: `class Solution:
    def threeSum(self, nums: List[int]) -> List[List[int]]:
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
    hints: ["Sort first. Then fix the first number and the problem becomes a two-sum on the rest.", "On a sorted range, the two-sum can use two pointers moving inward.", "To avoid repeated triples, skip a first number equal to the previous one, and after a hit, skip equal values for the left pointer."],
    clarify: [
      { question: "Should I return values or indices?", answer: "Values, and each distinct triple only once." },
      { question: "Does the order of the output matter?", answer: "No, neither the order of the triples nor of the numbers inside them." },
      { question: "Can I sort the input in place?", answer: "Yes." },
    ],
  },
  {
    lc: 11,
    kind: "algorithm",
    statement: `You're given an array \`height\` of length \`n\`; picture a vertical wall at each x-position \`i\` with height \`height[i]\`. Choose **two walls** which, together with the x-axis, hold water. The amount of water is

\`(distance between the two walls) × (height of the shorter wall)\`.

Return the **largest amount** any pair of walls can hold. Walls between the two chosen ones don't matter, and the container can't be tilted.`,
    examples: [
      { input: "height = [2,5,4,8,3,7]", output: "20", explanation: "Walls at index 1 (height 5) and index 5 (height 7): width 4 × height 5 = 20." },
      { input: "height = [3,3]", output: "3" },
    ],
    constraints: ["2 <= n <= 10^5", "0 <= height[i] <= 10^4"],
    signature: `class Solution:
    def maxArea(self, height: List[int]) -> int:`,
    method: "maxArea",
    tests: [
      { id: "ex1", input: "[[2,5,4,8,3,7]]", expected: "20", visible: true },
      { id: "ex2", input: "[[3,3]]", expected: "3", visible: true },
      { id: "flat", input: "[[1,1,1,1]]", expected: "3", visible: false },
      { id: "zeros", input: "[[0,0]]", expected: "0", visible: false },
      { id: "tall-ends", input: "[[10,1,1,1,10]]", expected: "40", visible: false },
      { id: "increasing", input: "[[1,2,3,4,5]]", expected: "6", visible: false },
      { id: "tall-middle", input: "[[1,9,9,1]]", expected: "9", visible: false },
      { id: "one-zero", input: "[[0,7,0,6]]", expected: "12", visible: false },
      { id: "big", input: "[[5] * 100000]", expected: "499995", visible: false },
    ],
    solution: `class Solution:
    def maxArea(self, height: List[int]) -> int:
        l, r = 0, len(height) - 1
        best = 0
        while l < r:
            best = max(best, (r - l) * min(height[l], height[r]))
            if height[l] < height[r]:
                l += 1
            else:
                r -= 1
        return best`,
    hints: ["Trying every pair is O(n²). Start with the widest container: the two outermost walls.", "Moving the taller wall inward can never help (width shrinks, the limit is still the shorter wall). So which one should move?"],
    clarify: [
      { question: "Do walls between the two chosen ones block water?", answer: "No, only the two chosen walls matter." },
      { question: "Can a height be 0?", answer: "Yes; a container with a zero-height wall holds nothing." },
    ],
  },
  {
    lc: 42,
    kind: "algorithm",
    statement: `You're given \`n\` non-negative integers \`height\` describing an elevation profile: bar \`i\` has width 1 and height \`height[i]\`. After it rains, water settles in the dips between bars. Return **how many units of water are trapped** in total.

- Water above bar \`i\` rises to \`min(highest bar to its left, highest bar to its right) - height[i]\`, or 0 if that's negative.
- Water spills off both ends, so the first and last bars never hold water.`,
    examples: [
      { input: "height = [3,0,2,0,4]", output: "7", explanation: "3 units over index 1, 1 over index 2, 3 over index 3." },
      { input: "height = [5,2,1,2,1,5]", output: "14" },
    ],
    constraints: ["1 <= n <= 2 * 10^4", "0 <= height[i] <= 10^5"],
    signature: `class Solution:
    def trap(self, height: List[int]) -> int:`,
    method: "trap",
    tests: [
      { id: "ex1", input: "[[3,0,2,0,4]]", expected: "7", visible: true },
      { id: "ex2", input: "[[5,2,1,2,1,5]]", expected: "14", visible: true },
      { id: "single", input: "[[7]]", expected: "0", visible: false },
      { id: "increasing", input: "[[1,2,3]]", expected: "0", visible: false },
      { id: "decreasing", input: "[[3,2,1,0]]", expected: "0", visible: false },
      { id: "v-shape", input: "[[2,0,2]]", expected: "2", visible: false },
      { id: "flat", input: "[[4,4,4]]", expected: "0", visible: false },
      { id: "uneven-walls", input: "[[0,3,0,1,0,3,0,2]]", expected: "10", visible: false },
      { id: "all-zero", input: "[[0,0,0,0]]", expected: "0", visible: false },
      { id: "big", input: "[[100000] + [0] * 19998 + [100000]]", expected: "1999800000", visible: false },
    ],
    solution: `class Solution:
    def trap(self, height: List[int]) -> int:
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
    hints: ["Water at one position depends only on the tallest bar to its left and the tallest bar to its right.", "Precomputing both maxima in two arrays gives O(n) time and O(n) space.", "With two pointers, the side whose running max is smaller is already decided: process that side and move it inward."],
    clarify: [
      { question: "Can water spill over the edges?", answer: "Yes, nothing is trapped beyond the first or last bar." },
      { question: "Are the bars all width 1?", answer: "Yes." },
    ],
  },
];
