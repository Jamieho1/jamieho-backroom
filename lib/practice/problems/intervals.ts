/**
 * Arena problems: intervals. Same problems as LeetCode, our own words, verified tests (see ../types.ts).
 * - 57 Insert Interval (Medium)
 * - 56 Merge Intervals (Medium)
 * - 435 Non-overlapping Intervals (Medium)
 * - 252 Meeting Rooms (Easy)
 * - 253 Meeting Rooms II (Medium)
 * - 1851 Minimum Interval to Include Each Query (Hard)
 */
import type { ArenaProblem } from "../types";

export const arena: ArenaProblem[] = [
  {
    lc: 57,
    kind: "algorithm",
    statement: `You are given a list \`intervals\` of closed intervals \`[start, end]\` that are **sorted by start** and **do not overlap** each other, plus one more interval \`newInterval\`. Add \`newInterval\` to the list and return the result.

- The returned list must still be sorted by start and contain no overlapping intervals: merge \`newInterval\` with every interval it overlaps.
- Intervals that merely touch (one ends exactly where the other starts) count as overlapping and must be merged.
- You may build and return a new list rather than editing the input in place.`,
    examples: [
      { input: "intervals = [[1,3],[6,8],[10,12]], newInterval = [4,5]", output: "[[1, 3], [4, 5], [6, 8], [10, 12]]", explanation: "[4,5] fits in the gap between 3 and 6 without touching anything." },
      { input: "intervals = [[0,2],[4,5],[7,9],[12,15]], newInterval = [3,8]", output: "[[0, 2], [3, 9], [12, 15]]", explanation: "[3,8] overlaps [4,5] and [7,9], so all three become [3,9]." },
    ],
    constraints: ["0 <= intervals.length <= 10^4", "intervals[i].length == 2 and 0 <= start_i <= end_i <= 10^5", "intervals is sorted by start_i and its intervals do not overlap.", "newInterval.length == 2 and 0 <= newInterval[0] <= newInterval[1] <= 10^5"],
    signature: `class Solution:
    def insert(self, intervals: List[List[int]], newInterval: List[int]) -> List[List[int]]:`,
    method: "insert",
    tests: [
      { id: "ex1", input: "[[[1, 3], [6, 8], [10, 12]], [4, 5]]", expected: "[[1, 3], [4, 5], [6, 8], [10, 12]]", visible: true },
      { id: "ex2", input: "[[[0, 2], [4, 5], [7, 9], [12, 15]], [3, 8]]", expected: "[[0, 2], [3, 9], [12, 15]]", visible: true },
      { id: "empty", input: "[[], [2, 6]]", expected: "[[2, 6]]", visible: false },
      { id: "front", input: "[[[5, 7], [9, 10]], [1, 2]]", expected: "[[1, 2], [5, 7], [9, 10]]", visible: false },
      { id: "back", input: "[[[1, 2], [4, 6]], [8, 9]]", expected: "[[1, 2], [4, 6], [8, 9]]", visible: false },
      { id: "touch", input: "[[[1, 3], [5, 7]], [3, 5]]", expected: "[[1, 7]]", visible: false },
      { id: "swallow_all", input: "[[[2, 3], [5, 6], [8, 9]], [0, 20]]", expected: "[[0, 20]]", visible: false },
      { id: "inside", input: "[[[1, 10]], [4, 6]]", expected: "[[1, 10]]", visible: false },
      { id: "point", input: "[[[1, 1], [3, 3]], [2, 2]]", expected: "[[1, 1], [2, 2], [3, 3]]", visible: false },
      { id: "big", input: "[[[i, i + 1] for i in range(0, 30000, 3)], [5, 29990]]", expected: "[[0, 1], [3, 4], [5, 29990], [29991, 29992], [29994, 29995], [29997, 29998]]", visible: false },
    ],
    solution: `class Solution:
    def insert(self, intervals: List[List[int]], newInterval: List[int]) -> List[List[int]]:
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
    hints: ["Walk the sorted list once. Intervals that end before newInterval starts can be copied straight across.", "While an interval overlaps newInterval, widen newInterval to cover both instead of copying it.", "As soon as an interval starts after newInterval ends, emit newInterval and then everything that remains."],
    clarify: [
      { question: "Do touching intervals like [1,3] and [3,5] merge?", answer: "Yes, they share the point 3, so they become [1,5]." },
      { question: "Can intervals be empty?", answer: "Yes; then the answer is just [newInterval]." },
      { question: "Must the output be sorted?", answer: "Yes, by start, with no overlaps." },
    ],
  },
  {
    lc: 56,
    kind: "algorithm",
    statement: `You are given a list of closed intervals \`intervals\`, where \`intervals[i] = [start_i, end_i]\`, in **no particular order**. Combine every group of overlapping intervals into one interval that covers the whole group, and return the resulting list of non-overlapping intervals.

- Two intervals overlap if they share at least one point, so \`[1, 4]\` and \`[4, 6]\` merge into \`[1, 6]\`.
- The result must cover exactly the same points as the input.
- The merged intervals may be returned in any order.`,
    examples: [
      { input: "intervals = [[8,10],[1,4],[3,5],[12,13]]", output: "[[1, 5], [8, 10], [12, 13]]", explanation: "[1,4] and [3,5] overlap and become [1,5]; the others stand alone." },
      { input: "intervals = [[2,6],[6,9]]", output: "[[2, 9]]", explanation: "They touch at 6, which counts as overlapping." },
    ],
    constraints: ["1 <= intervals.length <= 10^4", "intervals[i].length == 2", "0 <= start_i <= end_i <= 10^4"],
    signature: `class Solution:
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:`,
    method: "merge",
    tests: [
      { id: "ex1", input: "[[[8, 10], [1, 4], [3, 5], [12, 13]]]", expected: "[[1, 5], [8, 10], [12, 13]]", compare: "unordered", visible: true },
      { id: "ex2", input: "[[[2, 6], [6, 9]]]", expected: "[[2, 9]]", compare: "unordered", visible: true },
      { id: "single", input: "[[[5, 5]]]", expected: "[[5, 5]]", compare: "unordered", visible: false },
      { id: "nested", input: "[[[1, 20], [3, 4], [6, 9]]]", expected: "[[1, 20]]", compare: "unordered", visible: false },
      { id: "disjoint", input: "[[[7, 8], [1, 2], [4, 5]]]", expected: "[[1, 2], [4, 5], [7, 8]]", compare: "unordered", visible: false },
      { id: "chain", input: "[[[4, 5], [1, 2], [2, 3], [3, 4]]]", expected: "[[1, 5]]", compare: "unordered", visible: false },
      { id: "dupes", input: "[[[1, 3], [1, 3], [1, 3]]]", expected: "[[1, 3]]", compare: "unordered", visible: false },
      { id: "zero", input: "[[[0, 0], [0, 2], [3, 3]]]", expected: "[[0, 2], [3, 3]]", compare: "unordered", visible: false },
      { id: "big", input: "[[[i, i + 2] for i in range(9998, -1, -2)] + [[20000, 20001]] + [[i, i] for i in range(1, 10000, 4)]]", expected: "[[0, 10000], [20000, 20001]]", compare: "unordered", visible: false },
    ],
    solution: `class Solution:
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:
        intervals.sort(key=lambda x: x[0])
        res = [intervals[0][:]]
        for s, e in intervals[1:]:
            if s <= res[-1][1]:
                res[-1][1] = max(res[-1][1], e)
            else:
                res.append([s, e])
        return res`,
    hints: ["Sort the intervals by start; overlapping ones then end up next to each other.", "Keep the last merged interval. If the next one starts at or before its end, extend that end.", "Use max when extending: an interval nested inside another must not shrink it."],
    clarify: [
      { question: "Is the input sorted?", answer: "No, intervals can come in any order." },
      { question: "Do [1,4] and [4,6] merge?", answer: "Yes, sharing an endpoint counts as overlapping." },
      { question: "Does the output order matter?", answer: "No, any order is accepted." },
    ],
  },
  {
    lc: 435,
    kind: "algorithm",
    statement: `You are given a list of intervals \`intervals\`, where \`intervals[i] = [start_i, end_i]\` with \`start_i < end_i\`. Return the **smallest number of intervals you must delete** so that none of the remaining intervals overlap.

- Intervals that only touch at an endpoint, like \`[1, 3]\` and \`[3, 5]\`, do **not** overlap.
- Only the count matters, not which intervals you remove.`,
    examples: [
      { input: "intervals = [[1,4],[2,3],[3,6],[5,7]]", output: "2", explanation: "Delete [1,4] and [3,6]; [2,3] and [5,7] remain and do not overlap." },
      { input: "intervals = [[0,5],[5,9]]", output: "0", explanation: "They only touch at 5, so nothing has to go." },
    ],
    constraints: ["1 <= intervals.length <= 10^5", "intervals[i].length == 2", "-5 * 10^4 <= start_i < end_i <= 5 * 10^4"],
    signature: `class Solution:
    def eraseOverlapIntervals(self, intervals: List[List[int]]) -> int:`,
    method: "eraseOverlapIntervals",
    tests: [
      { id: "ex1", input: "[[[1, 4], [2, 3], [3, 6], [5, 7]]]", expected: "2", visible: true },
      { id: "ex2", input: "[[[0, 5], [5, 9]]]", expected: "0", visible: true },
      { id: "single", input: "[[[3, 4]]]", expected: "0", visible: false },
      { id: "same", input: "[[[1, 2], [1, 2], [1, 2], [1, 2]]]", expected: "3", visible: false },
      { id: "long_one", input: "[[[0, 100], [1, 2], [3, 4], [5, 6]]]", expected: "1", visible: false },
      { id: "neg", input: "[[[-10, -5], [-7, -1], [-1, 3], [-6, 0]]]", expected: "2", visible: false },
      { id: "disjoint", input: "[[[7, 9], [1, 2], [4, 6]]]", expected: "0", visible: false },
      { id: "chain", input: "[[[1, 3], [2, 4], [3, 5], [4, 6]]]", expected: "2", visible: false },
      { id: "big", input: "[[[i, i + 3] for i in range(0, 30000)]]", expected: "20000", visible: false },
    ],
    solution: `class Solution:
    def eraseOverlapIntervals(self, intervals: List[List[int]]) -> int:
        intervals.sort(key=lambda x: x[1])
        prev_end = float("-inf")
        removed = 0
        for s, e in intervals:
            if s >= prev_end:
                prev_end = e
            else:
                removed += 1
        return removed`,
    hints: ["Flip the question: keep as many non-overlapping intervals as possible; the answer is n minus that number.", "Greedy choice: among the intervals still compatible, keep the one that ends earliest, since it leaves the most room.", "Sort by end, track the end of the last kept interval, and count every interval that starts before it."],
    clarify: [
      { question: "Do [1,3] and [3,5] overlap?", answer: "No, touching endpoints are allowed." },
      { question: "Do I return the removed intervals?", answer: "No, just how many must be removed." },
      { question: "Can intervals have zero length?", answer: "No, start is always strictly less than end." },
    ],
  },
  {
    lc: 252,
    kind: "algorithm",
    statement: `You are given a list of meeting times \`intervals\`, where \`intervals[i] = [start_i, end_i]\` and each meeting runs from \`start_i\` up to \`end_i\`. Return \`True\` if one person could attend **every** meeting, i.e. no two meetings overlap; otherwise return \`False\`.

- A meeting that starts exactly when another ends does **not** conflict with it (\`[1, 5]\` and \`[5, 8]\` are fine).
- The meetings are given in no particular order. An empty list means there is nothing to attend, so the answer is \`True\`.

*(This is LeetCode 252, a premium problem; here the meetings are plain \`[start, end]\` lists.)*`,
    examples: [
      { input: "intervals = [[9,12],[2,5],[5,9]]", output: "True", explanation: "Sorted they run 2-5, 5-9, 9-12; each starts as the previous ends." },
      { input: "intervals = [[1,10],[4,6]]", output: "False", explanation: "The second meeting happens during the first." },
    ],
    constraints: ["0 <= intervals.length <= 10^4", "intervals[i].length == 2", "0 <= start_i < end_i <= 10^6"],
    signature: `class Solution:
    def canAttendMeetings(self, intervals: List[List[int]]) -> bool:`,
    method: "canAttendMeetings",
    tests: [
      { id: "ex1", input: "[[[9, 12], [2, 5], [5, 9]]]", expected: "True", visible: true },
      { id: "ex2", input: "[[[1, 10], [4, 6]]]", expected: "False", visible: true },
      { id: "empty", input: "[[]]", expected: "True", visible: false },
      { id: "single", input: "[[[3, 7]]]", expected: "True", visible: false },
      { id: "same_start", input: "[[[2, 4], [2, 3]]]", expected: "False", visible: false },
      { id: "late_clash", input: "[[[1, 2], [3, 4], [5, 7], [6, 8]]]", expected: "False", visible: false },
      { id: "unsorted_ok", input: "[[[20, 30], [0, 10], [10, 20]]]", expected: "True", visible: false },
      { id: "big_ok", input: "[[[i, i + 2] for i in range(10000, 0, -2)]]", expected: "True", visible: false },
      { id: "big_clash", input: "[[[i, i + 2] for i in range(0, 20000, 2)] + [[9999, 10000]]]", expected: "False", visible: false },
    ],
    solution: `class Solution:
    def canAttendMeetings(self, intervals: List[List[int]]) -> bool:
        intervals.sort(key=lambda x: x[0])
        for i in range(1, len(intervals)):
            if intervals[i][0] < intervals[i - 1][1]:
                return False
        return True`,
    hints: ["If the meetings were sorted by start time, where could a conflict show up?", "After sorting, only neighbouring meetings need to be compared: a clash exists exactly when a meeting starts before the previous one ends."],
    clarify: [
      { question: "Do [1,5] and [5,8] conflict?", answer: "No, one ends exactly when the other begins." },
      { question: "What if there are no meetings?", answer: "Return True." },
      { question: "Are the meetings sorted?", answer: "No, they can be in any order." },
    ],
  },
  {
    lc: 253,
    kind: "algorithm",
    statement: `You are given a list of meeting times \`intervals\`, where \`intervals[i] = [start_i, end_i]\`. Every meeting needs a room for the whole span from \`start_i\` to \`end_i\`. Return the **minimum number of rooms** needed so that all meetings can take place.

- A room freed at time \`t\` can be reused by a meeting starting at time \`t\`: \`[1, 5]\` and \`[5, 8]\` can share one room.
- The meetings are given in no particular order. With no meetings, 0 rooms are needed.

*(This is LeetCode 253, a premium problem; here the meetings are plain \`[start, end]\` lists.)*`,
    examples: [
      { input: "intervals = [[1,6],[2,4],[5,9],[7,8]]", output: "2", explanation: "At time 2, [1,6] and [2,4] run together; at 7, [5,9] and [7,8] do. Never three at once." },
      { input: "intervals = [[4,8],[8,12]]", output: "1", explanation: "The second meeting reuses the room the first one frees at 8." },
    ],
    constraints: ["0 <= intervals.length <= 10^4", "intervals[i].length == 2", "0 <= start_i < end_i <= 10^6"],
    signature: `class Solution:
    def minMeetingRooms(self, intervals: List[List[int]]) -> int:`,
    method: "minMeetingRooms",
    tests: [
      { id: "ex1", input: "[[[1, 6], [2, 4], [5, 9], [7, 8]]]", expected: "2", visible: true },
      { id: "ex2", input: "[[[4, 8], [8, 12]]]", expected: "1", visible: true },
      { id: "empty", input: "[[]]", expected: "0", visible: false },
      { id: "single", input: "[[[0, 1]]]", expected: "1", visible: false },
      { id: "all_same", input: "[[[3, 9], [3, 9], [3, 9]]]", expected: "3", visible: false },
      { id: "nested", input: "[[[1, 100], [2, 50], [3, 25], [4, 10]]]", expected: "4", visible: false },
      { id: "staircase", input: "[[[0, 3], [1, 4], [2, 5], [3, 6], [4, 7]]]", expected: "3", visible: false },
      { id: "disjoint", input: "[[[10, 11], [0, 1], [5, 6]]]", expected: "1", visible: false },
      { id: "big", input: "[[[i, i + 50] for i in range(10000)]]", expected: "50", visible: false },
    ],
    solution: `class Solution:
    def minMeetingRooms(self, intervals: List[List[int]]) -> int:
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
    hints: ["The answer is the largest number of meetings running at the same moment.", "Sort the start times and the end times separately and sweep through both like a merge.", "When the next start is before the next end, one more room is in use; otherwise a room frees up first (an end at time t frees the room before a start at t)."],
    clarify: [
      { question: "Can a meeting reuse a room freed at the same minute it starts?", answer: "Yes, [1,5] and [5,8] need only one room." },
      { question: "What should an empty list return?", answer: "0." },
      { question: "Do I need to say which meeting goes in which room?", answer: "No, only the number of rooms." },
    ],
  },
  {
    lc: 1851,
    kind: "algorithm",
    statement: `You are given a list of closed intervals \`intervals\`, where \`intervals[i] = [left_i, right_i]\`, and a list of integers \`queries\`. The **size** of an interval is the number of integers it contains: \`right_i - left_i + 1\`.

For each query value \`q\`, find the **smallest-size interval that contains \`q\`** (that is, \`left_i <= q <= right_i\`) and report its size. If no interval contains \`q\`, report \`-1\`.

Return a list \`answer\` where \`answer[j]\` is the result for \`queries[j]\`, in the same order as \`queries\`.`,
    examples: [
      { input: "intervals = [[2,7],[4,5],[6,6],[9,12]], queries = [5,6,8,10]", output: "[2, 1, -1, 4]", explanation: "5 is in [4,5] (size 2); 6 is in [6,6] (size 1); nothing covers 8; 10 is only in [9,12] (size 4)." },
      { input: "intervals = [[1,100]], queries = [100,101,1]", output: "[100, -1, 100]" },
    ],
    constraints: ["1 <= intervals.length <= 10^5", "1 <= queries.length <= 10^5", "intervals[i].length == 2", "1 <= left_i <= right_i <= 10^7", "1 <= queries[j] <= 10^7"],
    signature: `class Solution:
    def minInterval(self, intervals: List[List[int]], queries: List[int]) -> List[int]:`,
    method: "minInterval",
    tests: [
      { id: "ex1", input: "[[[2, 7], [4, 5], [6, 6], [9, 12]], [5, 6, 8, 10]]", expected: "[2, 1, -1, 4]", visible: true },
      { id: "ex2", input: "[[[1, 100]], [100, 101, 1]]", expected: "[100, -1, 100]", visible: true },
      { id: "dup_queries", input: "[[[3, 5], [1, 9]], [4, 4, 9, 2]]", expected: "[3, 3, 9, 9]", visible: false },
      { id: "tie", input: "[[[1, 3], [2, 4], [3, 5]], [3]]", expected: "[3]", visible: false },
      { id: "none", input: "[[[5, 6]], [1, 2, 7, 8]]", expected: "[-1, -1, -1, -1]", visible: false },
      { id: "points", input: "[[[1, 1], [2, 2], [1, 10]], [1, 2, 3]]", expected: "[1, 1, 10]", visible: false },
      { id: "unsorted", input: "[[[10, 20], [1, 4], [15, 16], [3, 30]], [16, 2, 25, 31]]", expected: "[2, 4, 28, -1]", visible: false },
      { id: "nested", input: "[[[1, 1000], [100, 900], [200, 800], [300, 700]], [50, 150, 250, 350, 750, 850, 950]]", expected: "[1000, 801, 601, 401, 601, 801, 1000]", visible: false },
      { id: "big", input: "[[[i, i + (i % 7)] for i in range(1, 20000, 3)], list(range(1, 20000, 250))]", expected: "[2, 6, 3, 3, 7, 4, 4, 5, 5, 5, 2, 6, 6, 3, 7, 4, 4, -1, 1, 5, 6, 2, 6, 3, 3, 7, 4, 4, 5, 5, 5, 2, 6, 6, 3, 7, 4, 4, -1, 1, 5, 6, 2, 6, 3, 3, 7, 4, 4, 5, 5, 5, 2, 6, 6, 3, 7, 4, 4, -1, 1, 5, 6, 2, 6, 3, 3, 7, 4, 4, 5, 5, 5, 2, 6, 6, 3, 7, 4, 4]", visible: false },
    ],
    solution: `class Solution:
    def minInterval(self, intervals: List[List[int]], queries: List[int]) -> List[int]:
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
    hints: ["Answer the queries offline: process them in increasing order, then put the answers back in the original order.", "Sort intervals by left end. As the query value grows, push every interval that has started into a min-heap keyed by size.", "Before answering, pop heap entries whose right end is already left of the query; the heap top is then the answer."],
    clarify: [
      { question: "How is size measured?", answer: "Number of integers covered: right - left + 1, so [6,6] has size 1." },
      { question: "Can queries repeat or come unsorted?", answer: "Yes; the answer list follows the original query order." },
      { question: "What if no interval covers the query?", answer: "That answer is -1." },
    ],
  },
];
