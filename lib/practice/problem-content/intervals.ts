/** Original follow-ups and alternative implementations. Reference prose reuses our authored lesson. */
import type {AuthoredContent} from './types';
export const content={
  "57": {
    "followUps": [
      "Why can a dedicated insertion pass avoid sorting when the original intervals are already disjoint and ordered?"
    ],
    "reference": {
      "title": "Sort by start, compare neighbours",
      "explanation": "The list is already sorted, so walk it once. Intervals that ==end before the new one starts== go straight to the output. Intervals that overlap get ==absorbed into the new one== (min of starts, max of ends). The first interval that starts after the new one ends means you can place the new one and copy the rest.",
      "time": "O(n)",
      "space": "O(n)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Append then sort/merge",
      "explanation": "Add the new interval, sort all starts and reuse a general interval-merging pass.",
      "code": "class Solution:\n    def insert(self, intervals: List[List[int]], newInterval: List[int]) -> List[List[int]]:\n        answer = []\n        for left,right in sorted(intervals+[newInterval]):\n            if answer and left <= answer[-1][1]: answer[-1][1] = max(answer[-1][1],right)\n            else: answer.append([left,right])\n        return answer\n",
      "time": "O(n log n)",
      "space": "O(n)",
      "optimal": false
    }
  },
  "56": {
    "followUps": [
      "Would touching half-open intervals merge under the same comparison rule?"
    ],
    "reference": {
      "title": "Sort by start, compare neighbours",
      "explanation": "==Sort by start==. Now an interval overlaps the last merged one exactly when ==its start ≤ that one's end==. If so, stretch the last end to `max(end, e)`; otherwise it begins a new merged interval.",
      "time": "O(n log n)",
      "space": "O(n)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Repeated overlap elimination",
      "explanation": "Repeatedly merge any overlapping pair until no pair overlaps, then sort the final disjoint intervals.",
      "code": "class Solution:\n    def merge(self, intervals: List[List[int]]) -> List[List[int]]:\n        work = [list(pair) for pair in intervals]\n        changed = True\n        while changed:\n            changed = False\n            for i in range(len(work)):\n                for j in range(i+1,len(work)):\n                    if max(work[i][0],work[j][0]) <= min(work[i][1],work[j][1]):\n                        work[i] = [min(work[i][0],work[j][0]),max(work[i][1],work[j][1])]\n                        work.pop(j); changed = True; break\n                if changed: break\n        return sorted(work)\n",
      "time": "O(n³)",
      "space": "O(n)",
      "optimal": false
    }
  },
  "435": {
    "followUps": [
      "How would the recurrence change if keeping an interval earned a different reward?"
    ],
    "reference": {
      "title": "Greedy: keep the earliest end",
      "explanation": "Flip it: ==keep as many as possible==. Sort by end. The interval that ==finishes first== is always safe to keep, because it leaves the most room for everything after. Walk the list; anything starting before the last kept end overlaps it, so delete it.",
      "time": "O(n log n)",
      "space": "O(1) extra"
    },
    "alternative": {
      "id": "alternative",
      "title": "Weighted-prefix scheduling DP",
      "explanation": "Sort by end time and compute the largest compatible kept subset ending at each interval, then remove everything else.",
      "code": "class Solution:\n    def eraseOverlapIntervals(self, intervals: List[List[int]]) -> int:\n        ordered = sorted(intervals,key=lambda pair:pair[1])\n        best = [1]*len(ordered)\n        for i in range(len(ordered)):\n            for j in range(i):\n                if ordered[j][1] <= ordered[i][0]: best[i] = max(best[i],best[j]+1)\n        return len(ordered)-max(best,default=0)\n",
      "time": "O(n²)",
      "space": "O(n)",
      "optimal": false
    }
  },
  "252": {
    "followUps": [
      "How would you identify a conflicting pair instead of returning only a boolean?"
    ],
    "reference": {
      "title": "Sort by start, compare neighbours",
      "explanation": "After ==sorting by start==, only neighbours can clash: if meeting `i` doesn't overlap meeting `i - 1`, it can't overlap anything earlier either. So check ==each start against the previous end==.",
      "time": "O(n log n)",
      "space": "O(1) extra"
    },
    "alternative": {
      "id": "alternative",
      "title": "Check every meeting pair",
      "explanation": "Two meetings conflict when the later start is strictly earlier than the earlier end; equal endpoints are allowed.",
      "code": "class Solution:\n    def canAttendMeetings(self, intervals: List[List[int]]) -> bool:\n        for i in range(len(intervals)):\n            for j in range(i+1,len(intervals)):\n                if max(intervals[i][0],intervals[j][0]) < min(intervals[i][1],intervals[j][1]): return False\n        return True\n",
      "time": "O(n²)",
      "space": "O(1)",
      "optimal": false
    }
  },
  "253": {
    "followUps": [
      "Why must an end event be processed before a start event at the same timestamp?"
    ],
    "reference": {
      "title": "Sweep: count what's active",
      "explanation": "Rooms needed = ==the most meetings running at the same moment==. You don't care which meeting ends, only when, so sort starts and ends separately. Walk them like a merge: ==a start before the next end opens a room==, otherwise a room frees up. Track the peak.",
      "time": "O(n log n)",
      "space": "O(n)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Count overlaps at each start",
      "explanation": "Room demand can increase only at a meeting start, so count all active half-open intervals at those timestamps.",
      "code": "class Solution:\n    def minMeetingRooms(self, intervals: List[List[int]]) -> int:\n        return max((sum(left <= start < right for left,right in intervals) for start,_ in intervals),default=0)\n",
      "time": "O(n²)",
      "space": "O(1)",
      "optimal": false
    }
  },
  "1851": {
    "followUps": [
      "How does sorting queries allow intervals to enter and leave a shared heap only once?"
    ],
    "reference": {
      "title": "Sorted queries + heap",
      "explanation": "Answer the queries ==in sorted order== so the work carries over. Sort intervals by start too. For each query, push every interval that has started into a ==min-heap keyed by length==, then pop from the top any interval that has already ended. The top is the shortest that contains the query.",
      "time": "O(n log n + q log q)",
      "space": "O(n + q)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Scan intervals for every query",
      "explanation": "Independently test every interval against a query and retain the shortest inclusive interval that contains it.",
      "code": "class Solution:\n    def minInterval(self, intervals: List[List[int]], queries: List[int]) -> List[int]:\n        return [min((right-left+1 for left,right in intervals if left <= query <= right),default=-1) for query in queries]\n",
      "time": "O(n · q)",
      "space": "O(q) output",
      "optimal": false
    }
  }
} satisfies Record<number,AuthoredContent>;
