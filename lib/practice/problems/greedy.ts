/**
 * Arena problems: greedy. Same problems as LeetCode, our own words, verified tests (see ../types.ts).
 * - 53 Maximum Subarray (Medium)
 * - 55 Jump Game (Medium)
 * - 45 Jump Game II (Medium)
 * - 134 Gas Station (Medium)
 * - 846 Hand of Straights (Medium)
 * - 1899 Merge Triplets to Form Target Triplet (Medium)
 * - 763 Partition Labels (Medium)
 * - 678 Valid Parenthesis String (Medium)
 */
import type { ArenaProblem } from "../types";

export const arena: ArenaProblem[] = [
  {
    lc: 53,
    kind: "algorithm",
    statement: `You are given an integer array \`nums\`. Among all **non-empty contiguous subarrays**, find the one with the largest sum and return **that sum**.

- A subarray is a run of consecutive elements; it must contain at least one element.
- If every number is negative, the answer is the largest single element.`,
    examples: [
      { input: "nums = [3, -5, 4, -1, 2, 1, -6, 2]", output: "6", explanation: "The run [4, -1, 2, 1] adds up to 6." },
      { input: "nums = [-7, -2, -9]", output: "-2", explanation: "Every number is negative, so the best is the single element -2." },
      { input: "nums = [5, 1, 8]", output: "14" },
    ],
    constraints: ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
    signature: `class Solution:
    def maxSubArray(self, nums: List[int]) -> int:`,
    method: "maxSubArray",
    tests: [
      { id: "ex1", input: "[[3, -5, 4, -1, 2, 1, -6, 2]]", expected: "6", visible: true },
      { id: "ex2", input: "[[-7, -2, -9]]", expected: "-2", visible: true },
      { id: "ex3", input: "[[5, 1, 8]]", expected: "14", visible: true },
      { id: "single", input: "[[-4]]", expected: "-4", visible: false },
      { id: "zero", input: "[[0, -1, 0]]", expected: "0", visible: false },
      { id: "dip", input: "[[6, -7, 6]]", expected: "6", visible: false },
      { id: "dip_worth", input: "[[6, -5, 6]]", expected: "7", visible: false },
      { id: "tail", input: "[[-1, -2, 3, 4]]", expected: "7", visible: false },
      { id: "big", input: "[[(i % 7) - 3 for i in range(100000)]]", expected: "6", visible: false },
      { id: "big_neg", input: "[[-10000] * 99999 + [-1]]", expected: "-1", visible: false },
    ],
    solution: `class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        best = nums[0]
        cur = 0
        for n in nums:
            if cur < 0:
                cur = 0
            cur += n
            best = max(best, cur)
        return best`,
    hints: ["Think about the best subarray that ends exactly at index i.", "If the running sum before i is negative, it only hurts: start fresh at i.", "Track the best running sum seen; initialise it with the first element so all-negative arrays work."],
    clarify: [
      { question: "Can the subarray be empty (sum 0)?", answer: "No, it must contain at least one element." },
      { question: "Do I return the subarray or its sum?", answer: "Just the sum." },
    ],
  },
  {
    lc: 55,
    kind: "algorithm",
    statement: `You are given an integer array \`nums\`. You start on index \`0\`. Standing on index \`i\`, you may jump forward **any distance from 1 up to \`nums[i]\`** (a value of \`0\` means you are stuck there). Return \`True\` if you can reach the **last index**, otherwise \`False\`.`,
    examples: [
      { input: "nums = [1, 3, 0, 0, 2, 1]", output: "True", explanation: "0 → 1, then a jump of 3 lands on index 4, which reaches the end." },
      { input: "nums = [2, 1, 0, 4]", output: "False", explanation: "Every route lands on index 2, whose value is 0." },
    ],
    constraints: ["1 <= nums.length <= 10^4", "0 <= nums[i] <= 10^5"],
    signature: `class Solution:
    def canJump(self, nums: List[int]) -> bool:`,
    method: "canJump",
    tests: [
      { id: "ex1", input: "[[1, 3, 0, 0, 2, 1]]", expected: "True", visible: true },
      { id: "ex2", input: "[[2, 1, 0, 4]]", expected: "False", visible: true },
      { id: "single_zero", input: "[[0]]", expected: "True", visible: false },
      { id: "start_zero", input: "[[0, 1]]", expected: "False", visible: false },
      { id: "exact", input: "[[1, 1, 1, 1]]", expected: "True", visible: false },
      { id: "overshoot", input: "[[9, 0, 0, 0]]", expected: "True", visible: false },
      { id: "gap", input: "[[3, 2, 1, 0, 0]]", expected: "False", visible: false },
      { id: "big_yes", input: "[[1] * 9999 + [0]]", expected: "True", visible: false },
      { id: "big_no", input: "[[1] * 5000 + [0] + [1] * 4999]", expected: "False", visible: false },
    ],
    solution: `class Solution:
    def canJump(self, nums: List[int]) -> bool:
        goal = len(nums) - 1
        for i in range(len(nums) - 2, -1, -1):
            if i + nums[i] >= goal:
                goal = i
        return goal == 0`,
    hints: ["Work backwards: call the last index the goal.", "Scanning right to left, if index i can jump at least as far as the goal, i becomes the new goal.", "You succeed exactly when the goal moves all the way back to index 0. (Equivalently, track the farthest reachable index going forward.)"],
    clarify: [
      { question: "Must I land exactly on the last index?", answer: "Reaching or jumping past it both count; the jump length can be anything from 1 to nums[i]." },
      { question: "What if the array has one element?", answer: "You are already on the last index, so True." },
      { question: "Can I jump backwards?", answer: "No, only forward." },
    ],
  },
  {
    lc: 45,
    kind: "algorithm",
    statement: `You are given an integer array \`nums\` and start on index \`0\`. From index \`i\` you may jump forward to any index from \`i + 1\` to \`i + nums[i]\`. Return the **fewest jumps** needed to reach the last index.

- The input is guaranteed to allow reaching the last index.
- If the array has only one element, no jump is needed.`,
    examples: [
      { input: "nums = [2, 4, 1, 1, 1, 1]", output: "2", explanation: "Jump to index 1, then 4 steps to index 5: 2 jumps." },
      { input: "nums = [1, 1, 1, 1]", output: "3" },
    ],
    constraints: ["1 <= nums.length <= 10^4", "0 <= nums[i] <= 1000", "The last index is always reachable."],
    signature: `class Solution:
    def jump(self, nums: List[int]) -> int:`,
    method: "jump",
    tests: [
      { id: "ex1", input: "[[2, 4, 1, 1, 1, 1]]", expected: "2", visible: true },
      { id: "ex2", input: "[[1, 1, 1, 1]]", expected: "3", visible: true },
      { id: "single", input: "[[0]]", expected: "0", visible: false },
      { id: "one_hop", input: "[[5, 0, 0, 0, 0]]", expected: "1", visible: false },
      { id: "greedy_trap", input: "[[3, 1, 1, 3, 1, 1, 1]]", expected: "2", visible: false },
      { id: "choose_far", input: "[[2, 3, 0, 1, 4]]", expected: "2", visible: false },
      { id: "two", input: "[[1, 0]]", expected: "1", visible: false },
      { id: "big", input: "[[1] * 10000]", expected: "9999", visible: false },
      { id: "big_steps", input: "[[3] * 10000]", expected: "3333", visible: false },
    ],
    solution: `class Solution:
    def jump(self, nums: List[int]) -> int:
        jumps = 0
        l = r = 0
        while r < len(nums) - 1:
            farthest = 0
            for i in range(l, r + 1):
                farthest = max(farthest, i + nums[i])
            l, r = r + 1, farthest
            jumps += 1
        return jumps`,
    hints: ["Think in layers like BFS: the indices reachable with k jumps form a contiguous window.", "From the current window [l, r], the next window ends at the farthest i + nums[i] over that window.", "Count how many windows you need until the window covers the last index."],
    clarify: [
      { question: "Is the end always reachable?", answer: "Yes, the input guarantees it." },
      { question: "How many jumps for a one-element array?", answer: "0." },
    ],
  },
  {
    lc: 134,
    kind: "algorithm",
    statement: `There are \`n\` fuel stations arranged in a **circle**, numbered \`0\` to \`n - 1\`. Stopping at station \`i\` adds \`gas[i]\` units of fuel to your tank, and driving from station \`i\` to station \`i + 1\` (station \`n - 1\` leads back to \`0\`) burns \`cost[i]\` units.

Your tank holds unlimited fuel and starts **empty** at the station you choose. Return the index of a starting station from which you can drive all the way round once, clockwise, without the tank ever going negative. If no such station exists, return \`-1\`.

- If an answer exists, it is guaranteed to be unique.`,
    examples: [
      { input: "gas = [2, 5, 1, 4], cost = [3, 2, 3, 3]", output: "1", explanation: "Start at 1: tank 3 → (+1-3) 1 → (+4-3) 2 → (+2-3) 1, back at station 1." },
      { input: "gas = [3, 3], cost = [4, 4]", output: "-1", explanation: "Total fuel 6 is less than total cost 8, so no start works." },
    ],
    constraints: ["n == gas.length == cost.length", "1 <= n <= 10^5", "0 <= gas[i], cost[i] <= 10^4", "If a valid start exists, it is unique."],
    signature: `class Solution:
    def canCompleteCircuit(self, gas: List[int], cost: List[int]) -> int:`,
    method: "canCompleteCircuit",
    tests: [
      { id: "ex1", input: "[[2, 5, 1, 4], [3, 2, 3, 3]]", expected: "1", visible: true },
      { id: "ex2", input: "[[3, 3], [4, 4]]", expected: "-1", visible: true },
      { id: "single_ok", input: "[[5], [5]]", expected: "0", visible: false },
      { id: "single_no", input: "[[1], [2]]", expected: "-1", visible: false },
      { id: "last", input: "[[1, 1, 1, 6], [2, 2, 2, 3]]", expected: "3", visible: false },
      { id: "zero", input: "[[0, 0, 0], [0, 0, 0]]", expected: "0", visible: false },
      { id: "first", input: "[[4, 0, 0], [1, 1, 2]]", expected: "0", visible: false },
      { id: "big", input: "[[0] * 99999 + [100000], [1] * 100000]", expected: "99999", visible: false },
      { id: "big_no", input: "[[1] * 100000, [1] * 99999 + [2]]", expected: "-1", visible: false },
    ],
    solution: `class Solution:
    def canCompleteCircuit(self, gas: List[int], cost: List[int]) -> int:
        if sum(gas) < sum(cost):
            return -1
        tank = 0
        start = 0
        for i in range(len(gas)):
            tank += gas[i] - cost[i]
            if tank < 0:
                tank = 0
                start = i + 1
        return start`,
    hints: ["If the total gas is less than the total cost, no start can work. Otherwise some start does.", "Simulate from a candidate start; if the tank drops below zero at station i, none of the stations from the candidate up to i can be the start.", "So restart the candidate at i + 1 with an empty tank; one pass is enough."],
    clarify: [
      { question: "Does the tank start empty?", answer: "Yes, you collect gas[start] first, then pay cost[start] to move on." },
      { question: "Can there be two valid starts?", answer: "No, the answer is unique when it exists." },
      { question: "Which direction do I drive?", answer: "Forward: station i to i + 1, wrapping from n - 1 to 0." },
    ],
  },
  {
    lc: 846,
    kind: "algorithm",
    statement: `You hold a hand of cards, given as an integer array \`hand\` where each value is a card's number, and an integer \`groupSize\`. Decide whether the **whole hand** can be split into groups such that:

- every group has exactly \`groupSize\` cards, and
- the cards in each group are **consecutive numbers** (like \`4, 5, 6\`).

Every card must belong to exactly one group. Return \`True\` if such a split exists, otherwise \`False\`.`,
    examples: [
      { input: "hand = [5, 2, 4, 3, 6, 3, 4, 5], groupSize = 4", output: "True", explanation: "Groups [2,3,4,5] and [3,4,5,6]." },
      { input: "hand = [1, 2, 4, 5], groupSize = 2", output: "True", explanation: "[1,2] and [4,5] work." },
      { input: "hand = [7, 8, 10], groupSize = 3", output: "False", explanation: "9 is missing." },
    ],
    constraints: ["1 <= hand.length <= 10^4", "0 <= hand[i] <= 10^9", "1 <= groupSize <= hand.length"],
    signature: `class Solution:
    def isNStraightHand(self, hand: List[int], groupSize: int) -> bool:`,
    method: "isNStraightHand",
    tests: [
      { id: "ex1", input: "[[5, 2, 4, 3, 6, 3, 4, 5], 4]", expected: "True", visible: true },
      { id: "ex2", input: "[[1, 2, 4, 5], 2]", expected: "True", visible: true },
      { id: "ex3", input: "[[7, 8, 10], 3]", expected: "False", visible: true },
      { id: "size_one", input: "[[9, 9, 3], 1]", expected: "True", visible: false },
      { id: "not_divisible", input: "[[1, 2, 3, 4, 5], 2]", expected: "False", visible: false },
      { id: "dupes", input: "[[1, 1, 2, 2, 3, 3], 3]", expected: "True", visible: false },
      { id: "leftover", input: "[[1, 1, 2, 3], 2]", expected: "False", visible: false },
      { id: "large_vals", input: "[[1000000000, 999999999, 999999998], 3]", expected: "True", visible: false },
      { id: "big", input: "[list(range(1000)) * 3, 5]", expected: "True", visible: false },
      { id: "big_no", input: "[list(range(1000)) * 3 + [2000, 2001, 2003], 3]", expected: "False", visible: false },
    ],
    solution: `class Solution:
    def isNStraightHand(self, hand: List[int], groupSize: int) -> bool:
        if len(hand) % groupSize:
            return False
        count = Counter(hand)
        for n in sorted(count):
            c = count[n]
            if c == 0:
                continue
            for x in range(n, n + groupSize):
                if count[x] < c:
                    return False
                count[x] -= c
        return True`,
    hints: ["The smallest card left in the hand has to start a group; nothing smaller can contain it.", "Count each value, then walk the values in increasing order.", "If the smallest remaining value appears c times, it starts c groups, so the next groupSize - 1 values must each be available at least c times."],
    clarify: [
      { question: "Can numbers repeat in the hand?", answer: "Yes; each copy is a separate card." },
      { question: "Do all cards have to be used?", answer: "Yes, every card must land in exactly one group." },
      { question: "Does a group wrap around (e.g. ..., 9, 0)?", answer: "No, consecutive means each card is exactly one more than the previous." },
    ],
  },
  {
    lc: 1899,
    kind: "algorithm",
    statement: `You are given a list \`triplets\`, where each \`triplets[i] = [a_i, b_i, c_i]\`, and a goal triplet \`target = [x, y, z]\`.

You may perform this operation as many times as you like (including zero): choose two different indices \`i\` and \`j\` and replace \`triplets[j]\` with their element-wise maximum, \`[max(a_i, a_j), max(b_i, b_j), max(c_i, c_j)]\`.

Return \`True\` if, after some sequence of operations, \`target\` appears as one of the triplets in the list; otherwise return \`False\`.`,
    examples: [
      { input: "triplets = [[4,1,2],[1,6,3],[5,6,9]], target = [4,6,3]", output: "True", explanation: "Merging [4,1,2] and [1,6,3] gives [4,6,3]. [5,6,9] is never used because it exceeds the target." },
      { input: "triplets = [[2,2,2],[3,1,1]], target = [3,2,1]", output: "False", explanation: "Getting the 2 in the middle needs [2,2,2], which would push the last value to 2." },
    ],
    constraints: ["1 <= triplets.length <= 10^5", "triplets[i].length == target.length == 3", "1 <= a_i, b_i, c_i, x, y, z <= 1000"],
    signature: `class Solution:
    def mergeTriplets(self, triplets: List[List[int]], target: List[int]) -> bool:`,
    method: "mergeTriplets",
    tests: [
      { id: "ex1", input: "[[[4, 1, 2], [1, 6, 3], [5, 6, 9]], [4, 6, 3]]", expected: "True", visible: true },
      { id: "ex2", input: "[[[2, 2, 2], [3, 1, 1]], [3, 2, 1]]", expected: "False", visible: true },
      { id: "already", input: "[[[7, 8, 9]], [7, 8, 9]]", expected: "True", visible: false },
      { id: "single_no", input: "[[[7, 8, 8]], [7, 8, 9]]", expected: "False", visible: false },
      { id: "three_parts", input: "[[[5, 1, 1], [1, 5, 1], [1, 1, 5]], [5, 5, 5]]", expected: "True", visible: false },
      { id: "overshoot_only", input: "[[[9, 9, 9], [1, 1, 1]], [5, 5, 5]]", expected: "False", visible: false },
      { id: "missing_one", input: "[[[3, 1, 1], [1, 3, 1], [1, 1, 2]], [3, 3, 3]]", expected: "False", visible: false },
      { id: "big", input: "[[[i % 1000 + 1, (i * 7) % 500 + 1, 1] for i in range(100000)] + [[1, 1, 2]], [1000, 500, 2]]", expected: "True", visible: false },
      { id: "big_no", input: "[[[i % 999 + 1, 2, 2] for i in range(100000)], [1000, 2, 2]]", expected: "False", visible: false },
    ],
    solution: `class Solution:
    def mergeTriplets(self, triplets: List[List[int]], target: List[int]) -> bool:
        good = set()
        for t in triplets:
            if t[0] > target[0] or t[1] > target[1] or t[2] > target[2]:
                continue
            for i, v in enumerate(t):
                if v == target[i]:
                    good.add(i)
        return len(good) == 3`,
    hints: ["Merging only ever increases values, so a triplet with any value above the target's can never be used.", "Merging all the remaining (safe) triplets gives the biggest result you can build without overshooting.", "So the answer is True exactly when, among safe triplets, each of the three positions is matched by at least one of them."],
    clarify: [
      { question: "Can I use a triplet in several merges?", answer: "Yes, there is no limit on operations." },
      { question: "Does target need to be the only triplet left?", answer: "No, it just has to appear somewhere in the list." },
      { question: "Can values ever decrease?", answer: "No, max never lowers a value." },
    ],
  },
  {
    lc: 763,
    kind: "algorithm",
    statement: `You are given a string \`s\`. Cut it into **as many pieces as possible** so that **each letter appears in at most one piece** (all copies of a letter end up in the same piece).

The pieces, concatenated in order, must give back \`s\`. Return a list of the **lengths of the pieces**, from left to right.`,
    examples: [
      { input: "s = \"abacdcefgfh\"", output: "[3, 3, 1, 3, 1]", explanation: "Pieces \"aba\", \"cdc\", \"e\", \"fgf\", \"h\"." },
      { input: "s = \"xyzzyx\"", output: "[6]", explanation: "x appears at both ends, so the whole string is one piece." },
    ],
    constraints: ["1 <= s.length <= 500", "s contains only lowercase English letters."],
    signature: `class Solution:
    def partitionLabels(self, s: str) -> List[int]:`,
    method: "partitionLabels",
    tests: [
      { id: "ex1", input: "[\"abacdcefgfh\"]", expected: "[3, 3, 1, 3, 1]", visible: true },
      { id: "ex2", input: "[\"xyzzyx\"]", expected: "[6]", visible: true },
      { id: "single", input: "[\"q\"]", expected: "[1]", visible: false },
      { id: "distinct", input: "[\"abcde\"]", expected: "[1, 1, 1, 1, 1]", visible: false },
      { id: "same", input: "[\"aaaa\"]", expected: "[4]", visible: false },
      { id: "pairs", input: "[\"aabbcc\"]", expected: "[2, 2, 2]", visible: false },
      { id: "overlap", input: "[\"abcabddefe\"]", expected: "[5, 2, 3]", visible: false },
      { id: "chain", input: "[\"abcbdcedf\"]", expected: "[1, 7, 1]", visible: false },
      { id: "big", input: "[\"\".join(chr(97 + i % 26) for i in range(500))]", expected: "[500]", visible: false },
      { id: "big_blocks", input: "[\"\".join(chr(97 + i) * (i + 1) for i in range(26))[:500]]", expected: "[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26]", visible: false },
    ],
    solution: `class Solution:
    def partitionLabels(self, s: str) -> List[int]:
        last = {c: i for i, c in enumerate(s)}
        res = []
        size = end = 0
        for i, c in enumerate(s):
            size += 1
            end = max(end, last[c])
            if i == end:
                res.append(size)
                size = 0
        return res`,
    hints: ["Record the last index where each letter appears.", "Scan left to right, stretching the current piece's end to the last occurrence of every letter you meet.", "When the scan index reaches that end, the piece can be closed: record its length and start a new one."],
    clarify: [
      { question: "Do I return the pieces or their lengths?", answer: "The lengths, in left-to-right order." },
      { question: "Must the pieces keep the original order of s?", answer: "Yes, you only cut; you never rearrange." },
    ],
  },
  {
    lc: 678,
    kind: "algorithm",
    statement: `You are given a string \`s\` made only of the characters \`'('\`, \`')'\` and \`'*'\`. Each \`'*'\` is a wildcard that you may treat as \`'('\`, as \`')'\`, or as nothing at all (each star chosen independently).

Return \`True\` if some choice for the stars makes \`s\` a **balanced** bracket string, otherwise \`False\`. Balanced means:

- every \`'('\` has a matching \`')'\` somewhere after it, and every \`')'\` has a matching \`'('\` somewhere before it;
- the empty string is balanced.`,
    examples: [
      { input: "s = \"(*))\"", output: "True", explanation: "Treat the star as '(' to get \"(())\"." },
      { input: "s = \"*)(\"", output: "False", explanation: "The final '(' can never be closed." },
      { input: "s = \"(*\"", output: "True" },
    ],
    constraints: ["1 <= s.length <= 100", "s[i] is '(', ')' or '*'."],
    signature: `class Solution:
    def checkValidString(self, s: str) -> bool:`,
    method: "checkValidString",
    tests: [
      { id: "ex1", input: "[\"(*))\"]", expected: "True", visible: true },
      { id: "ex2", input: "[\"*)(\"]", expected: "False", visible: true },
      { id: "ex3", input: "[\"(*\"]", expected: "True", visible: true },
      { id: "star", input: "[\"*\"]", expected: "True", visible: false },
      { id: "close_first", input: "[\")\"]", expected: "False", visible: false },
      { id: "open_only", input: "[\"(((\"]", expected: "False", visible: false },
      { id: "mix", input: "[\"(*()*)(*\"]", expected: "True", visible: false },
      { id: "too_many_close", input: "[\"(*)))\"]", expected: "False", visible: false },
      { id: "big", input: "[\"(\" * 50 + \"*\" * 50]", expected: "True", visible: false },
      { id: "big_no", input: "[\"(\" * 51 + \"*\" * 49]", expected: "False", visible: false },
    ],
    solution: `class Solution:
    def checkValidString(self, s: str) -> bool:
        lo = hi = 0
        for c in s:
            if c == "(":
                lo, hi = lo + 1, hi + 1
            elif c == ")":
                lo, hi = lo - 1, hi - 1
            else:
                lo, hi = lo - 1, hi + 1
            if hi < 0:
                return False
            lo = max(lo, 0)
        return lo == 0`,
    hints: ["Instead of one open-bracket count, track the range [lo, hi] of counts that are possible so far.", "'(' raises both ends, ')' lowers both, '*' lowers lo and raises hi.", "If hi drops below 0 there are too many ')'. Clamp lo at 0. At the end the string works if lo is 0."],
    clarify: [
      { question: "Can a '*' be ignored?", answer: "Yes, it may stand for '(', ')' or the empty string." },
      { question: "Is the empty string balanced?", answer: "Yes." },
      { question: "Are other bracket types involved?", answer: "No, only round brackets and stars." },
    ],
  },
];
