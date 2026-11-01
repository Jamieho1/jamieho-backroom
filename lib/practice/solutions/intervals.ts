/**
 * intervals: NeetCode 150 problems, written in Jamie's format (see arrays-hashing.ts).
 * Problems:
 * - 57 Insert Interval (Medium)
 * - 56 Merge Intervals (Medium)
 * - 435 Non-overlapping Intervals (Medium)
 * - 252 Meeting Rooms (Easy)
 * - 253 Meeting Rooms II (Medium)
 * - 1851 Minimum Interval to Include Each Query (Hard)
 */
import type { Solution, Variation } from "../solutions";

const kv = (o: Record<string, string>) => Object.entries(o).map(([name, value]) => ({ name, value }));

export const variations: Variation[] = [
  {
    id: "sort-merge",
    topic: "intervals",
    name: "Sort by start, compare neighbours",
    change: "Base pattern. Once intervals are ==sorted by start==, two of them overlap only if ==the next start is before the current end==. Merge them, or report the clash.",
    problems: [57, 56, 252],
  },
  {
    id: "greedy-end",
    topic: "intervals",
    name: "Greedy: keep the earliest end",
    change: "Choose which intervals to keep: ==sort by end== and always keep the one that finishes first, since it leaves the most room for the rest.",
    problems: [435],
  },
  {
    id: "sweep-count",
    topic: "intervals",
    name: "Sweep: count what's active",
    change: "Ask how many overlap at once: ==split into sorted starts and sorted ends== and walk both, +1 on a start, −1 on an end.",
    problems: [253],
  },
  {
    id: "heap-queries",
    topic: "intervals",
    name: "Sorted queries + heap",
    change: "Answer many point queries offline: ==sort the queries==, add intervals that have started into a min-heap, and ==pop ones that have already ended==.",
    problems: [1851],
  },
];

export const solutions: Solution[] = [
  {
    lc: 57,
    variation: "sort-merge",
    question: "Given sorted, non-overlapping intervals and one new interval, insert it and merge wherever needed so the result is still sorted and non-overlapping.",
    intuition: `The list is already sorted, so walk it once. Intervals that ==end before the new one starts== go straight to the output. Intervals that overlap get ==absorbed into the new one== (min of starts, max of ends). The first interval that starts after the new one ends means you can place the new one and copy the rest.`,
    algorithm: `1. Create \`res = []\`.
2. For each \`i\`, \`(s, e)\` in \`intervals\`:
   * If \`new_end < s\`: append \`newInterval\`, ==return \`res + intervals[i:]\`==.
   * Else if \`new_start > e\`: append \`[s, e]\` (fully before).
   * Else ==merge==: \`newInterval = [min(new_start, s), max(new_end, e)]\`.
3. Append \`newInterval\` (it reached the end) and return \`res\`.`,
    visual: {
      kind: "array",
      title: "Insert interval · new [4, 8]",
      values: ["[1,2]", "[3,5]", "[6,7]", "[9,10]"],
      frames: [
        { caption: "[1,2] ends before 4 → copy it.", pointers: [{ name: "i", index: 0 }], highlight: [0], vars: kv({ new: "[4,8]", res: "[[1,2]]" }) },
        { caption: "[3,5] overlaps [4,8] → absorb: new becomes [3,8].", pointers: [{ name: "i", index: 1 }], highlight: [1], done: [0], vars: kv({ new: "[3,8]", res: "[[1,2]]" }) },
        { caption: "[6,7] sits inside [3,8] → absorb, still [3,8].", pointers: [{ name: "i", index: 2 }], highlight: [2], done: [0, 1], vars: kv({ new: "[3,8]", res: "[[1,2]]" }) },
        { caption: "[9,10] starts after 8 → place [3,8], then copy the rest.", pointers: [{ name: "i", index: 3 }], highlight: [3], done: [0, 1, 2], vars: kv({ answer: "[[1,2], [3,8], [9,10]]" }) },
      ],
    },
    code: `def insert(intervals: list[list[int]], newInterval: list[int]) -> list[list[int]]:
    res = []
    for i, (s, e) in enumerate(intervals):
        if newInterval[1] < s:
            res.append(newInterval)
            return res + intervals[i:]
        elif newInterval[0] > e:
            res.append([s, e])
        else:
            newInterval = [min(newInterval[0], s), max(newInterval[1], e)]
    res.append(newInterval)
    return res`,
    complexity: "Time O(n) · Space O(n) for the output",
  },
  {
    lc: 56,
    variation: "sort-merge",
    question: "Given a list of intervals in any order, combine every group that overlaps and return the resulting intervals.",
    intuition: `==Sort by start==. Now an interval overlaps the last merged one exactly when ==its start ≤ that one's end==. If so, stretch the last end to \`max(end, e)\`; otherwise it begins a new merged interval.`,
    algorithm: `1. Sort \`intervals\` by start.
2. Start \`res\` with the first interval.
3. For each \`(s, e)\` after it:
   * If ==\`s <= res[-1][1]\`==, set \`res[-1][1] = max(res[-1][1], e)\`.
   * Otherwise append \`[s, e]\`.
4. Return \`res\`.`,
    visual: {
      kind: "array",
      title: "Merge intervals · [7,9] [1,4] [8,8] [2,5]",
      values: ["[7,9]", "[1,4]", "[8,8]", "[2,5]"],
      frames: [
        { caption: "Sort by start.", values: ["[1,4]", "[2,5]", "[7,9]", "[8,8]"], vars: kv({ res: "[]" }) },
        { caption: "Take [1,4] as the first merged interval.", pointers: [{ name: "i", index: 0 }], highlight: [0], vars: kv({ res: "[[1,4]]" }) },
        { caption: "[2,5]: 2 ≤ 4 → overlap. Stretch the end to 5.", pointers: [{ name: "i", index: 1 }], highlight: [0, 1], vars: kv({ res: "[[1,5]]" }) },
        { caption: "[7,9]: 7 > 5 → no overlap. Start a new one.", pointers: [{ name: "i", index: 2 }], highlight: [2], done: [0, 1], vars: kv({ res: "[[1,5], [7,9]]" }) },
        { caption: "[8,8]: 8 ≤ 9 → overlap, max(9, 8) keeps 9.", pointers: [{ name: "i", index: 3 }], highlight: [2, 3], done: [0, 1], vars: kv({ answer: "[[1,5], [7,9]]" }) },
      ],
    },
    code: `def merge(intervals: list[list[int]]) -> list[list[int]]:
    intervals.sort(key=lambda x: x[0])
    res = [intervals[0][:]]
    for s, e in intervals[1:]:
        if s <= res[-1][1]:
            res[-1][1] = max(res[-1][1], e)
        else:
            res.append([s, e])
    return res`,
    complexity: "Time O(n log n) · Space O(n)",
  },
  {
    lc: 435,
    variation: "greedy-end",
    question: "Given a list of intervals, return the fewest you must delete so the remaining ones don't overlap (touching ends are fine).",
    intuition: `Flip it: ==keep as many as possible==. Sort by end. The interval that ==finishes first== is always safe to keep, because it leaves the most room for everything after. Walk the list; anything starting before the last kept end overlaps it, so delete it.`,
    algorithm: `1. Sort \`intervals\` by end.
2. Set \`prev_end = -inf\`, \`removed = 0\`.
3. For each \`(s, e)\`:
   * If ==\`s >= prev_end\`==, keep it: \`prev_end = e\`.
   * Otherwise ==delete it==: \`removed += 1\`.
4. Return \`removed\`.`,
    visual: {
      kind: "array",
      title: "Non-overlapping intervals · sorted by end",
      values: ["[1,2]", "[1,3]", "[2,4]", "[3,5]"],
      frames: [
        { caption: "[1,2] ends first → keep. prev_end = 2.", pointers: [{ name: "i", index: 0 }], highlight: [0], vars: kv({ prev_end: "2", removed: "0" }) },
        { caption: "[1,3] starts at 1 < 2 → overlaps → delete.", pointers: [{ name: "i", index: 1 }], highlight: [1], done: [0], vars: kv({ prev_end: "2", removed: "1" }) },
        { caption: "[2,4] starts at 2 ≥ 2 (touching is fine) → keep. prev_end = 4.", pointers: [{ name: "i", index: 2 }], highlight: [2], done: [0], vars: kv({ prev_end: "4", removed: "1" }) },
        { caption: "[3,5] starts at 3 < 4 → delete. Answer 2.", pointers: [{ name: "i", index: 3 }], highlight: [3], done: [0, 2], vars: kv({ prev_end: "4", removed: "2", answer: "2" }) },
      ],
    },
    code: `def eraseOverlapIntervals(intervals: list[list[int]]) -> int:
    intervals.sort(key=lambda x: x[1])
    prev_end = float("-inf")
    removed = 0
    for s, e in intervals:
        if s >= prev_end:
            prev_end = e
        else:
            removed += 1
    return removed`,
    complexity: "Time O(n log n) · Space O(1) besides the sort",
  },
  {
    lc: 252,
    variation: "sort-merge",
    question: "Given meeting time ranges, say whether one person could attend all of them without any two overlapping.",
    intuition: `After ==sorting by start==, only neighbours can clash: if meeting \`i\` doesn't overlap meeting \`i - 1\`, it can't overlap anything earlier either. So check ==each start against the previous end==.`,
    algorithm: `1. Sort \`intervals\` by start.
2. For \`i\` from 1:
   * If ==\`intervals[i][0] < intervals[i - 1][1]\`==, return \`False\`.
3. Return \`True\`.`,
    visual: {
      kind: "array",
      title: "Meeting rooms · [5,8] [0,4] [4,6]",
      values: ["[5,8]", "[0,4]", "[4,6]"],
      frames: [
        { caption: "Sort by start.", values: ["[0,4]", "[4,6]", "[5,8]"], vars: kv({}) },
        { caption: "[4,6] starts at 4, previous ends at 4 → back to back, fine.", values: ["[0,4]", "[4,6]", "[5,8]"], pointers: [{ name: "i", index: 1 }], highlight: [0, 1], vars: kv({ check: "4 < 4? no" }) },
        { caption: "[5,8] starts at 5, previous ends at 6 → clash → False.", values: ["[0,4]", "[4,6]", "[5,8]"], pointers: [{ name: "i", index: 2 }], highlight: [1, 2], done: [0], vars: kv({ check: "5 < 6? yes", answer: "False" }) },
      ],
    },
    code: `def canAttendMeetings(intervals: list[list[int]]) -> bool:
    intervals.sort(key=lambda x: x[0])
    for i in range(1, len(intervals)):
        if intervals[i][0] < intervals[i - 1][1]:
            return False
    return True`,
    complexity: "Time O(n log n) · Space O(1) besides the sort",
  },
  {
    lc: 253,
    variation: "sweep-count",
    question: "Given meeting time ranges, return the fewest rooms needed so every meeting has a room.",
    intuition: `Rooms needed = ==the most meetings running at the same moment==. You don't care which meeting ends, only when, so sort starts and ends separately. Walk them like a merge: ==a start before the next end opens a room==, otherwise a room frees up. Track the peak.`,
    algorithm: `1. \`starts = sorted(starts)\`, \`ends = sorted(ends)\`.
2. Set \`s = e = 0\`, \`count = best = 0\`.
3. While \`s < n\`:
   * If ==\`starts[s] < ends[e]\`==: a meeting begins → \`count += 1\`, \`s += 1\`.
   * Else a meeting has ended → \`count -= 1\`, \`e += 1\`.
   * \`best = max(best, count)\`.
4. Return \`best\`.`,
    visual: {
      kind: "array",
      title: "Meeting rooms II · [1,5] [2,6] [6,8] [3,4]",
      values: ["s1", "s2", "s3", "s6", "e4", "e5", "e6", "e8"],
      frames: [
        { caption: "starts = [1,2,3,6], ends = [4,5,6,8]. 1 < 4 → a meeting begins.", pointers: [{ name: "s", index: 0 }, { name: "e", index: 4 }], highlight: [0], vars: kv({ count: "1", best: "1" }) },
        { caption: "2 < 4 and 3 < 4 → two more begin before anything ends.", pointers: [{ name: "s", index: 2 }, { name: "e", index: 4 }], highlight: [1, 2], done: [0], vars: kv({ count: "3", best: "3" }) },
        { caption: "6 < 4? No → the meeting ending at 4 frees a room.", pointers: [{ name: "s", index: 3 }, { name: "e", index: 4 }], highlight: [4], done: [0, 1, 2], vars: kv({ count: "2", best: "3" }) },
        { caption: "6 < 5? No → free another. 6 < 6? No → end at 6 frees one too (back to back).", pointers: [{ name: "s", index: 3 }, { name: "e", index: 6 }], highlight: [5, 6], done: [0, 1, 2, 4], vars: kv({ count: "0", best: "3" }) },
        { caption: "6 < 8 → the last meeting begins. Peak was 3 rooms.", pointers: [{ name: "s", index: 3 }, { name: "e", index: 7 }], highlight: [3], done: [0, 1, 2, 4, 5, 6], vars: kv({ count: "1", best: "3", answer: "3" }) },
      ],
    },
    code: `def minMeetingRooms(intervals: list[list[int]]) -> int:
    starts = sorted(i[0] for i in intervals)
    ends = sorted(i[1] for i in intervals)
    s = e = count = best = 0
    while s < len(intervals):
        if starts[s] < ends[e]:
            count += 1
            s += 1
        else:
            count -= 1
            e += 1
        best = max(best, count)
    return best`,
    complexity: "Time O(n log n) · Space O(n)",
  },
  {
    lc: 1851,
    variation: "heap-queries",
    question: "Given intervals and query points, for each query return the length of the shortest interval containing it, or -1 if none does.",
    intuition: `Answer the queries ==in sorted order== so the work carries over. Sort intervals by start too. For each query, push every interval that has started into a ==min-heap keyed by length==, then pop from the top any interval that has already ended. The top is the shortest that contains the query.`,
    algorithm: `1. Sort \`intervals\` by start. Set \`i = 0\`, \`heap = []\`, \`ans = {}\`.
2. For each \`q\` in \`sorted(queries)\`:
   * While \`i < n\` and \`intervals[i][0] <= q\`:
      * Push \`(r - l + 1, r)\`, \`i += 1\`.
   * While the heap is not empty and ==\`heap[0][1] < q\`==, pop (that interval ended before \`q\`).
   * \`ans[q] = heap[0][0]\` if the heap is not empty, else \`-1\`.
3. Return \`[ans[q] for q in queries]\` (original order).`,
    visual: {
      kind: "array",
      title: "Minimum interval per query · queries [2, 5, 7]",
      values: ["[1,3]", "[2,6]", "[5,5]"],
      frames: [
        { caption: "q=2: push [1,3] (len 3) and [2,6] (len 5). Top (3, end 3) contains 2.", pointers: [{ name: "i", index: 1 }], highlight: [0, 1], vars: kv({ q: "2", heap: "{(3,3), (5,6)}", ans: "{2: 3}" }) },
        { caption: "q=5: push [5,5] (len 1). Top (1, end 5) still covers 5.", pointers: [{ name: "i", index: 2 }], highlight: [2], done: [0, 1], vars: kv({ q: "5", heap: "{(1,5), (3,3), (5,6)}", ans: "{2: 3, 5: 1}" }) },
        { caption: "q=7: no new intervals. Pop (1,5), (3,3), (5,6): all end before 7.", highlight: [0, 1, 2], vars: kv({ q: "7", heap: "{}", ans: "{2: 3, 5: 1, 7: −1}" }) },
        { caption: "Read the answers back in the original query order.", done: [0, 1, 2], vars: kv({ answer: "[3, 1, -1]" }) },
      ],
    },
    code: `import heapq

def minInterval(intervals: list[list[int]], queries: list[int]) -> list[int]:
    intervals.sort()
    heap, ans, i = [], {}, 0
    for q in sorted(queries):
        while i < len(intervals) and intervals[i][0] <= q:
            l, r = intervals[i]
            heapq.heappush(heap, (r - l + 1, r))
            i += 1
        while heap and heap[0][1] < q:
            heapq.heappop(heap)
        ans[q] = heap[0][0] if heap else -1
    return [ans[q] for q in queries]`,
    complexity: "Time O(n log n + q log q) · Space O(n + q)",
  },
];

/** Recognise-it cues for the Roadmap flashcards. */