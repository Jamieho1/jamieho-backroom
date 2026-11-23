/** Original follow-ups and alternative implementations. Reference prose reuses our authored lesson. */
import type {AuthoredContent} from './types';
export const content={
  "703": {
    "followUps": [
      "Why does a size-k min-heap allow values outside the current top k to be forgotten?"
    ],
    "reference": {
      "title": "Size-k heap",
      "explanation": "You only ever care about the top k numbers. Keep them in a ==min-heap of size k==: its root is the smallest of the top k, which is exactly the k-th largest. A new number goes in, and if the heap grows past k, ==pop the root== to drop the one that fell out of the top k.",
      "time": "O(n log n) init, O(log k) per add",
      "space": "O(k)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Sort the growing stream",
      "explanation": "Retain all stream values and sort after every insertion; the kth largest is read from the end.",
      "code": "class KthLargest:\n    def __init__(self, k, nums): self.k, self.values = k, list(nums)\n    def add(self, val):\n        self.values.append(val)\n        self.values.sort()\n        return self.values[-self.k]\n",
      "time": "O(n log n) per add",
      "space": "O(n)",
      "optimal": false
    }
  },
  "1046": {
    "followUps": [
      "What invariant lets a max-heap replace the repeated full sort?"
    ],
    "reference": {
      "title": "Max-heap simulation",
      "explanation": "Each round needs ==the two largest stones==, and the result goes back into the pile. That's exactly a max-heap. Python's `heapq` is a min-heap, so ==store negative weights== and flip the sign when you read them.",
      "time": "O(n log n)",
      "space": "O(n)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Repeated sorting",
      "explanation": "Sort the remaining weights before each collision and put back any nonzero difference.",
      "code": "class Solution:\n    def lastStoneWeight(self, stones: List[int]) -> int:\n        stones = list(stones)\n        while len(stones) > 1:\n            stones.sort()\n            a, b = stones.pop(), stones.pop()\n            if a != b: stones.append(a-b)\n        return stones[0] if stones else 0\n",
      "time": "O(n² log n)",
      "space": "O(n)",
      "optimal": false
    }
  },
  "973": {
    "followUps": [
      "How would you maintain the nearest k points as new points arrive?"
    ],
    "reference": {
      "title": "Size-k heap",
      "explanation": "Compare by squared distance `x² + y²` (no square root needed). Keep a ==max-heap of the k closest so far==: when it holds k + 1 points, ==pop the farthest==. What stays at the end is the k nearest, in O(n log k).",
      "time": "O(n log k)",
      "space": "O(k)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Sort by squared distance",
      "explanation": "Sort all points by squared distance; square roots cannot change the distance ordering.",
      "code": "class Solution:\n    def kClosest(self, points: List[List[int]], k: int) -> List[List[int]]:\n        return sorted(points, key=lambda p: p[0]*p[0]+p[1]*p[1])[:k]\n",
      "time": "O(n log n)",
      "space": "O(n)",
      "optimal": false
    }
  },
  "215": {
    "followUps": [
      "What can quickselect offer on average, and how would you protect against consistently poor pivots?"
    ],
    "reference": {
      "title": "Size-k heap",
      "explanation": "Same trick as the stream version: a ==min-heap of size k== holds the k largest values seen, and its root is the k-th largest. You never sort the whole list, so it's O(n log k). (Quickselect gets O(n) on average if the interviewer pushes.)",
      "time": "O(n log k)",
      "space": "O(k)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Sort and index",
      "explanation": "Sort a copy and select the kth position from the largest end, keeping duplicates as separate elements.",
      "code": "class Solution:\n    def findKthLargest(self, nums: List[int], k: int) -> int:\n        return sorted(nums)[-k]\n",
      "time": "O(n log n)",
      "space": "O(n)",
      "optimal": false
    }
  },
  "621": {
    "followUps": [
      "How would different cooldown lengths per task change the scheduling state?"
    ],
    "reference": {
      "title": "Max-heap simulation",
      "explanation": "Greedy: at each tick, ==run the task with the most copies left==, because it's the one most likely to force idle time later. A max-heap gives that task. After running it, it sits in a ==queue until `time + n`==, then goes back into the heap. If the heap is empty but the queue isn't, the CPU idles.",
      "time": "O(t)",
      "space": "O(1)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Cooldown simulation",
      "explanation": "At each time slot, schedule an available task with the largest remaining count; idle only when none is ready.",
      "code": "class Solution:\n    def leastInterval(self, tasks: List[str], n: int) -> int:\n        remaining = Counter(tasks)\n        ready = defaultdict(int)\n        clock = 0\n        while remaining:\n            choices = [task for task in remaining if ready[task] <= clock]\n            if choices:\n                task = max(choices, key=lambda task: remaining[task])\n                remaining[task] -= 1\n                ready[task] = clock+n+1\n                if remaining[task] == 0: del remaining[task]\n            clock += 1\n        return clock\n",
      "time": "O(t)",
      "space": "O(1) for the fixed alphabet",
      "optimal": false
    }
  },
  "355": {
    "followUps": [
      "How would you paginate a feed without collecting every visible historical post?"
    ],
    "reference": {
      "title": "K-way merge",
      "explanation": "Each user's posts are already in time order, so the feed is a ==merge of several sorted lists==. Put ==each followee's newest post in a heap==, keyed by a global counter that goes down with every post (newest = smallest). Each pop is the next newest; push that user's previous post to replace it. Stop at 10.",
      "time": "O(f + 10 log f) per feed",
      "space": "O(U + P)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Collect and sort the visible posts",
      "explanation": "Retain timestamped posts per user, collect those from the user and followees, and sort the visible candidates newest first.",
      "code": "class Twitter:\n    def __init__(self):\n        self.clock = 0\n        self.posts = defaultdict(list)\n        self.following = defaultdict(set)\n    def postTweet(self, userId, tweetId):\n        self.posts[userId].append((self.clock, tweetId)); self.clock += 1\n    def getNewsFeed(self, userId):\n        candidates = [post for user in self.following[userId] | {userId} for post in self.posts[user]]\n        return [tweet for _, tweet in sorted(candidates, reverse=True)[:10]]\n    def follow(self, followerId, followeeId): self.following[followerId].add(followeeId)\n    def unfollow(self, followerId, followeeId): self.following[followerId].discard(followeeId)\n",
      "time": "O(P log P) per feed",
      "space": "O(U + P)",
      "optimal": false
    }
  },
  "295": {
    "followUps": [
      "How would you support deleting a value as well as adding one?"
    ],
    "reference": {
      "title": "Two heaps",
      "explanation": "Keep the ==lower half in a max-heap `small`== and the ==upper half in a min-heap `large`==. Two rules: every value in `small` is ≤ every value in `large`, and their sizes differ by at most 1. Then the median is one root, or the average of both roots.",
      "time": "O(log n) add, O(1) median",
      "space": "O(n)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Keep an ordered list",
      "explanation": "Insert each number into its sorted position and read the middle one or two entries.",
      "code": "class MedianFinder:\n    def __init__(self): self.values = []\n    def addNum(self, num): insort(self.values, num)\n    def findMedian(self):\n        n = len(self.values)\n        return self.values[n//2] if n%2 else (self.values[n//2-1]+self.values[n//2])/2\n",
      "time": "O(n) add; O(1) median",
      "space": "O(n)",
      "optimal": false
    }
  }
} satisfies Record<number,AuthoredContent>;
