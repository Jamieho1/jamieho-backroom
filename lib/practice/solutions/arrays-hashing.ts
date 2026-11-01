/**
 * Arrays & Hashing: the 9 NeetCode 150 problems, written in Jamie's format (2026-10-20): a one-line question in our
 * own words (no LeetCode statement text), Intuition, Algorithm (numbered steps, nested bullets), a step-by-step visual
 * and Python code. `==text==` renders as a highlighter mark.
 */
import type { Solution, Variation } from "../solutions";

const kv = (o: Record<string, string>) => Object.entries(o).map(([name, value]) => ({ name, value }));

export const variations: Variation[] = [
  {
    id: "seen-set",
    topic: "arrays-hashing",
    name: "Seen-before set",
    change: "Base pattern. Put each item in a ==hash set== and ask \"have I seen this?\" in O(1).",
    problems: [217, 36, 128],
  },
  {
    id: "count-map",
    topic: "arrays-hashing",
    name: "Count map",
    change: "Store ==how many times== each item appears, not just whether it appeared. The counts can become a key (group anagrams) or a bucket index (top K).",
    problems: [242, 49, 347],
  },
  {
    id: "index-map",
    topic: "arrays-hashing",
    name: "Value → index map",
    change: "Store ==where== you saw each value, so you can return positions. Look up the complement before inserting.",
    problems: [1],
  },
  {
    id: "prefix",
    topic: "arrays-hashing",
    name: "Prefix / postfix passes",
    change: "No hashing: precompute ==running results from the left and from the right==, then combine them per index.",
    problems: [238],
  },
  {
    id: "encode",
    topic: "arrays-hashing",
    name: "Length-prefix encoding",
    change: "Design, not lookup: write ==the length before each string== so any character (even the delimiter) is safe inside it.",
    problems: [271],
  },
];

export const solutions: Solution[] = [
  {
    lc: 217,
    variation: "seen-set",
    question: "Given a list of integers, say whether any value shows up more than once.",
    intuition: `Comparing every pair is O(n²). Instead, remember what you've already seen. A ==hash set answers "seen it?" in O(1)==, so the first time a number is already in the set, there's a duplicate.`,
    algorithm: `1. Create an empty set \`seen\`.
2. For each \`n\` in \`nums\`:
   * If \`n\` is ==already in \`seen\`==, return \`True\`.
   * Otherwise add \`n\` to \`seen\`.
3. Return \`False\` after the loop: every value was unique.`,
    visual: {
      kind: "array",
      title: "Contains duplicate · [1, 2, 3, 1]",
      values: [1, 2, 3, 1],
      frames: [
        { caption: "1 not in seen → add it", pointers: [{ name: "i", index: 0 }], highlight: [0], vars: kv({ seen: "{1}" }) },
        { caption: "2 not in seen → add it", pointers: [{ name: "i", index: 1 }], highlight: [1], done: [0], vars: kv({ seen: "{1, 2}" }) },
        { caption: "3 not in seen → add it", pointers: [{ name: "i", index: 2 }], highlight: [2], done: [0, 1], vars: kv({ seen: "{1, 2, 3}" }) },
        { caption: "1 is already in seen → duplicate, return True", pointers: [{ name: "i", index: 3 }], highlight: [0, 3], vars: kv({ seen: "{1, 2, 3}", answer: "True" }) },
      ],
    },
    code: `def containsDuplicate(nums: list[int]) -> bool:
    seen = set()
    for n in nums:
        if n in seen:
            return True
        seen.add(n)
    return False`,
    complexity: "Time O(n) · Space O(n)",
  },
  {
    lc: 242,
    variation: "count-map",
    question: "Given two strings, say whether one is a rearrangement of the other's letters.",
    intuition: `Two strings are anagrams exactly when ==every letter appears the same number of times== in both. Different lengths can't match. Count letters in one string, subtract counts for the other, and check everything lands back on zero.`,
    algorithm: `1. If \`len(s) != len(t)\`, return \`False\`.
2. Create \`count = [0] * 26\` (one slot per letter, index \`ord(c) - ord('a')\`).
3. For each position \`i\`:
   * ==Add 1== for \`s[i]\`.
   * ==Subtract 1== for \`t[i]\`.
4. Return \`True\` if ==every count is 0==, else \`False\`.`,
    visual: {
      kind: "array",
      title: "Valid anagram · \"rat\" vs \"tar\"",
      values: ["r", "a", "t"],
      frames: [
        { caption: "i=0: +1 for s[0]='r', −1 for t[0]='t'", pointers: [{ name: "i", index: 0 }], highlight: [0], vars: kv({ count: "r:+1  t:−1" }) },
        { caption: "i=1: +1 for 'a', −1 for 'a' → a stays 0", pointers: [{ name: "i", index: 1 }], highlight: [1], done: [0], vars: kv({ count: "r:+1  t:−1  a:0" }) },
        { caption: "i=2: +1 for 't', −1 for 'r' → both back to 0", pointers: [{ name: "i", index: 2 }], highlight: [2], done: [0, 1], vars: kv({ count: "r:0  t:0  a:0" }) },
        { caption: "Every count is 0 → anagram", done: [0, 1, 2], vars: kv({ count: "all 0", answer: "True" }) },
      ],
    },
    code: `def isAnagram(s: str, t: str) -> bool:
    if len(s) != len(t):
        return False
    count = [0] * 26
    for i in range(len(s)):
        count[ord(s[i]) - ord('a')] += 1
        count[ord(t[i]) - ord('a')] -= 1
    return all(c == 0 for c in count)`,
    complexity: "Time O(n) · Space O(1) (26 slots)",
  },
  {
    lc: 1,
    variation: "index-map",
    question: "Given a list of numbers and a target, return the positions of the two numbers that add up to it.",
    intuition: `For each number \`n\`, the partner you need is ==\`target - n\`==. If you remember every number you've passed ==with its index==, you can check for the partner in O(1). Check ==before== inserting, so a number never pairs with itself.`,
    algorithm: `1. Create an empty map \`seen\` (value → index).
2. For each index \`i\` and value \`n\`:
   * Compute \`diff = target - n\`.
   * If ==\`diff\` is in \`seen\`==, return \`[seen[diff], i]\`.
   * Otherwise store \`seen[n] = i\`.
3. The problem guarantees one answer, so the loop always returns.`,
    visual: {
      kind: "array",
      title: "Two Sum · target 14",
      values: [3, 5, 9, 2],
      frames: [
        { caption: "i=0: need 14−3=11. Not in map. Store 3→0.", pointers: [{ name: "i", index: 0 }], highlight: [0], vars: kv({ seen: "{3:0}" }) },
        { caption: "i=1: need 9. Not in map. Store 5→1.", pointers: [{ name: "i", index: 1 }], highlight: [1], done: [0], vars: kv({ seen: "{3:0, 5:1}" }) },
        { caption: "i=2: need 14−9=5. In map at index 1 → return [1, 2].", pointers: [{ name: "i", index: 2 }], highlight: [1, 2], vars: kv({ seen: "{3:0, 5:1}", answer: "[1, 2]" }) },
      ],
    },
    code: `def twoSum(nums: list[int], target: int) -> list[int]:
    seen = {}  # value -> index
    for i, n in enumerate(nums):
        diff = target - n
        if diff in seen:
            return [seen[diff], i]
        seen[n] = i
    return []`,
    complexity: "Time O(n) · Space O(n)",
  },
  {
    lc: 49,
    variation: "count-map",
    question: "Given a list of words, put the words that are anagrams of each other into the same group.",
    intuition: `Anagrams share the same ==letter counts==. Turn each word's 26 counts into a ==tuple== (lists can't be dict keys) and use it as the key. Every word with the same key belongs in the same group.`,
    algorithm: `1. Create \`groups = defaultdict(list)\`.
2. For each word \`s\`:
   * Build \`count = [0] * 26\` and add 1 for each letter.
   * Append \`s\` to ==\`groups[tuple(count)]\`==.
3. Return \`list(groups.values())\`.`,
    visual: {
      kind: "array",
      title: "Group anagrams · eat, tea, tan, ate",
      values: ["eat", "tea", "tan", "ate"],
      frames: [
        { caption: "\"eat\" → key (a1, e1, t1) → new group", pointers: [{ name: "w", index: 0 }], highlight: [0], vars: kv({ "a1e1t1": "[eat]" }) },
        { caption: "\"tea\" → same key → same group", pointers: [{ name: "w", index: 1 }], highlight: [0, 1], vars: kv({ "a1e1t1": "[eat, tea]" }) },
        { caption: "\"tan\" → key (a1, n1, t1) → new group", pointers: [{ name: "w", index: 2 }], highlight: [2], done: [0, 1], vars: kv({ "a1e1t1": "[eat, tea]", "a1n1t1": "[tan]" }) },
        { caption: "\"ate\" → key (a1, e1, t1) → joins the first group", pointers: [{ name: "w", index: 3 }], highlight: [0, 1, 3], done: [2], vars: kv({ "a1e1t1": "[eat, tea, ate]", "a1n1t1": "[tan]" }) },
      ],
    },
    code: `from collections import defaultdict

def groupAnagrams(strs: list[str]) -> list[list[str]]:
    groups = defaultdict(list)
    for s in strs:
        count = [0] * 26
        for c in s:
            count[ord(c) - ord('a')] += 1
        groups[tuple(count)].append(s)
    return list(groups.values())`,
    complexity: "Time O(m · n) for m words of length n · Space O(m · n)",
  },
  {
    lc: 347,
    variation: "count-map",
    question: "Given a list of integers and k, return the k values that appear most often.",
    intuition: `Count each value first. A frequency can never be more than \`n\`, so instead of sorting, use ==bucket sort==: bucket \`i\` holds the values that appear \`i\` times. ==Walk the buckets from the highest frequency down== until you've collected k values. That's O(n), not O(n log n).`,
    algorithm: `1. Count each value: \`count[n] += 1\`.
2. Create \`freq = [[] for _ in range(len(nums) + 1)]\`.
3. For each \`(n, c)\` in \`count\`, append \`n\` to ==\`freq[c]\`==.
4. For \`i\` from \`len(freq) - 1\` ==down to 1==:
   * For each \`n\` in \`freq[i]\`:
      * Append \`n\` to \`res\`.
      * If \`len(res) == k\`, return \`res\`.`,
    visual: {
      kind: "array",
      title: "Top K frequent (k = 2) · bucket sort",
      values: ["1", "1", "1", "2", "2", "3"],
      frames: [
        { caption: "Count first.", vars: kv({ count: "{1:3, 2:2, 3:1}" }) },
        { caption: "Buckets: index = frequency, holds the values.", values: ["", "[3]", "[2]", "[1]", "", "", ""], vars: kv({ freq: "index = how often" }) },
        { caption: "Walk from the right: bucket 3 gives 1.", values: ["", "[3]", "[2]", "[1]", "", "", ""], highlight: [3], vars: kv({ res: "[1]" }) },
        { caption: "Bucket 2 gives 2 → k values collected.", values: ["", "[3]", "[2]", "[1]", "", "", ""], highlight: [2], done: [3], vars: kv({ res: "[1, 2]", answer: "[1, 2]" }) },
      ],
    },
    code: `from collections import Counter

def topKFrequent(nums: list[int], k: int) -> list[int]:
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
    complexity: "Time O(n) · Space O(n)",
  },
  {
    lc: 238,
    variation: "prefix",
    question: "Given a list of integers, return a list where each position holds the product of all the other numbers, without using division.",
    intuition: `Every answer splits into two halves: ==everything to the left of i== and ==everything to the right of i==. Rather than multiplying those again for each index, build them once:

* \`pref[i]\` = product of the numbers ==before== \`i\` (nothing before index 0, so 1).
* \`suff[i]\` = product of the numbers ==after== \`i\` (nothing after the last index, so 1).

Then \`res[i] = pref[i] * suff[i]\`: the left half times the right half is ==every number except nums[i]==.`,
    algorithm: `1. Let \`n = len(nums)\` and make two lists of size \`n\`: \`pref\` and \`suff\` (\`res\` is built at the end).
2. Starting values (empty products are 1):
   * \`pref[0] = 1\`: nothing on the left of index 0.
   * \`suff[n - 1] = 1\`: nothing on the right of the last index.
3. Fill \`pref\` left → right, for \`i\` from 1 to \`n - 1\`:
   * \`pref[i] = pref[i - 1] * nums[i - 1]\` (==the previous product times the previous number==).
4. Fill \`suff\` right → left, for \`i\` from \`n - 2\` down to 0:
   * \`suff[i] = suff[i + 1] * nums[i + 1]\`.
5. For every \`i\`: \`res[i] = pref[i] * suff[i]\`.
6. Return \`res\`.`,
    visual: {
      kind: "grid",
      title: "Product except self · prefix & suffix lists · [1, 2, 3, 4]",
      rows: [
        [1, 2, 3, 4],
        ["", "", "", ""],
        ["", "", "", ""],
        ["", "", "", ""],
      ],
      rowLabels: ["nums", "pref", "suff", "res"],
      colLabels: ["i=0", "i=1", "i=2", "i=3"],
      frames: [
        { caption: "Start: pref[0] = 1 (nothing on its left), suff[3] = 1 (nothing on its right).", highlight: ["1,0", "2,3"], cells: [{ at: "1,0", value: 1 }, { at: "2,3", value: 1 }] },
        { caption: "pref[1] = pref[0] × nums[0] = 1 × 1 = 1.", highlight: ["1,1"], done: ["1,0", "0,0"], cells: [{ at: "1,1", value: 1 }] },
        { caption: "pref[2] = pref[1] × nums[1] = 1 × 2 = 2.", highlight: ["1,2"], done: ["1,1", "0,1"], cells: [{ at: "1,2", value: 2 }] },
        { caption: "pref[3] = pref[2] × nums[2] = 2 × 3 = 6. Left products done.", highlight: ["1,3"], done: ["1,2", "0,2"], cells: [{ at: "1,3", value: 6 }], vars: kv({ pref: "[1, 1, 2, 6]" }) },
        { caption: "Now right → left. suff[2] = suff[3] × nums[3] = 1 × 4 = 4.", highlight: ["2,2"], done: ["2,3", "0,3"], cells: [{ at: "2,2", value: 4 }] },
        { caption: "suff[1] = suff[2] × nums[2] = 4 × 3 = 12.", highlight: ["2,1"], done: ["2,2", "0,2"], cells: [{ at: "2,1", value: 12 }] },
        { caption: "suff[0] = suff[1] × nums[1] = 12 × 2 = 24. Right products done.", highlight: ["2,0"], done: ["2,1", "0,1"], cells: [{ at: "2,0", value: 24 }], vars: kv({ suff: "[24, 12, 4, 1]" }) },
        { caption: "res[i] = pref[i] × suff[i] → 1×24, 1×12, 2×4, 6×1.", highlight: ["3,0", "3,1", "3,2", "3,3"], cells: [{ at: "3,0", value: 24 }, { at: "3,1", value: 12 }, { at: "3,2", value: 8 }, { at: "3,3", value: 6 }], vars: kv({ answer: "[24, 12, 8, 6]" }) },
      ],
    },
    code: `def productExceptSelf(nums: list[int]) -> list[int]:
    n = len(nums)
    pref = [1] * n
    suff = [1] * n
    for i in range(1, n):              # left -> right
        pref[i] = pref[i - 1] * nums[i - 1]
    for i in range(n - 2, -1, -1):     # right -> left
        suff[i] = suff[i + 1] * nums[i + 1]
    return [pref[i] * suff[i] for i in range(n)]`,
    complexity: "Time O(n) · Space O(n) (O(1) extra with the optimised version)",
    alt: {
      title: "Follow-up: O(1) extra space",
      note: `Interviewers often ask to drop \`pref\` and \`suff\`. Same idea, but ==write the left products straight into \`res\`==, then walk back with one running number \`post\` and multiply it in. Only \`res\` (the output) is kept.`,
      code: `def productExceptSelf(nums: list[int]) -> list[int]:
    n = len(nums)
    res = [1] * n
    pre = 1
    for i in range(n):                 # res[i] = product left of i
        res[i] = pre
        pre *= nums[i]
    post = 1
    for i in range(n - 1, -1, -1):     # multiply in product right of i
        res[i] *= post
        post *= nums[i]
    return res`,
    },
  },
  {
    lc: 36,
    variation: "seen-set",
    question: "Given a partly filled 9×9 Sudoku grid, say whether the filled cells break any row, column or 3×3 box rule.",
    intuition: `It's "contains duplicate" three times at once. Keep ==one set per row, one per column and one per 3×3 box==. A cell's box is ==\`(r // 3, c // 3)\`==. If a digit is already in any of its three sets, the board is invalid.`,
    algorithm: `1. Create \`rows\`, \`cols\` and \`boxes\` as \`defaultdict(set)\`.
2. For each cell \`(r, c)\`:
   * Skip it if it's \`"."\`.
   * Let \`v = board[r][c]\` and \`b = (r // 3, c // 3)\`.
   * If \`v\` is ==in \`rows[r]\`, \`cols[c]\` or \`boxes[b]\`==, return \`False\`.
   * Otherwise add \`v\` to all three sets.
3. Return \`True\`.`,
    visual: {
      kind: "grid",
      title: "Valid Sudoku · top-left box (3×3 shown)",
      rows: [
        [5, 3, "."],
        [6, ".", "."],
        [".", 9, 5],
      ],
      frames: [
        { caption: "(0,0)=5 → add to row 0, col 0, box (0,0)", highlight: ["0,0"], vars: kv({ "row 0": "{5}", "col 0": "{5}", "box 0,0": "{5}" }) },
        { caption: "(0,1)=3 → add to row 0, col 1, box (0,0)", highlight: ["0,1"], done: ["0,0"], vars: kv({ "row 0": "{5, 3}", "col 1": "{3}", "box 0,0": "{5, 3}" }) },
        { caption: "(1,0)=6 → new in row 1, col 0 and the box", highlight: ["1,0"], done: ["0,0", "0,1"], vars: kv({ "row 1": "{6}", "col 0": "{5, 6}", "box 0,0": "{5, 3, 6}" }) },
        { caption: "(2,1)=9 → new everywhere", highlight: ["2,1"], done: ["0,0", "0,1", "1,0"], vars: kv({ "row 2": "{9}", "col 1": "{3, 9}", "box 0,0": "{5, 3, 6, 9}" }) },
        { caption: "(2,2)=5 → 5 is already in box (0,0) → invalid", highlight: ["2,2", "0,0"], done: ["0,1", "1,0", "2,1"], vars: kv({ "box 0,0": "{5, 3, 6, 9}", answer: "False" }) },
      ],
    },
    code: `from collections import defaultdict

def isValidSudoku(board: list[list[str]]) -> bool:
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
    complexity: "Time O(81) = O(1) · Space O(81) = O(1)",
  },
  {
    lc: 271,
    variation: "encode",
    question: "Design a way to turn a list of strings into one string and back again, for strings that may contain any character.",
    intuition: `A plain delimiter breaks as soon as a string contains it. Instead write ==the length, then \`#\`, then the string==. When decoding, read digits up to \`#\` to get the length, then ==jump exactly that many characters==. Whatever is inside the string never confuses the reader.`,
    algorithm: `**Encode**

1. For each string \`s\`, write \`str(len(s)) + "#" + s\`.
2. Join them all.

**Decode**

1. Start with \`i = 0\` and \`res = []\`.
2. While \`i < len(text)\`:
   * Move \`j\` from \`i\` until \`text[j] == "#"\`.
   * \`length = int(text[i:j])\`.
   * ==Append \`text[j + 1 : j + 1 + length]\`==.
   * Set \`i = j + 1 + length\`.
3. Return \`res\`.`,
    visual: {
      kind: "array",
      title: "Decode \"4#neet3#c#e\" (\"c#e\" holds a #)",
      values: ["4", "#", "n", "e", "e", "t", "3", "#", "c", "#", "e"],
      frames: [
        { caption: "Read digits up to the first # → length 4", pointers: [{ name: "i", index: 0 }, { name: "j", index: 1 }], highlight: [0], vars: kv({ length: "4" }) },
        { caption: "Take the next 4 characters → \"neet\"", range: [2, 5], vars: kv({ res: "[neet]" }) },
        { caption: "Jump to i=6. Read up to # → length 3", pointers: [{ name: "i", index: 6 }, { name: "j", index: 7 }], highlight: [6], done: [0, 1, 2, 3, 4, 5], vars: kv({ length: "3", res: "[neet]" }) },
        { caption: "Take 3 characters → \"c#e\". The # inside is just data.", range: [8, 10], done: [0, 1, 2, 3, 4, 5, 6, 7], vars: kv({ res: "[neet, c#e]" }) },
      ],
    },
    code: `def encode(strs: list[str]) -> str:
    return "".join(f"{len(s)}#{s}" for s in strs)

def decode(text: str) -> list[str]:
    res, i = [], 0
    while i < len(text):
        j = i
        while text[j] != "#":
            j += 1
        length = int(text[i:j])
        res.append(text[j + 1 : j + 1 + length])
        i = j + 1 + length
    return res`,
    complexity: "Time O(total characters) · Space O(1) besides the output",
  },
  {
    lc: 128,
    variation: "seen-set",
    question: "Given an unsorted list of integers, return the length of the longest run of consecutive values (like 1, 2, 3, 4).",
    intuition: `Put everything in a set. A number ==starts a run only if \`n - 1\` is not in the set==. From each start, count up while \`n + 1\`, \`n + 2\`, … exist. Each number is walked over at most once from a real start, so the whole thing is O(n).`,
    algorithm: `1. Create \`s = set(nums)\` and \`best = 0\`.
2. For each \`n\` in \`s\`:
   * If ==\`n - 1\` is in \`s\`==, skip it: it isn't a start.
   * Otherwise set \`length = 1\`.
   * While \`n + length\` is in \`s\`, add 1 to \`length\`.
   * Update \`best = max(best, length)\`.
3. Return \`best\`.`,
    visual: {
      kind: "array",
      title: "Longest consecutive · [100, 4, 200, 1, 3, 2]",
      values: [100, 4, 200, 1, 3, 2],
      frames: [
        { caption: "100: 99 not in set → a start. 101 missing → length 1.", pointers: [{ name: "n", index: 0 }], highlight: [0], vars: kv({ best: "1" }) },
        { caption: "4: 3 is in the set → not a start, skip.", pointers: [{ name: "n", index: 1 }], highlight: [1], vars: kv({ best: "1" }) },
        { caption: "200: a start, length 1.", pointers: [{ name: "n", index: 2 }], highlight: [2], vars: kv({ best: "1" }) },
        { caption: "1: 0 not in set → a start. Count 2, 3, 4 → length 4.", pointers: [{ name: "n", index: 3 }], highlight: [3, 5, 4, 1], vars: kv({ run: "1 → 2 → 3 → 4", best: "4" }) },
        { caption: "3 and 2 are not starts → skipped. Answer 4.", done: [3, 5, 4, 1], vars: kv({ answer: "4" }) },
      ],
    },
    code: `def longestConsecutive(nums: list[int]) -> int:
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
    complexity: "Time O(n) · Space O(n)",
  },
];

/** Recognise-it cues for the Roadmap flashcards. */