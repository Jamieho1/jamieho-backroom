/**
 * heap: NeetCode 150 problems, written in Jamie's format (see arrays-hashing.ts).
 * Problems:
 * - 703 Kth Largest Element in a Stream (Easy)
 * - 1046 Last Stone Weight (Easy)
 * - 973 K Closest Points to Origin (Medium)
 * - 215 Kth Largest Element in an Array (Medium)
 * - 621 Task Scheduler (Medium)
 * - 355 Design Twitter (Medium)
 * - 295 Find Median from Data Stream (Hard)
 */
import type { Solution, Variation } from "../solutions";

const kv = (o: Record<string, string>) => Object.entries(o).map(([name, value]) => ({ name, value }));

export const variations: Variation[] = [
  {
    id: "top-k-heap",
    topic: "heap",
    name: "Size-k heap",
    change: "Base pattern. Keep a heap of ==only k items== and pop the worst whenever it grows past k. The root is then the k-th best.",
    problems: [703, 973, 215],
  },
  {
    id: "max-heap-sim",
    topic: "heap",
    name: "Max-heap simulation",
    change: "No k: repeatedly ==take the biggest item, change it, push it back==. Python only has a min-heap, so store negatives.",
    problems: [1046, 621],
  },
  {
    id: "k-way-merge",
    topic: "heap",
    name: "K-way merge",
    change: "Several sorted lists: seed the heap with ==the head of each list==, and every pop pushes the next item from the same list.",
    problems: [355],
  },
  {
    id: "two-heaps",
    topic: "heap",
    name: "Two heaps",
    change: "Split the data into a ==max-heap for the lower half and a min-heap for the upper half==, kept balanced, so the middle is always at the two roots.",
    problems: [295],
  },
];

export const solutions: Solution[] = [
  {
    lc: 703,
    variation: "top-k-heap",
    question: "Build a class that receives numbers one at a time and, after each one, reports the k-th largest number seen so far.",
    intuition: `You only ever care about the top k numbers. Keep them in a ==min-heap of size k==: its root is the smallest of the top k, which is exactly the k-th largest. A new number goes in, and if the heap grows past k, ==pop the root== to drop the one that fell out of the top k.`,
    algorithm: `1. In \`__init__\`, store \`k\` and heapify \`nums\` into \`self.heap\`.
2. Pop until \`len(self.heap) == k\`.
3. In \`add(val)\`:
   * ==Push \`val\`==.
   * If \`len(self.heap) > k\`, ==pop the smallest==.
   * Return \`self.heap[0]\`.`,
    visual: {
      kind: "array",
      title: "Kth largest in a stream · k = 3",
      values: [4, 5, 8, 2, 3, 5, 10],
      frames: [
        { caption: "Start with 4, 5, 8, 2. Heapify, then pop 2 so only 3 numbers are left.", range: [0, 3], highlight: [3], vars: kv({ heap: "[4, 5, 8]", "k-th": "4" }) },
        { caption: "add(3): push → 4 items, pop the smallest (3). Root 4 is the 3rd largest.", pointers: [{ name: "val", index: 4 }], highlight: [4], done: [0, 1, 2], vars: kv({ heap: "[4, 5, 8]", returns: "4" }) },
        { caption: "add(5): push → pop 4. Now the top three are 5, 5, 8.", pointers: [{ name: "val", index: 5 }], highlight: [5], done: [1, 2], vars: kv({ heap: "[5, 5, 8]", returns: "5" }) },
        { caption: "add(10): push → pop one 5. Root is still 5.", pointers: [{ name: "val", index: 6 }], highlight: [6], done: [2, 5], vars: kv({ heap: "[5, 8, 10]", returns: "5" }) },
      ],
    },
    code: `import heapq

class KthLargest:
    def __init__(self, k: int, nums: list[int]):
        self.k = k
        self.heap = nums[:]
        heapq.heapify(self.heap)
        while len(self.heap) > k:
            heapq.heappop(self.heap)

    def add(self, val: int) -> int:
        heapq.heappush(self.heap, val)
        if len(self.heap) > self.k:
            heapq.heappop(self.heap)
        return self.heap[0]`,
    complexity: "Time O(n log n) to build, O(log k) per add · Space O(k)",
  },
  {
    lc: 1046,
    variation: "max-heap-sim",
    question: "Repeatedly smash the two heaviest stones together (the difference survives, if any) and return the weight of what's left, or 0.",
    intuition: `Each round needs ==the two largest stones==, and the result goes back into the pile. That's exactly a max-heap. Python's \`heapq\` is a min-heap, so ==store negative weights== and flip the sign when you read them.`,
    algorithm: `1. Build \`heap = [-s for s in stones]\` and heapify it.
2. While the heap has more than one stone:
   * Pop the two largest: \`first = -heappop(heap)\`, \`second = -heappop(heap)\`.
   * If \`first > second\`, ==push \`-(first - second)\`== back.
3. Return \`-heap[0]\` if a stone is left, else \`0\`.`,
    visual: {
      kind: "array",
      title: "Last stone weight · [3, 6, 2, 5, 1]",
      values: [3, 6, 2, 5, 1],
      frames: [
        { caption: "Heapify the negatives so the heaviest stone is at the root.", vars: kv({ heap: "{6, 5, 3, 2, 1}" }) },
        { caption: "Smash 6 and 5 → 1 survives and goes back in.", highlight: [1, 3], vars: kv({ heap: "{3, 2, 1, 1}", smash: "6 − 5 = 1" }) },
        { caption: "Smash 3 and 2 → 1 goes back in.", highlight: [0, 2], done: [1, 3], vars: kv({ heap: "{1, 1, 1}", smash: "3 − 2 = 1" }) },
        { caption: "Smash 1 and 1 → equal, both gone.", done: [0, 1, 2, 3], vars: kv({ heap: "{1}", smash: "1 − 1 = 0" }) },
        { caption: "One stone left → return 1.", done: [0, 1, 2, 3, 4], vars: kv({ heap: "{1}", answer: "1" }) },
      ],
    },
    code: `import heapq

def lastStoneWeight(stones: list[int]) -> int:
    heap = [-s for s in stones]
    heapq.heapify(heap)
    while len(heap) > 1:
        first = -heapq.heappop(heap)
        second = -heapq.heappop(heap)
        if first > second:
            heapq.heappush(heap, -(first - second))
    return -heap[0] if heap else 0`,
    complexity: "Time O(n log n) · Space O(n)",
  },
  {
    lc: 973,
    variation: "top-k-heap",
    question: "Given a list of 2D points and k, return the k points nearest to the origin.",
    intuition: `Compare by squared distance \`x² + y²\` (no square root needed). Keep a ==max-heap of the k closest so far==: when it holds k + 1 points, ==pop the farthest==. What stays at the end is the k nearest, in O(n log k).`,
    algorithm: `1. Create an empty \`heap\`.
2. For each point \`(x, y)\`:
   * Push \`(-(x*x + y*y), x, y)\` (negated so the farthest is at the root).
   * If \`len(heap) > k\`, ==pop the farthest==.
3. Return the points left in \`heap\`.`,
    visual: {
      kind: "array",
      title: "K closest points · k = 2",
      values: ["(1,3)", "(-2,2)", "(5,8)", "(0,1)"],
      frames: [
        { caption: "(1,3): distance² 10. Push.", pointers: [{ name: "p", index: 0 }], highlight: [0], vars: kv({ heap: "{10:(1,3)}" }) },
        { caption: "(-2,2): distance² 8. Push. Heap has k = 2 points.", pointers: [{ name: "p", index: 1 }], highlight: [1], vars: kv({ heap: "{10:(1,3), 8:(-2,2)}" }) },
        { caption: "(5,8): distance² 89. Push → 3 points, pop the farthest (89).", pointers: [{ name: "p", index: 2 }], highlight: [2], vars: kv({ heap: "{10:(1,3), 8:(-2,2)}", popped: "(5,8)" }) },
        { caption: "(0,1): distance² 1. Push → pop the farthest (10).", pointers: [{ name: "p", index: 3 }], highlight: [3], vars: kv({ heap: "{8:(-2,2), 1:(0,1)}", popped: "(1,3)" }) },
        { caption: "Done: the heap holds the 2 closest points.", done: [1, 3], vars: kv({ answer: "[(-2,2), (0,1)]" }) },
      ],
    },
    code: `import heapq

def kClosest(points: list[list[int]], k: int) -> list[list[int]]:
    heap = []
    for x, y in points:
        heapq.heappush(heap, (-(x * x + y * y), x, y))
        if len(heap) > k:
            heapq.heappop(heap)
    return [[x, y] for _, x, y in heap]`,
    complexity: "Time O(n log k) · Space O(k)",
  },
  {
    lc: 215,
    variation: "top-k-heap",
    question: "Given an unsorted list of integers and k, return the value that would sit k-th from the top if it were sorted descending.",
    intuition: `Same trick as the stream version: a ==min-heap of size k== holds the k largest values seen, and its root is the k-th largest. You never sort the whole list, so it's O(n log k). (Quickselect gets O(n) on average if the interviewer pushes.)`,
    algorithm: `1. Create an empty \`heap\`.
2. For each \`n\` in \`nums\`:
   * Push \`n\`.
   * If \`len(heap) > k\`, ==pop the smallest==.
3. Return ==\`heap[0]\`==.`,
    visual: {
      kind: "array",
      title: "Kth largest in an array · k = 2",
      values: [3, 2, 1, 5, 6, 4],
      frames: [
        { caption: "Push 3 and 2. Heap has k = 2 values.", range: [0, 1], vars: kv({ heap: "[2, 3]" }) },
        { caption: "1: push, size 3 → pop the smallest (1).", pointers: [{ name: "i", index: 2 }], highlight: [2], vars: kv({ heap: "[2, 3]" }) },
        { caption: "5: push → pop 2.", pointers: [{ name: "i", index: 3 }], highlight: [3], vars: kv({ heap: "[3, 5]" }) },
        { caption: "6: push → pop 3.", pointers: [{ name: "i", index: 4 }], highlight: [4], vars: kv({ heap: "[5, 6]" }) },
        { caption: "4: push → pop 4 straight away. Root 5 is the 2nd largest.", pointers: [{ name: "i", index: 5 }], highlight: [5], done: [3, 4], vars: kv({ heap: "[5, 6]", answer: "5" }) },
      ],
    },
    code: `import heapq

def findKthLargest(nums: list[int], k: int) -> int:
    heap = []
    for n in nums:
        heapq.heappush(heap, n)
        if len(heap) > k:
            heapq.heappop(heap)
    return heap[0]`,
    complexity: "Time O(n log k) · Space O(k)",
  },
  {
    lc: 621,
    variation: "max-heap-sim",
    question: "Given task labels and a cooldown n between two runs of the same label, return the fewest time slots (idle slots allowed) to run them all.",
    intuition: `Greedy: at each tick, ==run the task with the most copies left==, because it's the one most likely to force idle time later. A max-heap gives that task. After running it, it sits in a ==queue until \`time + n\`==, then goes back into the heap. If the heap is empty but the queue isn't, the CPU idles.`,
    algorithm: `1. Count tasks; push \`-count\` for each into \`heap\` (max-heap).
2. Create an empty deque \`q\` of \`(count, ready_time)\` and \`time = 0\`.
3. While \`heap\` or \`q\` is not empty:
   * \`time += 1\`.
   * If \`heap\` is not empty:
      * Pop, ==use one copy== (\`cnt = 1 + heappop(heap)\`).
      * If copies remain, append \`(cnt, time + n)\` to \`q\`.
   * If ==\`q[0]\` is ready at \`time\`==, push its count back into \`heap\`.
4. Return \`time\`.`,
    visual: {
      kind: "array",
      title: "Task scheduler · A A A B B B, n = 2",
      values: ["·", "·", "·", "·", "·", "·", "·", "·"],
      frames: [
        { caption: "t=1: run A (3 → 2 left). A waits until t=3.", values: ["A", "·", "·", "·", "·", "·", "·", "·"], pointers: [{ name: "t", index: 0 }], highlight: [0], vars: kv({ heap: "{B:3}", queue: "[A:2 @3]" }) },
        { caption: "t=2: run B (3 → 2). B waits until t=4.", values: ["A", "B", "·", "·", "·", "·", "·", "·"], pointers: [{ name: "t", index: 1 }], highlight: [1], vars: kv({ heap: "{}", queue: "[A:2 @3, B:2 @4]" }) },
        { caption: "t=3: heap empty → idle. A is ready now, back into the heap.", values: ["A", "B", "idle", "·", "·", "·", "·", "·"], pointers: [{ name: "t", index: 2 }], highlight: [2], vars: kv({ heap: "{A:2}", queue: "[B:2 @4]" }) },
        { caption: "t=4, t=5: run A then B; each waits again.", values: ["A", "B", "idle", "A", "B", "·", "·", "·"], pointers: [{ name: "t", index: 4 }], highlight: [3, 4], done: [0, 1, 2], vars: kv({ heap: "{}", queue: "[A:1 @6, B:1 @7]" }) },
        { caption: "t=6 idle, then A at t=7 and B at t=8. Both queues empty → 8 slots.", values: ["A", "B", "idle", "A", "B", "idle", "A", "B"], done: [0, 1, 2, 3, 4, 5, 6, 7], vars: kv({ answer: "8" }) },
      ],
    },
    code: `import heapq
from collections import Counter, deque

def leastInterval(tasks: list[str], n: int) -> int:
    heap = [-c for c in Counter(tasks).values()]
    heapq.heapify(heap)
    q = deque()  # (negative count left, time it can run again)
    time = 0
    while heap or q:
        time += 1
        if heap:
            cnt = 1 + heapq.heappop(heap)
            if cnt:
                q.append((cnt, time + n))
        if q and q[0][1] == time:
            heapq.heappush(heap, q.popleft()[0])
    return time`,
    complexity: "Time O(t · log 26) = O(t) for t time slots · Space O(26) = O(1)",
  },
  {
    lc: 355,
    variation: "k-way-merge",
    question: "Design a tiny social feed: users post, follow and unfollow, and can fetch the 10 newest posts from themselves and the people they follow.",
    intuition: `Each user's posts are already in time order, so the feed is a ==merge of several sorted lists==. Put ==each followee's newest post in a heap==, keyed by a global counter that goes down with every post (newest = smallest). Each pop is the next newest; push that user's previous post to replace it. Stop at 10.`,
    algorithm: `**Post / follow / unfollow**

1. \`postTweet\`: append \`(count, tweetId)\` to \`tweets[user]\`, then \`count -= 1\`.
2. \`follow\` / \`unfollow\`: add or discard in \`following[user]\` (never follow yourself).

**Feed**

1. For each user in \`following[user] | {user}\` with posts:
   * Push ==their latest post== as \`(count, tweetId, user, index - 1)\`.
2. While the heap is not empty and \`len(res) < 10\`:
   * Pop the newest; append its \`tweetId\` to \`res\`.
   * If that user has an older post (\`index >= 0\`), ==push it==.
3. Return \`res\`.`,
    visual: {
      kind: "array",
      title: "Twitter feed for user 1 (follows user 2)",
      values: ["·", "·", "·"],
      frames: [
        { caption: "Posts so far: u1 posted 5 (count 0), u2 posted 6 (count −1), u1 posted 7 (count −2).", vars: kv({ "tweets[1]": "[(0,5), (−2,7)]", "tweets[2]": "[(−1,6)]" }) },
        { caption: "Seed the heap with each user's newest post.", vars: kv({ heap: "{(−2,7,u1), (−1,6,u2)}" }) },
        { caption: "Pop (−2, 7): newest. Push u1's older post (0, 5).", values: [7, "·", "·"], pointers: [{ name: "res", index: 0 }], highlight: [0], vars: kv({ heap: "{(−1,6,u2), (0,5,u1)}" }) },
        { caption: "Pop (−1, 6). u2 has nothing older.", values: [7, 6, "·"], pointers: [{ name: "res", index: 1 }], highlight: [1], done: [0], vars: kv({ heap: "{(0,5,u1)}" }) },
        { caption: "Pop (0, 5). Heap empty → feed is [7, 6, 5].", values: [7, 6, 5], done: [0, 1, 2], vars: kv({ heap: "{}", answer: "[7, 6, 5]" }) },
      ],
    },
    code: `import heapq
from collections import defaultdict

class Twitter:
    def __init__(self):
        self.count = 0
        self.tweets = defaultdict(list)  # user -> [(count, tweetId)]
        self.following = defaultdict(set)

    def postTweet(self, userId: int, tweetId: int) -> None:
        self.tweets[userId].append((self.count, tweetId))
        self.count -= 1

    def getNewsFeed(self, userId: int) -> list[int]:
        res, heap = [], []
        for u in self.following[userId] | {userId}:
            if self.tweets[u]:
                idx = len(self.tweets[u]) - 1
                count, tid = self.tweets[u][idx]
                heap.append((count, tid, u, idx - 1))
        heapq.heapify(heap)
        while heap and len(res) < 10:
            count, tid, u, idx = heapq.heappop(heap)
            res.append(tid)
            if idx >= 0:
                c, t = self.tweets[u][idx]
                heapq.heappush(heap, (c, t, u, idx - 1))
        return res

    def follow(self, followerId: int, followeeId: int) -> None:
        if followerId != followeeId:
            self.following[followerId].add(followeeId)

    def unfollow(self, followerId: int, followeeId: int) -> None:
        self.following[followerId].discard(followeeId)`,
    complexity: "Time O(f + 10 log f) per feed for f followees, O(1) otherwise · Space O(users + posts)",
  },
  {
    lc: 295,
    variation: "two-heaps",
    question: "Design a structure that accepts numbers one by one and can return the median of everything added so far at any time.",
    intuition: `Keep the ==lower half in a max-heap \`small\`== and the ==upper half in a min-heap \`large\`==. Two rules: every value in \`small\` is ≤ every value in \`large\`, and their sizes differ by at most 1. Then the median is one root, or the average of both roots.`,
    algorithm: `1. \`addNum(num)\`:
   * Push \`-num\` into \`small\`.
   * If ==\`small\`'s max > \`large\`'s min==, move \`small\`'s top to \`large\`.
   * ==Rebalance==: if one heap has 2 more than the other, move its top across.
2. \`findMedian()\`:
   * If \`small\` is bigger, return \`-small[0]\`.
   * If \`large\` is bigger, return \`large[0]\`.
   * Otherwise return \`(-small[0] + large[0]) / 2\`.`,
    visual: {
      kind: "array",
      title: "Median from a stream · add 5, 2, 8, 1",
      values: [5, 2, 8, 1],
      frames: [
        { caption: "add 5 → small. Median 5.", pointers: [{ name: "num", index: 0 }], highlight: [0], vars: kv({ small: "[5]", large: "[]", median: "5" }) },
        { caption: "add 2 → small has 2 more than large → move its max (5) to large. Median (2 + 5) / 2.", pointers: [{ name: "num", index: 1 }], highlight: [1], done: [0], vars: kv({ small: "[2]", large: "[5]", median: "3.5" }) },
        { caption: "add 8 → small's max 8 > large's min 5 → move 8 to large. large is bigger → median 5.", pointers: [{ name: "num", index: 2 }], highlight: [2], done: [0, 1], vars: kv({ small: "[2]", large: "[5, 8]", median: "5" }) },
        { caption: "add 1 → small. Sizes equal → (2 + 5) / 2.", pointers: [{ name: "num", index: 3 }], highlight: [3], done: [0, 1, 2], vars: kv({ small: "[2, 1]", large: "[5, 8]", median: "3.5" }) },
      ],
    },
    code: `import heapq

class MedianFinder:
    def __init__(self):
        self.small = []  # max-heap (negated): lower half
        self.large = []  # min-heap: upper half

    def addNum(self, num: int) -> None:
        heapq.heappush(self.small, -num)
        if self.large and -self.small[0] > self.large[0]:
            heapq.heappush(self.large, -heapq.heappop(self.small))
        if len(self.small) > len(self.large) + 1:
            heapq.heappush(self.large, -heapq.heappop(self.small))
        if len(self.large) > len(self.small) + 1:
            heapq.heappush(self.small, -heapq.heappop(self.large))

    def findMedian(self) -> float:
        if len(self.small) > len(self.large):
            return -self.small[0]
        if len(self.large) > len(self.small):
            return self.large[0]
        return (-self.small[0] + self.large[0]) / 2`,
    complexity: "Time O(log n) per add, O(1) per median · Space O(n)",
  },
];

/** Recognise-it cues for the Roadmap flashcards. */