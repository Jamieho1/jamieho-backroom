/**
 * Arena problems: arrays-hashing. Same problems as LeetCode, our own words, verified tests (see ../types.ts).
 * - 217 Contains Duplicate (Easy)
 * - 242 Valid Anagram (Easy)
 * - 1 Two Sum (Easy)
 * - 49 Group Anagrams (Medium)
 * - 347 Top K Frequent Elements (Medium)
 * - 238 Product of Array Except Self (Medium)
 * - 36 Valid Sudoku (Medium)
 * - 271 Encode and Decode Strings (Medium)
 * - 128 Longest Consecutive Sequence (Medium)
 */
import type { ArenaProblem } from "../types";

export const arena: ArenaProblem[] = [
  {
    lc: 217,
    kind: "algorithm",
    statement: `You're given an integer array \`nums\`. Decide whether **some value occurs at least twice** in it.

- Return \`true\` if any value appears two or more times.
- Return \`false\` if every element is distinct.`,
    examples: [
      { input: "nums = [7, 3, 9, 3]", output: "true", explanation: "3 sits at index 1 and again at index 3." },
      { input: "nums = [4, 8, 15]", output: "false", explanation: "All three values are different." },
    ],
    constraints: ["1 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9"],
    signature: `class Solution:
    def containsDuplicate(self, nums: List[int]) -> bool:`,
    method: "containsDuplicate",
    tests: [
      { id: "ex1", input: "[[7, 3, 9, 3]]", expected: "True", visible: true },
      { id: "ex2", input: "[[4, 8, 15]]", expected: "False", visible: true },
      { id: "single", input: "[[42]]", expected: "False", visible: false },
      { id: "negatives", input: "[[-5, 2, -5]]", expected: "True", visible: false },
      { id: "all-same", input: "[[0, 0, 0, 0]]", expected: "True", visible: false },
      { id: "dup-at-end", input: "[[1, 2, 3, 4, 5, 6, 7, 1]]", expected: "True", visible: false },
      { id: "pos-neg-not-dup", input: "[[3, -3, 1000000000, -1000000000]]", expected: "False", visible: false },
      { id: "big-unique", input: "[list(range(100000))]", expected: "False", visible: false },
      { id: "big-dup", input: "[list(range(99999)) + [12345]]", expected: "True", visible: false },
    ],
    solution: `class Solution:
    def containsDuplicate(self, nums: List[int]) -> bool:
        seen = set()
        for n in nums:
            if n in seen:
                return True
            seen.add(n)
        return False`,
    hints: ["Checking every pair works but is O(n²). What could you remember as you walk the array once?", "A hash set tells you in O(1) whether you've met a value before."],
    clarify: [
      { question: "Is the array ever empty?", answer: "No, it has at least one element." },
      { question: "Do I need to say which value repeats?", answer: "No, just true or false." },
      { question: "Can I modify the input, e.g. sort it?", answer: "Yes, sorting is allowed (O(n log n), O(1) extra), though a set gives O(n) time." },
    ],
  },
  {
    lc: 242,
    kind: "algorithm",
    statement: `Given two strings \`s\` and \`t\`, return \`true\` if \`t\` is an **anagram** of \`s\`, otherwise \`false\`.

- \`t\` is an anagram of \`s\` when it uses exactly the same letters the same number of times, just possibly in a different order.
- Strings of different lengths can never be anagrams.
- A string counts as an anagram of itself.`,
    examples: [
      { input: "s = \"listen\", t = \"silent\"", output: "true" },
      { input: "s = \"abc\", t = \"abd\"", output: "false", explanation: "\"abd\" has a d where \"abc\" has a c." },
    ],
    constraints: ["1 <= s.length, t.length <= 5 * 10^4", "s and t contain only lowercase English letters"],
    signature: `class Solution:
    def isAnagram(self, s: str, t: str) -> bool:`,
    method: "isAnagram",
    tests: [
      { id: "ex1", input: "[\"listen\", \"silent\"]", expected: "True", visible: true },
      { id: "ex2", input: "[\"abc\", \"abd\"]", expected: "False", visible: true },
      { id: "diff-length", input: "[\"ab\", \"abb\"]", expected: "False", visible: false },
      { id: "single-same", input: "[\"q\", \"q\"]", expected: "True", visible: false },
      { id: "single-diff", input: "[\"q\", \"p\"]", expected: "False", visible: false },
      { id: "counts-differ", input: "[\"aab\", \"abb\"]", expected: "False", visible: false },
      { id: "identical", input: "[\"zzzz\", \"zzzz\"]", expected: "True", visible: false },
      { id: "big-true", input: "[\"ab\" * 25000, \"ba\" * 25000]", expected: "True", visible: false },
      { id: "big-false", input: "[\"a\" * 50000, \"a\" * 49999 + \"b\"]", expected: "False", visible: false },
    ],
    solution: `class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        if len(s) != len(t):
            return False
        count = [0] * 26
        for i in range(len(s)):
            count[ord(s[i]) - ord('a')] += 1
            count[ord(t[i]) - ord('a')] -= 1
        return all(c == 0 for c in count)`,
    hints: ["If the lengths differ you can stop immediately.", "Two strings are anagrams exactly when every letter has the same count in both.", "One array of 26 counters is enough: add for one string, subtract for the other, then check for all zeros."],
    clarify: [
      { question: "Is it case-sensitive, and could there be spaces or punctuation?", answer: "Only lowercase a–z appear." },
      { question: "What if the inputs could contain any Unicode character?", answer: "Use a hash map of counts instead of a fixed 26-slot array." },
    ],
  },
  {
    lc: 49,
    kind: "algorithm",
    statement: `You're given an array of strings \`strs\`. Put the strings into groups so that **two strings share a group exactly when they are anagrams** of each other (same letters with the same counts, any order), and return the list of groups.

- Every input string goes into exactly one group. Duplicates are kept: if a word appears twice, both copies are in its group.
- The empty string is a valid word; all empty strings form one group.
- The groups can be returned in any order, and the words inside a group can be in any order.`,
    examples: [
      { input: "strs = [\"stop\",\"pots\",\"tops\",\"cat\",\"act\",\"dog\"]", output: "[[\"stop\",\"pots\",\"tops\"],[\"cat\",\"act\"],[\"dog\"]]" },
      { input: "strs = [\"\"]", output: "[[\"\"]]" },
      { input: "strs = [\"x\"]", output: "[[\"x\"]]" },
    ],
    constraints: ["1 <= strs.length <= 10^4", "0 <= strs[i].length <= 100", "strs[i] contains only lowercase English letters"],
    signature: `class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:`,
    method: "groupAnagrams",
    driver: `def run(ns, args):
    # any group order and any order inside a group is accepted
    res = ns["Solution"]().groupAnagrams(*args)
    return sorted(sorted(g) for g in res)
`,
    tests: [
      { id: "ex1", input: "[[\"stop\",\"pots\",\"tops\",\"cat\",\"act\",\"dog\"]]", expected: "[['act', 'cat'], ['dog'], ['pots', 'stop', 'tops']]", visible: true },
      { id: "ex2", input: "[[\"\"]]", expected: "[['']]", visible: true },
      { id: "ex3", input: "[[\"x\"]]", expected: "[['x']]", visible: true },
      { id: "two-empty", input: "[[\"\", \"\"]]", expected: "[['', '']]", visible: false },
      { id: "no-anagrams", input: "[[\"abc\", \"def\", \"ghi\"]]", expected: "[['abc'], ['def'], ['ghi']]", visible: false },
      { id: "duplicates", input: "[[\"ab\", \"ba\", \"ab\"]]", expected: "[['ab', 'ab', 'ba']]", visible: false },
      { id: "counts-matter", input: "[[\"aab\", \"abb\", \"bab\", \"aba\"]]", expected: "[['aab', 'aba'], ['abb', 'bab']]", visible: false },
      { id: "mixed-lengths", input: "[[\"a\", \"aa\", \"aaa\", \"a\", \"\"]]", expected: "[[''], ['a', 'a'], ['aa'], ['aaa']]", visible: false },
      { id: "big", input: "[[chr(97 + i % 3) * 3 for i in range(9999)]]", expected: "[[\"aaa\"] * 3333, [\"bbb\"] * 3333, [\"ccc\"] * 3333]", visible: false },
    ],
    solution: `class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
        groups = defaultdict(list)
        for s in strs:
            count = [0] * 26
            for c in s:
                count[ord(c) - ord('a')] += 1
            groups[tuple(count)].append(s)
        return list(groups.values())`,
    hints: ["Anagrams look different but share something you can compute from each word. What is it?", "Use that shared signature as a dictionary key; each key's list is one group.", "Sorting each word gives a key in O(k log k); a 26-count tuple gives one in O(k)."],
    clarify: [
      { question: "Does the order of groups or of words within a group matter?", answer: "No, any order is accepted." },
      { question: "Can the same word appear more than once?", answer: "Yes, and every copy must appear in the output." },
      { question: "Can a string be empty?", answer: "Yes. Empty strings are anagrams of each other." },
    ],
  },
  {
    lc: 1,
    kind: "algorithm",
    statement: `You get an integer array \`nums\` and an integer \`target\`. Return the **indices of the two different elements** whose values add up to \`target\`.

- Exactly one valid pair exists in every input.
- You may not use the same index twice.
- The two indices can be returned in any order.`,
    examples: [
      { input: "nums = [4, 9, 2, 6], target = 10", output: "[0, 3]", explanation: "nums[0] + nums[3] = 4 + 6 = 10." },
      { input: "nums = [5, 5], target = 10", output: "[0, 1]" },
    ],
    constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i], target <= 10^9", "Exactly one answer exists."],
    signature: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:`,
    method: "twoSum",
    tests: [
      { id: "ex1", input: "[[4, 9, 2, 6], 10]", expected: "[0, 3]", compare: "unordered", visible: true },
      { id: "ex2", input: "[[5, 5], 10]", expected: "[0, 1]", compare: "unordered", visible: true },
      { id: "neg", input: "[[-3, 8, 2, -7], -10]", expected: "[0, 3]", compare: "unordered", visible: false },
      { id: "zero", input: "[[0, 4, 3, 0], 0]", expected: "[0, 3]", compare: "unordered", visible: false },
      { id: "end", input: "[[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 19]", expected: "[8, 9]", compare: "unordered", visible: false },
      { id: "big", input: "[list(range(10000)), 19997]", expected: "[9998, 9999]", compare: "unordered", visible: false },
    ],
    solution: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        seen = {}
        for i, n in enumerate(nums):
            if target - n in seen:
                return [seen[target - n], i]
            seen[n] = i
        return []`,
    hints: ["For each number, which value would complete the pair?", "Remember every value you've passed and where it was, so the lookup is O(1)."],
    clarify: [
      { question: "Can a number pair with itself?", answer: "No, the two indices must be different, but two equal values at different indices are fine." },
      { question: "Is there always an answer?", answer: "Yes, exactly one pair works." },
    ],
  },
  {
    lc: 347,
    kind: "algorithm",
    statement: `Given an integer array \`nums\` and an integer \`k\`, return the **\`k\` values that occur most often** in \`nums\`.

- The input is guaranteed to have a single correct answer: there is never a tie at the cut-off between the k-th and (k+1)-th most frequent values.
- Each value appears once in the answer (return distinct values, not their counts).
- The values can be returned in any order.`,
    examples: [
      { input: "nums = [4,4,4,6,6,9,9,9,9], k = 2", output: "[9,4]", explanation: "9 appears 4 times, 4 appears 3 times, 6 only twice." },
      { input: "nums = [7], k = 1", output: "[7]" },
    ],
    constraints: ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4", "1 <= k <= number of distinct values in nums", "The answer is unique."],
    signature: `class Solution:
    def topKFrequent(self, nums: List[int], k: int) -> List[int]:`,
    method: "topKFrequent",
    tests: [
      { id: "ex1", input: "[[4,4,4,6,6,9,9,9,9], 2]", expected: "[4, 9]", compare: "unordered", visible: true },
      { id: "ex2", input: "[[7], 1]", expected: "[7]", compare: "unordered", visible: true },
      { id: "negatives", input: "[[-1,-1,-2,-2,-2,3], 2]", expected: "[-1, -2]", compare: "unordered", visible: false },
      { id: "k-all-distinct", input: "[[5,6,7], 3]", expected: "[5, 6, 7]", compare: "unordered", visible: false },
      { id: "all-same", input: "[[2,2,2,2], 1]", expected: "[2]", compare: "unordered", visible: false },
      { id: "unsorted-k3", input: "[[3,0,2,1,2,0,1,2,1,2], 3]", expected: "[0, 1, 2]", compare: "unordered", visible: false },
      { id: "zero-value", input: "[[0,0,0,5,5,-5], 1]", expected: "[0]", compare: "unordered", visible: false },
      { id: "big", input: "[list(range(1000)) + [500] * 5 + [7] * 3, 2]", expected: "[500, 7]", compare: "unordered", visible: false },
    ],
    solution: `class Solution:
    def topKFrequent(self, nums: List[int], k: int) -> List[int]:
        count = Counter(nums)
        freq = [[] for _ in range(len(nums) + 1)]
        for n, c in count.items():
            freq[c].append(n)
        res = []
        for i in range(len(freq) - 1, 0, -1):
            for n in freq[i]:
                res.append(n)
                if len(res) == k:
                    return res
        return res`,
    hints: ["Start by counting how often each value appears.", "Sorting the counts works in O(n log n), and a size-k heap gives O(n log k). Can you avoid comparisons entirely?", "A count can't exceed n, so you can drop each value into a bucket indexed by its count and read buckets from the top."],
    clarify: [
      { question: "What if two values tie for the last spot?", answer: "That can't happen; the answer is guaranteed to be unique." },
      { question: "Does the output order matter?", answer: "No, any order is fine." },
      { question: "Can k be larger than the number of distinct values?", answer: "No, k is at most the number of distinct values." },
    ],
  },
  {
    lc: 238,
    kind: "algorithm",
    statement: `Given an integer array \`nums\`, return an array \`answer\` of the same length where \`answer[i]\` is the **product of every element of \`nums\` except \`nums[i]\`**.

- Do not use division.
- Aim for O(n) time.
- Every such product (and every prefix or suffix product) fits in a 32-bit signed integer.
- Follow-up: can you use only O(1) extra space, not counting the output array?`,
    examples: [
      { input: "nums = [2,3,4,5]", output: "[60,40,30,24]", explanation: "answer[0] = 3·4·5 = 60, answer[1] = 2·4·5 = 40, and so on." },
      { input: "nums = [-2,1,0,3]", output: "[0,0,-6,0]", explanation: "Only the position of the 0 skips it: (-2)·1·3 = -6." },
    ],
    constraints: ["2 <= nums.length <= 10^5", "-30 <= nums[i] <= 30", "All prefix and suffix products fit in a 32-bit integer"],
    signature: `class Solution:
    def productExceptSelf(self, nums: List[int]) -> List[int]:`,
    method: "productExceptSelf",
    tests: [
      { id: "ex1", input: "[[2,3,4,5]]", expected: "[60, 40, 30, 24]", visible: true },
      { id: "ex2", input: "[[-2,1,0,3]]", expected: "[0, 0, -6, 0]", visible: true },
      { id: "two-elements", input: "[[5,7]]", expected: "[7, 5]", visible: false },
      { id: "two-zeros", input: "[[0,4,0]]", expected: "[0, 0, 0]", visible: false },
      { id: "all-negative", input: "[[-1,-1,-1]]", expected: "[1, 1, 1]", visible: false },
      { id: "all-ones", input: "[[1,1,1,1]]", expected: "[1, 1, 1, 1]", visible: false },
      { id: "mixed", input: "[[3,-2,2,-1,4]]", expected: "[16, -24, 24, -48, 12]", visible: false },
      { id: "big-one-zero", input: "[[1] * 49999 + [0] + [1] * 50000]", expected: "[0] * 49999 + [1] + [0] * 50000", visible: false },
    ],
    solution: `class Solution:
    def productExceptSelf(self, nums: List[int]) -> List[int]:
        n = len(nums)
        res = [1] * n
        prefix = 1
        for i in range(n):
            res[i] = prefix
            prefix *= nums[i]
        postfix = 1
        for i in range(n - 1, -1, -1):
            res[i] *= postfix
            postfix *= nums[i]
        return res`,
    hints: ["answer[i] splits into two parts: everything to the left of i, and everything to the right of i.", "Running products from the left and from the right can each be built in one pass.", "Store the left products in the output array, then sweep from the right multiplying in a single running suffix value."],
    clarify: [
      { question: "Can the array contain zeros?", answer: "Yes, possibly more than one. Your approach shouldn't need special cases if you avoid division." },
      { question: "Can I use division?", answer: "No." },
      { question: "Does the output array count toward the space limit?", answer: "No, only extra space beyond it counts for the follow-up." },
    ],
  },
  {
    lc: 36,
    kind: "algorithm",
    statement: `You get a partially filled 9×9 Sudoku \`board\` as a list of rows; each cell is a digit \`"1"\`–\`"9"\` or \`"."\` for an empty cell. Return \`true\` if the **filled cells break no Sudoku rule**, otherwise \`false\`.

The rules, applied only to the filled cells:
1. A digit appears at most once in each row.
2. A digit appears at most once in each column.
3. A digit appears at most once in each of the nine 3×3 boxes (rows 0–2/3–5/6–8 crossed with columns 0–2/3–5/6–8).

You do **not** need to check whether the puzzle can actually be solved; a board that follows the rules but has no solution is still valid.`,
    examples: [
      { input: "board =\n[[\"1\",\".\",\".\",\".\",\"5\",\".\",\".\",\".\",\"9\"],\n [\".\",\"5\",\".\",\".\",\".\",\"9\",\".\",\".\",\".\"],\n [\".\",\".\",\"9\",\".\",\".\",\".\",\"4\",\".\",\".\"],\n [\".\",\".\",\".\",\"5\",\".\",\".\",\".\",\"9\",\".\"],\n [\"5\",\".\",\".\",\".\",\"9\",\".\",\".\",\".\",\"4\"],\n [\".\",\"9\",\".\",\".\",\".\",\"4\",\".\",\".\",\".\"],\n [\".\",\".\",\"5\",\".\",\".\",\".\",\"9\",\".\",\".\"],\n [\".\",\".\",\".\",\"9\",\".\",\".\",\".\",\"4\",\".\"],\n [\"9\",\".\",\".\",\".\",\"4\",\".\",\".\",\".\",\"8\"]]", output: "true" },
      { input: "board =\n[[\"1\",\".\",\".\",\".\",\"5\",\".\",\".\",\".\",\"9\"],\n [\".\",\"5\",\"1\",\".\",\".\",\"9\",\".\",\".\",\".\"],\n [\".\",\".\",\"9\",\".\",\".\",\".\",\"4\",\".\",\".\"],\n [\".\",\".\",\".\",\"5\",\".\",\".\",\".\",\"9\",\".\"],\n [\"5\",\".\",\".\",\".\",\"9\",\".\",\".\",\".\",\"4\"],\n [\".\",\"9\",\".\",\".\",\".\",\"4\",\".\",\".\",\".\"],\n [\".\",\".\",\"5\",\".\",\".\",\".\",\"9\",\".\",\".\"],\n [\".\",\".\",\".\",\"9\",\".\",\".\",\".\",\"4\",\".\"],\n [\"9\",\".\",\".\",\".\",\"4\",\".\",\".\",\".\",\"8\"]]", output: "false", explanation: "Same board as above plus a 1 at row 1, column 2: the top-left 3×3 box now holds two 1s, even though that row and column are fine." },
    ],
    constraints: ["board.length == 9", "board[i].length == 9", "board[i][j] is a digit \"1\"-\"9\" or \".\""],
    signature: `class Solution:
    def isValidSudoku(self, board: List[List[str]]) -> bool:`,
    method: "isValidSudoku",
    tests: [
      { id: "ex1", input: "[[['1', '.', '.', '.', '5', '.', '.', '.', '9'], ['.', '5', '.', '.', '.', '9', '.', '.', '.'], ['.', '.', '9', '.', '.', '.', '4', '.', '.'], ['.', '.', '.', '5', '.', '.', '.', '9', '.'], ['5', '.', '.', '.', '9', '.', '.', '.', '4'], ['.', '9', '.', '.', '.', '4', '.', '.', '.'], ['.', '.', '5', '.', '.', '.', '9', '.', '.'], ['.', '.', '.', '9', '.', '.', '.', '4', '.'], ['9', '.', '.', '.', '4', '.', '.', '.', '8']]]", expected: "True", visible: true },
      { id: "ex2-box-clash", input: "[[['1', '.', '.', '.', '5', '.', '.', '.', '9'], ['.', '5', '1', '.', '.', '9', '.', '.', '.'], ['.', '.', '9', '.', '.', '.', '4', '.', '.'], ['.', '.', '.', '5', '.', '.', '.', '9', '.'], ['5', '.', '.', '.', '9', '.', '.', '.', '4'], ['.', '9', '.', '.', '.', '4', '.', '.', '.'], ['.', '.', '5', '.', '.', '.', '9', '.', '.'], ['.', '.', '.', '9', '.', '.', '.', '4', '.'], ['9', '.', '.', '.', '4', '.', '.', '.', '8']]]", expected: "False", visible: true },
      { id: "row-clash", input: "[[['1', '.', '.', '.', '.', '.', '.', '.', '.'], ['.', '.', '.', '.', '.', '.', '.', '.', '.'], ['.', '.', '.', '.', '.', '.', '.', '.', '.'], ['.', '.', '.', '.', '.', '.', '.', '.', '.'], ['5', '.', '.', '.', '.', '.', '.', '.', '5'], ['.', '.', '.', '.', '.', '.', '.', '.', '.'], ['.', '.', '.', '.', '.', '.', '.', '.', '.'], ['.', '.', '.', '.', '.', '.', '.', '.', '.'], ['.', '.', '.', '.', '.', '.', '.', '.', '.']]]", expected: "False", visible: false },
      { id: "col-clash", input: "[[['.', '.', '.', '2', '.', '.', '.', '.', '.'], ['.', '.', '.', '.', '.', '.', '.', '.', '.'], ['.', '.', '.', '.', '.', '.', '.', '6', '.'], ['.', '.', '.', '.', '.', '.', '.', '.', '.'], ['.', '.', '.', '.', '.', '.', '.', '.', '.'], ['.', '.', '.', '.', '.', '.', '.', '.', '.'], ['.', '.', '.', '.', '.', '.', '.', '.', '.'], ['.', '.', '.', '.', '.', '.', '.', '.', '.'], ['.', '.', '.', '2', '.', '.', '.', '.', '.']]]", expected: "False", visible: false },
      { id: "empty-board", input: "[[[\".\"] * 9 for _ in range(9)]]", expected: "True", visible: false },
      { id: "full-solved", input: "[[['1', '2', '3', '4', '5', '6', '7', '8', '9'], ['4', '5', '6', '7', '8', '9', '1', '2', '3'], ['7', '8', '9', '1', '2', '3', '4', '5', '6'], ['2', '3', '4', '5', '6', '7', '8', '9', '1'], ['5', '6', '7', '8', '9', '1', '2', '3', '4'], ['8', '9', '1', '2', '3', '4', '5', '6', '7'], ['3', '4', '5', '6', '7', '8', '9', '1', '2'], ['6', '7', '8', '9', '1', '2', '3', '4', '5'], ['9', '1', '2', '3', '4', '5', '6', '7', '8']]]", expected: "True", visible: false },
      { id: "full-broken", input: "[[['4', '2', '3', '4', '5', '6', '7', '8', '9'], ['4', '5', '6', '7', '8', '9', '1', '2', '3'], ['7', '8', '9', '1', '2', '3', '4', '5', '6'], ['2', '3', '4', '5', '6', '7', '8', '9', '1'], ['5', '6', '7', '8', '9', '1', '2', '3', '4'], ['8', '9', '1', '2', '3', '4', '5', '6', '7'], ['3', '4', '5', '6', '7', '8', '9', '1', '2'], ['6', '7', '8', '9', '1', '2', '3', '4', '5'], ['9', '1', '2', '3', '4', '5', '6', '7', '8']]]", expected: "False", visible: false },
      { id: "valid-but-unsolvable", input: "[[['1', '2', '3', '4', '5', '6', '7', '8', '.'], ['.', '.', '.', '.', '.', '.', '.', '.', '.'], ['.', '.', '.', '.', '.', '.', '.', '.', '.'], ['.', '.', '.', '.', '.', '.', '.', '.', '.'], ['.', '.', '.', '.', '.', '.', '.', '.', '.'], ['.', '.', '.', '.', '.', '.', '.', '.', '9'], ['.', '.', '.', '.', '.', '.', '.', '.', '.'], ['.', '.', '.', '.', '.', '.', '.', '.', '.'], ['.', '.', '.', '.', '.', '.', '.', '.', '.']]]", expected: "True", visible: false },
      { id: "same-digit-diff-units", input: "[[['9', '.', '.', '.', '.', '.', '.', '.', '.'], ['.', '.', '.', '.', '.', '9', '.', '.', '.'], ['.', '.', '.', '.', '.', '.', '.', '.', '.'], ['.', '.', '.', '.', '.', '.', '.', '.', '.'], ['.', '.', '.', '.', '9', '.', '.', '.', '.'], ['.', '.', '.', '.', '.', '.', '.', '.', '.'], ['.', '.', '.', '.', '.', '.', '.', '.', '.'], ['.', '.', '.', '.', '.', '.', '.', '.', '.'], ['.', '.', '.', '.', '.', '.', '.', '.', '9']]]", expected: "True", visible: false },
    ],
    solution: `class Solution:
    def isValidSudoku(self, board: List[List[str]]) -> bool:
        rows, cols, boxes = defaultdict(set), defaultdict(set), defaultdict(set)
        for r in range(9):
            for c in range(9):
                v = board[r][c]
                if v == ".":
                    continue
                b = (r // 3, c // 3)
                if v in rows[r] or v in cols[c] or v in boxes[b]:
                    return False
                rows[r].add(v)
                cols[c].add(v)
                boxes[b].add(v)
        return True`,
    hints: ["Each filled cell belongs to one row, one column and one box. Keep a 'seen' set for each.", "Which box is cell (r, c) in? Try (r // 3, c // 3)."],
    clarify: [
      { question: "Do I need to check that the board is solvable?", answer: "No, only that the filled cells don't break the three rules." },
      { question: "Are empty cells always '.'?", answer: "Yes; every other cell is a digit 1–9." },
    ],
  },
  {
    lc: 271,
    kind: "algorithm",
    statement: `Design a way to **turn a list of strings into one string and back again**, losslessly. Implement the class \`Codec\`:

- \`encode(strs)\` takes a list of strings and returns a single string.
- \`decode(s)\` takes a string produced by \`encode\` and returns the original list, with the same strings in the same order.

Rules:
- The strings can contain **any** of the 256 ASCII characters, including digits, \`#\`, commas, spaces and newlines, so no single character is safe to use as a plain separator.
- The list may be empty, and individual strings may be empty; both must survive the round trip.
- The encoding must be self-contained: the tests call \`decode\` on a **fresh** \`Codec\` object, so you cannot stash the list in an attribute.
- Don't use a serializer such as \`eval\` or \`json\`.`,
    examples: [
      { input: "strs = [\"hello\",\"world\"]", output: "[\"hello\",\"world\"]", explanation: "decode(encode(strs)) returns the same list." },
      { input: "strs = [\"a#b\",\"\",\"3#x\"]", output: "[\"a#b\",\"\",\"3#x\"]", explanation: "Separators and empty strings inside the data must not confuse the decoder." },
    ],
    constraints: ["0 <= strs.length < 200", "0 <= strs[i].length < 200", "strs[i] contains any of the 256 valid ASCII characters"],
    signature: `class Codec:
    def encode(self, strs: List[str]) -> str:
        """Pack the list of strings into a single string."""

    def decode(self, s: str) -> List[str]:
        """Unpack a string made by encode back into the list."""`,
    method: "encode",
    driver: `def run(ns, args):
    # encode with one Codec, decode with a fresh one: the encoding must carry all the information
    encoded = ns["Codec"]().encode(list(args[0]))
    if not isinstance(encoded, str):
        raise TypeError(f"encode must return a str, got {type(encoded).__name__}")
    return ns["Codec"]().decode(encoded)
`,
    tests: [
      { id: "ex1", input: "[[\"hello\", \"world\"]]", expected: "['hello', 'world']", visible: true },
      { id: "ex2", input: "[[\"a#b\", \"\", \"3#x\"]]", expected: "['a#b', '', '3#x']", visible: true },
      { id: "empty-list", input: "[[]]", expected: "[]", visible: false },
      { id: "one-empty-string", input: "[[\"\"]]", expected: "['']", visible: false },
      { id: "two-empty-strings", input: "[[\"\", \"\"]]", expected: "['', '']", visible: false },
      { id: "digits-and-hashes", input: "[[\"12#34\", \"#\", \"##\", \"5\"]]", expected: "['12#34', '#', '##', '5']", visible: false },
      { id: "whitespace", input: "[[\"line\\nbreak\", \"tab\\there\", \" \", \",\"]]", expected: "['line\\nbreak', 'tab\\there', ' ', ',']", visible: false },
      { id: "all-ascii", input: "[[chr(i) for i in range(128)] + [''.join(chr(i) for i in range(128, 256))]]", expected: "[chr(i) for i in range(128)] + [''.join(chr(i) for i in range(128, 256))]", visible: false },
      { id: "big", input: "[[str(i) * 50 for i in range(199)]]", expected: "[str(i) * 50 for i in range(199)]", visible: false },
    ],
    solution: `class Codec:
    def encode(self, strs: List[str]) -> str:
        return "".join(f"{len(s)}#{s}" for s in strs)

    def decode(self, s: str) -> List[str]:
        res, i = [], 0
        while i < len(s):
            j = i
            while s[j] != "#":
                j += 1
            length = int(s[i:j])
            res.append(s[j + 1 : j + 1 + length])
            i = j + 1 + length
        return res`,
    hints: ["Any delimiter you pick can also appear inside a string. What extra information would let the decoder skip over the content blindly?", "Write each string's length before it, followed by a marker that ends the length.", "When decoding, read digits up to the marker, then take exactly that many characters, no matter what they are."],
    clarify: [
      { question: "Can the strings contain my delimiter character?", answer: "Yes, any ASCII character can appear." },
      { question: "Can the list or a string be empty?", answer: "Yes; [] and [\"\"] must decode to different results." },
      { question: "Can encode and decode share state?", answer: "No. Decode only gets the string, as if it were sent over a network." },
    ],
  },
  {
    lc: 128,
    kind: "algorithm",
    statement: `Given an **unsorted** integer array \`nums\`, return the length of the **longest run of consecutive integers** (values \`x, x+1, x+2, …\`) that can be formed from the values in it.

- The values don't need to be adjacent or in order in the array; only which values are present matters.
- Repeated values count once.
- An empty array has answer \`0\`.
- Your algorithm should run in O(n) time.`,
    examples: [
      { input: "nums = [10,4,11,2,3,12,1]", output: "4", explanation: "1, 2, 3, 4 are all present; 10, 11, 12 is a shorter run." },
      { input: "nums = [8,-1,0,7,1,9]", output: "3", explanation: "Both -1, 0, 1 and 7, 8, 9 have length 3." },
    ],
    constraints: ["0 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9"],
    signature: `class Solution:
    def longestConsecutive(self, nums: List[int]) -> int:`,
    method: "longestConsecutive",
    tests: [
      { id: "ex1", input: "[[10,4,11,2,3,12,1]]", expected: "4", visible: true },
      { id: "ex2", input: "[[8,-1,0,7,1,9]]", expected: "3", visible: true },
      { id: "empty", input: "[[]]", expected: "0", visible: false },
      { id: "single", input: "[[5]]", expected: "1", visible: false },
      { id: "duplicates", input: "[[1,2,2,3,3,3]]", expected: "3", visible: false },
      { id: "negatives", input: "[[-3,-2,-1,5]]", expected: "3", visible: false },
      { id: "all-same", input: "[[7,7,7]]", expected: "1", visible: false },
      { id: "far-apart", input: "[[-1000000000, 0, 1000000000]]", expected: "1", visible: false },
      { id: "big-run", input: "[list(reversed(range(-50000, 50000)))]", expected: "100000", visible: false },
      { id: "big-gaps", input: "[list(range(0, 200000, 2))]", expected: "1", visible: false },
    ],
    solution: `class Solution:
    def longestConsecutive(self, nums: List[int]) -> int:
        s = set(nums)
        best = 0
        for n in s:
            if n - 1 in s:
                continue
            length = 1
            while n + length in s:
                length += 1
            best = max(best, length)
        return best`,
    hints: ["Sorting solves it in O(n log n). To reach O(n), put everything in a set for O(1) lookups.", "Only start counting from a value that begins a run: one whose predecessor (x - 1) is missing.", "From each run start, step x+1, x+2, … while present. Each value is visited a constant number of times overall."],
    clarify: [
      { question: "Do duplicates extend a run?", answer: "No, a repeated value counts once." },
      { question: "What should an empty array return?", answer: "0." },
      { question: "Must the run be contiguous in the array?", answer: "No, only the values matter, not their positions." },
    ],
  },
];
