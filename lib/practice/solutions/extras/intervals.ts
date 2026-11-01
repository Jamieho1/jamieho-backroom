import type { Extras } from "./types";

export const extras: Extras = {
  57: {
    time: { o: "O(n)", why: "The input is already sorted, so ==one pass== copies, absorbs or stops at each interval (n = len(intervals))." },
    space: { o: "O(n)", why: "`res` (and the `intervals[i:]` slice) can hold all n + 1 intervals; no extra beyond the output." },
    pitfalls: [
      "Forgetting the final `res.append(newInterval)`: when the new interval belongs at the end, or the input is empty, it never gets added.",
      "Using `<=` instead of `<` in `newInterval[1] < s`: touching intervals like `[1, 2]` and `[2, 3]` overlap here and must merge.",
      "Mutating `intervals` while looping over it with `insert`/`pop`: indices shift; build a new list instead.",
      "Re-sorting and running full Merge Intervals: correct but O(n log n) when the sorted input allows O(n).",
    ],
  },
  56: {
    time: { o: "O(n log n)", why: "==The sort dominates==; the merge pass after it is a single O(n) sweep (n = len(intervals))." },
    space: { o: "O(n)", why: "`res` can hold all n intervals if none overlap, plus the sort's auxiliary memory." },
    pitfalls: [
      "Setting the end to `e` instead of `max(res[-1][1], e)`: a short interval inside a long one, like `[1, 10]` then `[2, 3]`, would shrink the merge.",
      "Using `<` instead of `<=`: `[1, 4]` and `[4, 5]` touch and must become `[1, 5]`.",
      "Not sorting first: overlaps between non-neighbours are missed.",
      "Appending `intervals[0]` without copying and then editing `res[-1][1]`: you silently change the caller's input.",
    ],
  },
  435: {
    time: { o: "O(n log n)", why: "Sorting by end is O(n log n); the greedy pass is ==one linear sweep== (n = len(intervals))." },
    space: { o: "O(1) extra", why: "Only `prev_end` and `removed`; Python's sort may still use up to O(n) memory internally." },
    pitfalls: [
      "Sorting by start and keeping the first one: a long early interval can block many short ones. Sort by end, or when sorting by start keep the smaller end on a clash.",
      "Treating touching intervals as overlapping: `[1, 2]` and `[2, 3]` are fine here, so the keep condition is `s >= prev_end`.",
      "Starting `prev_end` at 0: starts can be negative (down to −5·10⁴), so use negative infinity or the first interval's end.",
    ],
  },
  252: {
    time: { o: "O(n log n)", why: "==Sorting by start dominates==; the neighbour check after it is O(n) (n = number of meetings)." },
    space: { o: "O(1) extra", why: "Just a loop index, besides the sort's internal memory." },
    pitfalls: [
      "Using `<=` in the clash check: a meeting ending at 4 and one starting at 4 are back to back, which is allowed.",
      "Comparing every pair: O(n²) and unnecessary once the list is sorted, since only neighbours can clash.",
      "Indexing `intervals[0]` without handling an empty list: an empty schedule should return True, which the `range(1, n)` loop already does.",
    ],
  },
  253: {
    time: { o: "O(n log n)", why: "Two sorts of n values each; the ==two-pointer sweep== afterwards is O(n) (n = number of meetings)." },
    space: { o: "O(n)", why: "The separate `starts` and `ends` lists hold n values each." },
    pitfalls: [
      "Using `<=` in `starts[s] < ends[e]`: a meeting starting exactly when another ends can reuse that room, so the end must be processed first.",
      "Thinking you lose track of which meeting ends: you only need when rooms free up, not which one, so sorting the lists separately is safe.",
      "The min-heap of end times is the other standard answer; both are O(n log n), but don't forget to pop before pushing in that version.",
      "Returning `count` at the end instead of the running peak `best`: `count` ends near 0 or 1, not the max.",
    ],
  },
  1851: {
    time: { o: "O(n log n + q log q)", why: "Sorting intervals and queries, then ==each interval is pushed and popped at most once== at O(log n) (n = len(intervals), q = len(queries))." },
    space: { o: "O(n + q)", why: "The heap can hold all n intervals, and `ans` stores one entry per distinct query." },
    pitfalls: [
      "Answering queries in their original order: the heap work only carries over if queries are sorted; map answers back afterwards.",
      "Using `<=` in `heap[0][1] < q`: an interval ending exactly at `q` still contains it, so only pop when the end is strictly before `q`.",
      "Trying to remove every expired interval from the heap: a heap can't delete from the middle cheaply. Pop lazily from the top only, since only the root is read.",
      "Forgetting the `+ 1` in `r - l + 1`: the size counts both endpoints, so `[5, 5]` has size 1.",
    ],
  },
};
