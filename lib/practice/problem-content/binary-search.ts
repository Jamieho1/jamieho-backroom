/** Original follow-ups and alternative implementations. Reference prose reuses our authored lesson. */
import type {AuthoredContent} from './types';
export const content={
  "704": {
    "followUps": [
      "Which comparison lets binary search safely discard exactly half of the remaining interval?"
    ],
    "reference": {
      "title": "Classic search on sorted values",
      "explanation": "Look at the middle. If it's too small, the target ==can only be to its right==, so the whole left half is gone in one step; too big, drop the right half. Halving each time gives O(log n). Use `l <= r` so a range of one element is still checked.",
      "time": "O(log n)",
      "space": "O(1)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Linear search",
      "explanation": "Walk the array until the target is found; no ordering information is needed.",
      "code": "class Solution:\n    def search(self, nums: List[int], target: int) -> int:\n        for i, value in enumerate(nums):\n            if value == target: return i\n        return -1\n",
      "time": "O(n)",
      "space": "O(1)",
      "optimal": false
    }
  },
  "74": {
    "followUps": [
      "How would you search if only each row and each column were sorted, without the cross-row guarantee?"
    ],
    "reference": {
      "title": "Classic search on sorted values",
      "explanation": "Read row by row, the matrix is ==one long sorted list== of `rows × cols` values. So binary search an index `m` from 0 to `rows × cols - 1` and turn it into a cell with ==`(m // cols, m % cols)`==. One search, O(log(m·n)).",
      "time": "O(log(m · n))",
      "space": "O(1)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Scan every cell",
      "explanation": "Check each matrix element directly without using the row-major ordering.",
      "code": "class Solution:\n    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:\n        for row in matrix:\n            for value in row:\n                if value == target: return True\n        return False\n",
      "time": "O(m · n)",
      "space": "O(1)",
      "optimal": false
    }
  },
  "875": {
    "followUps": [
      "How does the monotonic feasible-speed predicate justify binary searching the answer?"
    ],
    "reference": {
      "title": "Binary search on the answer",
      "explanation": "If speed `k` finishes in time, every faster speed does too: the yes/no answer ==flips exactly once== as `k` grows. So binary search `k` in `[1, max(piles)]`. Hours at speed `k` = ==`sum(ceil(p / k))`==. When it fits, record `k` and try slower; otherwise go faster.",
      "time": "O(n · log M)",
      "space": "O(1)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Try each eating speed",
      "explanation": "Try positive speeds in increasing order until the rounded-up pile hours fit the deadline. M is the largest pile.",
      "code": "class Solution:\n    def minEatingSpeed(self, piles: List[int], h: int) -> int:\n        for rate in range(1, max(piles)+1):\n            if sum((pile+rate-1)//rate for pile in piles) <= h:\n                return rate\n",
      "time": "O(n · M)",
      "space": "O(1)",
      "optimal": false
    }
  },
  "153": {
    "followUps": [
      "If duplicate values were allowed, where can the logarithmic search lose its ability to discard half?"
    ],
    "reference": {
      "title": "Rotated sorted array",
      "explanation": "Compare the middle with the ==right end==. If `nums[m] > nums[r]`, the drop (and so the minimum) is ==somewhere to the right of `m`==. Otherwise `m..r` is sorted, so the minimum is `m` or to its left. Shrink until `l == r`: that's the minimum.",
      "time": "O(log n)",
      "space": "O(1)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Scan for the minimum",
      "explanation": "A direct minimum scan works regardless of the rotation point.",
      "code": "class Solution:\n    def findMin(self, nums: List[int]) -> int:\n        return min(nums)\n",
      "time": "O(n)",
      "space": "O(1)",
      "optimal": false
    }
  },
  "33": {
    "followUps": [
      "How would duplicate values change your reasoning about the sorted half?"
    ],
    "reference": {
      "title": "Rotated sorted array",
      "explanation": "After a rotation, ==at least one half around `m` is still sorted==: the left half if `nums[l] <= nums[m]`, else the right half. In the sorted half you can tell with two comparisons whether the target lies inside. ==If it does, search there; otherwise search the other half.==",
      "time": "O(log n)",
      "space": "O(1)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Scan for the target",
      "explanation": "Check every original index; rotation does not affect a direct scan.",
      "code": "class Solution:\n    def search(self, nums: List[int], target: int) -> int:\n        for i, value in enumerate(nums):\n            if value == target: return i\n        return -1\n",
      "time": "O(n)",
      "space": "O(1)",
      "optimal": false
    }
  },
  "981": {
    "followUps": [
      "How would you support set calls arriving out of timestamp order?"
    ],
    "reference": {
      "title": "Last value ≤ the query",
      "explanation": "Timestamps for a key arrive ==in increasing order==, so each key's list of `(time, value)` is already sorted: appending is enough. A get is a binary search for the ==last timestamp `<=` the query==: whenever the middle is not too late, record it as the answer so far and look further right.",
      "time": "O(1) set, O(log n) get",
      "space": "O(N)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Reverse timestamp scan",
      "explanation": "Append timestamp/value pairs per key, then scan that key backwards for the newest eligible timestamp.",
      "code": "class TimeMap:\n    def __init__(self): self.history = defaultdict(list)\n    def set(self, key, value, timestamp): self.history[key].append((timestamp, value))\n    def get(self, key, timestamp):\n        for time, value in reversed(self.history[key]):\n            if time <= timestamp: return value\n        return ''\n",
      "time": "O(1) set; O(n) get",
      "space": "O(N)",
      "optimal": false
    }
  },
  "4": {
    "followUps": [
      "Can you retain only the last two merged values when the combined length is known?"
    ],
    "reference": {
      "title": "Binary search a partition",
      "explanation": "The median splits the merged list into a left half and a right half. Pick ==`i` items from the smaller list `A`== and `j = half - i` from `B`. The split is right when ==`Aleft <= Bright` and `Bleft <= Aright`== (everything on the left ≤ everything on the right). If `Aleft` is too big take fewer from `A`, otherwise more: binary search `i`.",
      "time": "O(log(min(m, n)))",
      "space": "O(1)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Merge then select",
      "explanation": "Merge the sorted lists with two pointers and read the central one or two values.",
      "code": "class Solution:\n    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:\n        merged = []\n        i = j = 0\n        while i < len(nums1) or j < len(nums2):\n            if j == len(nums2) or (i < len(nums1) and nums1[i] <= nums2[j]):\n                merged.append(nums1[i]); i += 1\n            else:\n                merged.append(nums2[j]); j += 1\n        mid = len(merged)//2\n        return merged[mid] if len(merged)%2 else (merged[mid-1]+merged[mid])/2\n",
      "time": "O(m + n)",
      "space": "O(m + n)",
      "optimal": false
    }
  }
} satisfies Record<number,AuthoredContent>;
