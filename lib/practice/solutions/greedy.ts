/**
 * greedy: NeetCode 150 problems, written in Jamie's format (see arrays-hashing.ts).
 * Problems:
 * - 53 Maximum Subarray (Medium)
 * - 55 Jump Game (Medium)
 * - 45 Jump Game II (Medium)
 * - 134 Gas Station (Medium)
 * - 846 Hand of Straights (Medium)
 * - 1899 Merge Triplets to Form Target Triplet (Medium)
 * - 763 Partition Labels (Medium)
 * - 678 Valid Parenthesis String (Medium)
 */
import type { Solution, Variation } from "../solutions";

const kv = (o: Record<string, string>) => Object.entries(o).map(([name, value]) => ({ name, value }));

export const variations: Variation[] = [
  {
    id: "running-sum",
    topic: "greedy",
    name: "Running sum, reset when negative",
    change: "Base pattern. Walk once with a running total and ==throw the prefix away the moment it goes negative==: it can only hurt whatever comes next.",
    problems: [53, 134],
  },
  {
    id: "farthest-reach",
    topic: "greedy",
    name: "Farthest reach",
    change: "Instead of a sum, track ==the farthest index you can reach so far==. Jumps and partitions both close when the scan catches up with that boundary.",
    problems: [55, 45, 763],
  },
  {
    id: "smallest-first",
    topic: "greedy",
    name: "Smallest first",
    change: "Sort (or count) first, then ==the smallest remaining value has only one possible role==, so commit it straight away.",
    problems: [846],
  },
  {
    id: "filter-combine",
    topic: "greedy",
    name: "Filter, then combine",
    change: "==Drop every candidate that would overshoot==; whatever is left can be combined freely, so only check what it covers.",
    problems: [1899],
  },
  {
    id: "min-max-range",
    topic: "greedy",
    name: "Track a min/max range",
    change: "A wildcard makes many states possible at once, so keep ==only the lowest and highest possible value== instead of every branch.",
    problems: [678],
  },
];

export const solutions: Solution[] = [
  {
    lc: 53,
    variation: "running-sum",
    question: "Given a list of integers, find the largest total you can get from one contiguous, non-empty stretch of it.",
    intuition: `Extend a running sum from the left. If the sum so far is negative, ==starting fresh at the next number is always better== than carrying the negative prefix. This is Kadane's algorithm: one pass, keep the best sum seen.`,
    algorithm: `1. Set \`best = nums[0]\` and \`cur = 0\`.
2. For each \`n\` in \`nums\`:
   * If ==\`cur < 0\`, reset \`cur = 0\`== (drop the losing prefix).
   * Add \`n\` to \`cur\`.
   * Update \`best = max(best, cur)\`.
3. Return \`best\`.`,
    visual: {
      kind: "array",
      title: "Maximum subarray · [-3, 2, -1, 4, -6, 3]",
      values: [-3, 2, -1, 4, -6, 3],
      frames: [
        { caption: "i=0: cur = −3, best = −3. cur is negative, so it will be dropped.", pointers: [{ name: "i", index: 0 }], range: [0, 0], vars: kv({ cur: "-3", best: "-3" }) },
        { caption: "i=1: cur < 0 → reset to 0, then add 2. best = 2.", pointers: [{ name: "i", index: 1 }], range: [1, 1], done: [0], vars: kv({ cur: "2", best: "2" }) },
        { caption: "i=2: cur = 2 − 1 = 1. Still positive, keep it.", pointers: [{ name: "i", index: 2 }], range: [1, 2], done: [0], vars: kv({ cur: "1", best: "2" }) },
        { caption: "i=3: cur = 1 + 4 = 5 → new best.", pointers: [{ name: "i", index: 3 }], range: [1, 3], done: [0], vars: kv({ cur: "5", best: "5" }) },
        { caption: "i=4: cur = 5 − 6 = −1. best stays 5.", pointers: [{ name: "i", index: 4 }], range: [1, 4], done: [0], vars: kv({ cur: "-1", best: "5" }) },
        { caption: "i=5: cur < 0 → reset, cur = 3. best stays 5 from [2, −1, 4].", pointers: [{ name: "i", index: 5 }], range: [5, 5], highlight: [1, 2, 3], vars: kv({ cur: "3", best: "5", answer: "5" }) },
      ],
    },
    code: `def maxSubArray(nums: list[int]) -> int:
    best = nums[0]
    cur = 0
    for n in nums:
        if cur < 0:
            cur = 0
        cur += n
        best = max(best, cur)
    return best`,
    complexity: "Time O(n) · Space O(1)",
  },
  {
    lc: 55,
    variation: "farthest-reach",
    question: "Each number says the most steps you may jump forward from that spot. Starting at the first index, can you reach the last one?",
    intuition: `Work backwards with a ==\`goal\` index that you still need to reach==, starting at the last index. If index \`i\` can jump to \`goal\` (\`i + nums[i] >= goal\`), then reaching \`i\` is enough, so ==move the goal to \`i\`==. You can win exactly when the goal ends at 0.`,
    algorithm: `1. Set \`goal = len(nums) - 1\`.
2. For \`i\` from \`len(nums) - 2\` down to 0:
   * If ==\`i + nums[i] >= goal\`==, set \`goal = i\`.
3. Return \`goal == 0\`.`,
    visual: {
      kind: "array",
      title: "Jump game · [3, 1, 0, 2, 1]",
      values: [3, 1, 0, 2, 1],
      frames: [
        { caption: "Start with goal = 4, the last index.", pointers: [{ name: "goal", index: 4 }], highlight: [4], vars: kv({ goal: "4" }) },
        { caption: "i=3: 3 + 2 = 5 ≥ 4 → reaching 3 is enough. goal = 3.", pointers: [{ name: "i", index: 3 }, { name: "goal", index: 3 }], highlight: [3], done: [4], vars: kv({ goal: "3" }) },
        { caption: "i=2: 2 + 0 = 2 < 3 → this 0 can't reach the goal. Skip.", pointers: [{ name: "i", index: 2 }, { name: "goal", index: 3 }], highlight: [2], done: [3, 4], vars: kv({ goal: "3" }) },
        { caption: "i=1: 1 + 1 = 2 < 3 → skip.", pointers: [{ name: "i", index: 1 }, { name: "goal", index: 3 }], highlight: [1], done: [3, 4], vars: kv({ goal: "3" }) },
        { caption: "i=0: 0 + 3 = 3 ≥ 3 → goal = 0. Start reaches the end.", pointers: [{ name: "i", index: 0 }, { name: "goal", index: 0 }], highlight: [0], done: [3, 4], vars: kv({ goal: "0", answer: "True" }) },
      ],
    },
    code: `def canJump(nums: list[int]) -> bool:
    goal = len(nums) - 1
    for i in range(len(nums) - 2, -1, -1):
        if i + nums[i] >= goal:
            goal = i
    return goal == 0`,
    complexity: "Time O(n) · Space O(1)",
  },
  {
    lc: 45,
    variation: "farthest-reach",
    question: "Same jumping rules, and the end is always reachable: return the fewest jumps needed to get from the first index to the last.",
    intuition: `Think in BFS levels without a queue. The window \`[l, r]\` holds every index reachable with the current number of jumps. ==The farthest any of them can jump becomes the next window's right edge==, and each new window costs exactly one jump.`,
    algorithm: `1. Set \`jumps = 0\`, \`l = r = 0\`.
2. While \`r < len(nums) - 1\`:
   * ==\`farthest = max(i + nums[i])\` for \`i\` in \`[l, r]\`==.
   * Move the window: \`l = r + 1\`, \`r = farthest\`.
   * Add 1 to \`jumps\`.
3. Return \`jumps\`.`,
    visual: {
      kind: "array",
      title: "Jump game II · [2, 1, 3, 1, 1, 2]",
      values: [2, 1, 3, 1, 1, 2],
      frames: [
        { caption: "0 jumps: window is just index 0. Farthest = 0 + 2 = 2.", pointers: [{ name: "l", index: 0 }, { name: "r", index: 0 }], range: [0, 0], vars: kv({ jumps: "0", farthest: "2" }) },
        { caption: "1 jump: window [1, 2]. Farthest = max(1+1, 2+3) = 5.", pointers: [{ name: "l", index: 1 }, { name: "r", index: 2 }], range: [1, 2], done: [0], vars: kv({ jumps: "1", farthest: "5" }) },
        { caption: "2 jumps: window [3, 5] contains the last index → stop.", pointers: [{ name: "l", index: 3 }, { name: "r", index: 5 }], range: [3, 5], done: [0, 1, 2], vars: kv({ jumps: "2", answer: "2" }) },
      ],
    },
    code: `def jump(nums: list[int]) -> int:
    jumps = 0
    l = r = 0
    while r < len(nums) - 1:
        farthest = 0
        for i in range(l, r + 1):
            farthest = max(farthest, i + nums[i])
        l, r = r + 1, farthest
        jumps += 1
    return jumps`,
    complexity: "Time O(n) · Space O(1)",
  },
  {
    lc: 134,
    variation: "running-sum",
    question: "Stations on a loop give fuel and cost fuel to reach the next one. Return the station you can start from to go all the way round, or -1.",
    intuition: `If ==total fuel < total cost==, no start works. Otherwise one does, and it's unique. Run a tank from a candidate start; ==if the tank goes negative at \`i\`, no station from the start to \`i\` can work==, so the next candidate is \`i + 1\`.`,
    algorithm: `1. If \`sum(gas) < sum(cost)\`, return -1.
2. Set \`tank = 0\`, \`start = 0\`.
3. For each \`i\`:
   * Add \`gas[i] - cost[i]\` to \`tank\`.
   * If ==\`tank < 0\`==, reset \`tank = 0\` and set \`start = i + 1\`.
4. Return \`start\`.`,
    visual: {
      kind: "array",
      title: "Gas station · gas − cost per station",
      values: [-1, -2, 1, 3, 0],
      frames: [
        { caption: "gas [3,1,2,5,4], cost [4,3,1,2,4] → net shown. Total = 1 ≥ 0, so a start exists.", vars: kv({ total: "1" }) },
        { caption: "i=0: tank = −1 < 0 → nothing up to 0 works. start = 1.", pointers: [{ name: "i", index: 0 }], highlight: [0], vars: kv({ tank: "0", start: "1" }) },
        { caption: "i=1: tank = −2 < 0 → start = 2.", pointers: [{ name: "i", index: 1 }], highlight: [1], done: [0], vars: kv({ tank: "0", start: "2" }) },
        { caption: "i=2: tank = 1. Keep going.", pointers: [{ name: "i", index: 2 }, { name: "start", index: 2 }], range: [2, 2], done: [0, 1], vars: kv({ tank: "1", start: "2" }) },
        { caption: "i=3, 4: tank = 4, then 4. Never negative → answer 2.", pointers: [{ name: "start", index: 2 }], range: [2, 4], done: [0, 1], vars: kv({ tank: "4", answer: "2" }) },
      ],
    },
    code: `def canCompleteCircuit(gas: list[int], cost: list[int]) -> int:
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
    complexity: "Time O(n) · Space O(1)",
  },
  {
    lc: 846,
    variation: "smallest-first",
    question: "Can a hand of cards be split into groups of a given size where each group is a run of consecutive values?",
    intuition: `==The smallest card left must start a group==: nothing smaller exists to come before it. So take its count \`c\`, and the next \`groupSize - 1\` values must each have at least \`c\` copies. Subtract and move to the next smallest value.`,
    algorithm: `1. If \`len(hand) % groupSize != 0\`, return \`False\`.
2. Count every card: \`count = Counter(hand)\`.
3. For each value \`n\` in ==sorted order==:
   * Let \`c = count[n]\`. If \`c == 0\`, skip it.
   * For \`x\` from \`n\` to \`n + groupSize - 1\`:
      * If ==\`count[x] < c\`==, return \`False\`.
      * Subtract \`c\` from \`count[x]\`.
4. Return \`True\`.`,
    visual: {
      kind: "array",
      title: "Hand of straights · groups of 3 (sorted hand)",
      values: [1, 2, 2, 3, 3, 4, 4, 5, 6],
      frames: [
        { caption: "Counts first. Smallest value is 1 → it must start a group.", vars: kv({ count: "1:1 2:2 3:2 4:2 5:1 6:1" }) },
        { caption: "1 has 1 copy → need one 1, 2, 3. All there, subtract.", pointers: [{ name: "n", index: 0 }], highlight: [0, 1, 3], vars: kv({ count: "2:1 3:1 4:2 5:1 6:1" }) },
        { caption: "Next smallest left is 2 (1 copy) → take 2, 3, 4.", pointers: [{ name: "n", index: 2 }], highlight: [2, 4, 5], done: [0, 1, 3], vars: kv({ count: "4:1 5:1 6:1" }) },
        { caption: "3 is now 0 → skip. 4 (1 copy) → take 4, 5, 6.", pointers: [{ name: "n", index: 6 }], highlight: [6, 7, 8], done: [0, 1, 2, 3, 4, 5], vars: kv({ count: "all 0" }) },
        { caption: "Every card used in a run → True.", done: [0, 1, 2, 3, 4, 5, 6, 7, 8], vars: kv({ answer: "True" }) },
      ],
    },
    code: `from collections import Counter

def isNStraightHand(hand: list[int], groupSize: int) -> bool:
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
    complexity: "Time O(n log n) · Space O(n)",
  },
  {
    lc: 1899,
    variation: "filter-combine",
    question: "Merging two triplets keeps the larger value in each slot. Can some merges of the given triplets produce exactly the target?",
    intuition: `Merging only takes maxes, so ==any triplet with a slot bigger than the target is poison== and must never be used. Every other triplet is safe to merge in. So just ask: ==do the safe triplets hit each target slot at least once==?`,
    algorithm: `1. Create an empty set \`good\` (slots matched so far).
2. For each triplet \`t\`:
   * If any \`t[i] > target[i]\`, ==skip it==.
   * Otherwise, for each slot \`i\` where \`t[i] == target[i]\`, add \`i\` to \`good\`.
3. Return \`len(good) == 3\`.`,
    visual: {
      kind: "array",
      title: "Merge triplets · target (3, 4, 5)",
      values: ["3,1,2", "1,6,4", "2,4,5"],
      frames: [
        { caption: "(3,1,2): every slot ≤ target → safe. Slot 0 matches 3.", pointers: [{ name: "t", index: 0 }], highlight: [0], vars: kv({ good: "{0}" }) },
        { caption: "(1,6,4): 6 > 4 would ruin slot 1 → skip it.", pointers: [{ name: "t", index: 1 }], highlight: [1], done: [0], vars: kv({ good: "{0}" }) },
        { caption: "(2,4,5): safe. Slots 1 and 2 match → good = {0, 1, 2} → True.", pointers: [{ name: "t", index: 2 }], highlight: [0, 2], vars: kv({ good: "{0, 1, 2}", answer: "True" }) },
      ],
    },
    code: `def mergeTriplets(triplets: list[list[int]], target: list[int]) -> bool:
    good = set()
    for t in triplets:
        if t[0] > target[0] or t[1] > target[1] or t[2] > target[2]:
            continue
        for i, v in enumerate(t):
            if v == target[i]:
                good.add(i)
    return len(good) == 3`,
    complexity: "Time O(n) · Space O(1)",
  },
  {
    lc: 763,
    variation: "farthest-reach",
    question: "Cut a string into as many pieces as possible so each letter lives in only one piece; return the piece sizes.",
    intuition: `Record ==the last index of every letter==. While scanning, a piece must stretch to the last occurrence of every letter inside it, so keep \`end = max(end, last[c])\`. ==When \`i\` reaches \`end\`==, nothing in the piece appears later: cut there.`,
    algorithm: `1. Build \`last = {c: i}\` for every character (later indexes overwrite earlier ones).
2. Set \`size = 0\`, \`end = 0\`, \`res = []\`.
3. For each index \`i\` and character \`c\`:
   * Add 1 to \`size\`.
   * \`end = max(end, last[c])\`.
   * If ==\`i == end\`==, append \`size\` to \`res\` and reset \`size = 0\`.
4. Return \`res\`.`,
    visual: {
      kind: "array",
      title: "Partition labels · \"abacdcdee\"",
      values: ["a", "b", "a", "c", "d", "c", "d", "e", "e"],
      frames: [
        { caption: "Last index: a→2, b→1, c→5, d→6, e→8.", vars: kv({ last: "a:2 b:1 c:5 d:6 e:8" }) },
        { caption: "i=0 'a': end = 2. i=1 'b': end stays 2.", pointers: [{ name: "i", index: 1 }, { name: "end", index: 2 }], range: [0, 1], vars: kv({ end: "2", size: "2" }) },
        { caption: "i=2 'a': i == end → cut a piece of size 3.", pointers: [{ name: "i", index: 2 }, { name: "end", index: 2 }], range: [0, 2], vars: kv({ res: "[3]" }) },
        { caption: "i=3 'c': end = 5. i=4 'd': end = 6.", pointers: [{ name: "i", index: 4 }, { name: "end", index: 6 }], range: [3, 4], done: [0, 1, 2], vars: kv({ end: "6", res: "[3]" }) },
        { caption: "i=6 'd': i == end → cut size 4.", pointers: [{ name: "i", index: 6 }, { name: "end", index: 6 }], range: [3, 6], done: [0, 1, 2], vars: kv({ res: "[3, 4]" }) },
        { caption: "i=7, 8 'e': end = 8, cut size 2 at i=8.", pointers: [{ name: "i", index: 8 }, { name: "end", index: 8 }], range: [7, 8], done: [0, 1, 2, 3, 4, 5, 6], vars: kv({ answer: "[3, 4, 2]" }) },
      ],
    },
    code: `def partitionLabels(s: str) -> list[int]:
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
    complexity: "Time O(n) · Space O(1) (at most 26 letters)",
  },
  {
    lc: 678,
    variation: "min-max-range",
    question: "A string has '(', ')' and '*', where '*' may act as either bracket or nothing. Can it be a balanced bracket string?",
    intuition: `Each \`*\` branches into three choices, but you only need ==the range of possible open counts \`[lo, hi]\`==. \`(\` raises both, \`)\` lowers both, \`*\` widens the range. If \`hi < 0\` there are too many \`)\`. ==Clamp \`lo\` at 0== (never below zero opens). Balanced iff \`lo == 0\` at the end.`,
    algorithm: `1. Set \`lo = hi = 0\`.
2. For each \`c\`:
   * \`(\` → \`lo += 1\`, \`hi += 1\`.
   * \`)\` → \`lo -= 1\`, \`hi -= 1\`.
   * \`*\` → \`lo -= 1\`, \`hi += 1\`.
   * If ==\`hi < 0\`==, return \`False\`.
   * ==\`lo = max(lo, 0)\`==.
3. Return \`lo == 0\`.`,
    visual: {
      kind: "array",
      title: "Valid parenthesis string · \"((*)\"",
      values: ["(", "(", "*", ")"],
      frames: [
        { caption: "'(' → one open for sure.", pointers: [{ name: "i", index: 0 }], highlight: [0], vars: kv({ lo: "1", hi: "1" }) },
        { caption: "'(' → two opens.", pointers: [{ name: "i", index: 1 }], highlight: [1], done: [0], vars: kv({ lo: "2", hi: "2" }) },
        { caption: "'*' could be ')', nothing or '(' → range [1, 3].", pointers: [{ name: "i", index: 2 }], highlight: [2], done: [0, 1], vars: kv({ lo: "1", hi: "3" }) },
        { caption: "')' → range [0, 2]. hi never went below 0.", pointers: [{ name: "i", index: 3 }], highlight: [3], done: [0, 1, 2], vars: kv({ lo: "0", hi: "2" }) },
        { caption: "lo == 0 → some choice of '*' (here ')') balances it. True.", done: [0, 1, 2, 3], vars: kv({ answer: "True" }) },
      ],
    },
    code: `def checkValidString(s: str) -> bool:
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
    complexity: "Time O(n) · Space O(1)",
  },
];

/** Recognise-it cues for the Roadmap flashcards. */