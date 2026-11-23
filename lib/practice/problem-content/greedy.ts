/** Original follow-ups and alternative implementations. Reference prose reuses our authored lesson. */
import type {AuthoredContent} from './types';
export const content={
  "53": {
    "followUps": [
      "How would you return the interval boundaries as well as the maximum sum?"
    ],
    "reference": {
      "title": "Running sum, reset when negative",
      "explanation": "Extend a running sum from the left. If the sum so far is negative, ==starting fresh at the next number is always better== than carrying the negative prefix. This is Kadane's algorithm: one pass, keep the best sum seen.",
      "time": "O(n)",
      "space": "O(1)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Try every subarray",
      "explanation": "Extend each starting position while maintaining a sum, keeping the best nonempty interval.",
      "code": "class Solution:\n    def maxSubArray(self, nums: List[int]) -> int:\n        best = nums[0]\n        for left in range(len(nums)):\n            total = 0\n            for right in range(left,len(nums)):\n                total += nums[right]\n                best = max(best,total)\n        return best\n",
      "time": "O(n²)",
      "space": "O(1)",
      "optimal": false
    }
  },
  "55": {
    "followUps": [
      "How would you also return one actual sequence of jumps to the last index?"
    ],
    "reference": {
      "title": "Farthest reach",
      "explanation": "Work backwards with a ==`goal` index that you still need to reach==, starting at the last index. If index `i` can jump to `goal` (`i + nums[i] >= goal`), then reaching `i` is enough, so ==move the goal to `i`==. You can win exactly when the goal ends at 0.",
      "time": "O(n)",
      "space": "O(1)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Reachable-position DP",
      "explanation": "Mark a destination reachable whenever an earlier reachable index can jump to it.",
      "code": "class Solution:\n    def canJump(self, nums: List[int]) -> bool:\n        reachable = [False]*len(nums); reachable[0] = True\n        for i in range(len(nums)):\n            if reachable[i]:\n                for j in range(i+1,min(len(nums),i+nums[i]+1)): reachable[j] = True\n        return reachable[-1]\n",
      "time": "O(n²)",
      "space": "O(n)",
      "optimal": false
    }
  },
  "45": {
    "followUps": [
      "How do greedy frontier boundaries correspond to breadth-first search layers?"
    ],
    "reference": {
      "title": "Farthest reach",
      "explanation": "Think in BFS levels without a queue. The window `[l, r]` holds every index reachable with the current number of jumps. ==The farthest any of them can jump becomes the next window's right edge==, and each new window costs exactly one jump.",
      "time": "O(n)",
      "space": "O(1)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Minimum-jump DP",
      "explanation": "Relax all forward destinations from each index using its current minimum jump count.",
      "code": "class Solution:\n    def jump(self, nums: List[int]) -> int:\n        best = [float('inf')]*len(nums); best[0] = 0\n        for i in range(len(nums)):\n            for j in range(i+1,min(len(nums),i+nums[i]+1)):\n                best[j] = min(best[j],best[i]+1)\n        return best[-1]\n",
      "time": "O(n²)",
      "space": "O(n)",
      "optimal": false
    }
  },
  "134": {
    "followUps": [
      "Why can every station up to a failed endpoint be skipped as a future candidate start?"
    ],
    "reference": {
      "title": "Running sum, reset when negative",
      "explanation": "If ==total fuel < total cost==, no start works. Otherwise one does, and it's unique. Run a tank from a candidate start; ==if the tank goes negative at `i`, no station from the start to `i` can work==, so the next candidate is `i + 1`.",
      "time": "O(n)",
      "space": "O(1)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Simulate every starting station",
      "explanation": "Try a complete circuit from each start and abandon a candidate at its first negative fuel balance.",
      "code": "class Solution:\n    def canCompleteCircuit(self, gas: List[int], cost: List[int]) -> int:\n        for start in range(len(gas)):\n            fuel = 0\n            for step in range(len(gas)):\n                i = (start+step)%len(gas)\n                fuel += gas[i]-cost[i]\n                if fuel < 0: break\n            else: return start\n        return -1\n",
      "time": "O(n²)",
      "space": "O(1)",
      "optimal": false
    }
  },
  "846": {
    "followUps": [
      "What data structure avoids repeatedly finding the smallest remaining card?"
    ],
    "reference": {
      "title": "Smallest first",
      "explanation": "==The smallest card left must start a group==: nothing smaller exists to come before it. So take its count `c`, and the next `groupSize - 1` values must each have at least `c` copies. Subtract and move to the next smallest value.",
      "time": "O(n log n)",
      "space": "O(n)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Repeatedly remove the smallest run",
      "explanation": "Repeatedly locate the smallest remaining value and remove one copy of every value in the required consecutive group.",
      "code": "class Solution:\n    def isNStraightHand(self, hand: List[int], groupSize: int) -> bool:\n        if len(hand)%groupSize: return False\n        counts = Counter(hand)\n        while counts:\n            start = min(counts)\n            for value in range(start,start+groupSize):\n                if counts.get(value,0) == 0: return False\n                counts[value] -= 1\n                if counts[value] == 0: del counts[value]\n        return True\n",
      "time": "O(n²)",
      "space": "O(n)",
      "optimal": false
    }
  },
  "1899": {
    "followUps": [
      "Why can every candidate exceeding the target in any coordinate be discarded immediately?"
    ],
    "reference": {
      "title": "Filter, then combine",
      "explanation": "Merging only takes maxes, so ==any triplet with a slot bigger than the target is poison== and must never be used. Every other triplet is safe to merge in. So just ask: ==do the safe triplets hit each target slot at least once==?",
      "time": "O(n)",
      "space": "O(1)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Enumerate contributing triples",
      "explanation": "For each target coordinate, choose a candidate supplying that value and test whether their coordinatewise maximum equals the target.",
      "code": "class Solution:\n    def mergeTriplets(self, triplets: List[List[int]], target: List[int]) -> bool:\n        for a in triplets:\n            for b in triplets:\n                for c in triplets:\n                    if [max(a[i],b[i],c[i]) for i in range(3)] == target: return True\n        return False\n",
      "time": "O(n³)",
      "space": "O(1)",
      "optimal": false
    }
  },
  "763": {
    "followUps": [
      "How would appending new characters affect partitions already emitted by a streaming implementation?"
    ],
    "reference": {
      "title": "Farthest reach",
      "explanation": "Record ==the last index of every letter==. While scanning, a piece must stretch to the last occurrence of every letter inside it, so keep `end = max(end, last[c])`. ==When `i` reaches `end`==, nothing in the piece appears later: cut there.",
      "time": "O(n)",
      "space": "O(1)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Merge character occurrence intervals",
      "explanation": "Each character forces its first and last occurrences into one partition. Merge overlapping character intervals to obtain partition boundaries.",
      "code": "class Solution:\n    def partitionLabels(self, s: str) -> List[int]:\n        first, last = {}, {}\n        for i,ch in enumerate(s):\n            first.setdefault(ch,i); last[ch] = i\n        intervals = sorted((first[ch],last[ch]) for ch in first)\n        answer = []\n        left, right = intervals[0]\n        for a,b in intervals[1:]:\n            if a <= right: right = max(right,b)\n            else: answer.append(right-left+1); left,right = a,b\n        answer.append(right-left+1)\n        return answer\n",
      "time": "O(n + A log A)",
      "space": "O(A)",
      "optimal": false
    }
  },
  "678": {
    "followUps": [
      "Why is retaining only the minimum and maximum feasible balance sufficient here?"
    ],
    "reference": {
      "title": "Track a min/max range",
      "explanation": "Each `*` branches into three choices, but you only need ==the range of possible open counts `[lo, hi]`==. `(` raises both, `)` lowers both, `*` widens the range. If `hi < 0` there are too many `)`. ==Clamp `lo` at 0== (never below zero opens). Balanced iff `lo == 0` at the end.",
      "time": "O(n)",
      "space": "O(1)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Set of feasible balances",
      "explanation": "Track every nonnegative open-bracket count attainable after the prefix; a star branches to open, close or empty.",
      "code": "class Solution:\n    def checkValidString(self, s: str) -> bool:\n        balances = {0}\n        for ch in s:\n            following = set()\n            for balance in balances:\n                if ch in ('(', '*'): following.add(balance+1)\n                if ch in (')', '*') and balance: following.add(balance-1)\n                if ch == '*': following.add(balance)\n            balances = following\n        return 0 in balances\n",
      "time": "O(n²)",
      "space": "O(n)",
      "optimal": false
    }
  }
} satisfies Record<number,AuthoredContent>;
