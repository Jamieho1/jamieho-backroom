/**
 * Arena problems: heap. Same problems as LeetCode, our own words, verified tests (see ../types.ts).
 * - 703 Kth Largest Element in a Stream (Easy)
 * - 1046 Last Stone Weight (Easy)
 * - 973 K Closest Points to Origin (Medium)
 * - 215 Kth Largest Element in an Array (Medium)
 * - 621 Task Scheduler (Medium)
 * - 355 Design Twitter (Medium)
 * - 295 Find Median from Data Stream (Hard)
 */
import type { ArenaProblem } from "../types";

export const arena: ArenaProblem[] = [
  {
    lc: 703,
    kind: "class_design",
    statement: `Build a class that tracks a growing stream of integers and can always report the **k-th largest** value seen so far (k-th largest in sorted order, so duplicates count separately; it is not the k-th distinct value).

- \`KthLargest(k, nums)\` sets \`k\` and loads the starting values \`nums\` (which may be empty).
- \`add(val)\` appends \`val\` to the stream and returns the current k-th largest value.

Whenever \`add\` is called, the stream (including \`val\`) holds at least \`k\` values.

Tests use the operation-list format; the constructor's output is \`None\`.`,
    examples: [
      { input: "[\"KthLargest\", \"add\", \"add\", \"add\", \"add\"]\n[[2, [7, 1, 4]], [3], [9], [8], [2]]", output: "[None, 4, 7, 8, 8]", explanation: "After adding 3 the values are 7,1,4,3: the 2nd largest is 4." },
      { input: "[\"KthLargest\", \"add\", \"add\"]\n[[1, []], [-2], [5]]", output: "[None, -2, 5]" },
    ],
    constraints: ["0 <= nums.length <= 10^4", "1 <= k <= nums.length + 1", "-10^4 <= nums[i], val <= 10^4", "add is called at most 10^4 times."],
    signature: `class KthLargest:

    def __init__(self, k: int, nums: List[int]):

    def add(self, val: int) -> int:`,
    method: "KthLargest",
    driver: `def run(ns, args):
    return replay(ns, args[0], args[1])
`,
    tests: [
      { id: "ex1", input: "[[\"KthLargest\", \"add\", \"add\", \"add\", \"add\"], [[2, [7, 1, 4]], [3], [9], [8], [2]]]", expected: "[None, 4, 7, 8, 8]", visible: true },
      { id: "ex2", input: "[[\"KthLargest\", \"add\", \"add\"], [[1, []], [-2], [5]]]", expected: "[None, -2, 5]", visible: true },
      { id: "dups", input: "[[\"KthLargest\", \"add\", \"add\", \"add\"], [[3, [5, 5]], [5], [1], [6]]]", expected: "[None, 5, 5, 5]", visible: false },
      { id: "k-eq-len", input: "[[\"KthLargest\", \"add\", \"add\", \"add\"], [[4, [10, 20, 30]], [5], [1], [40]]]", expected: "[None, 5, 5, 10]", visible: false },
      { id: "small-adds", input: "[[\"KthLargest\", \"add\", \"add\", \"add\"], [[2, [9, 8, 7, 6]], [1], [2], [3]]]", expected: "[None, 8, 8, 8]", visible: false },
      { id: "neg", input: "[[\"KthLargest\", \"add\", \"add\", \"add\"], [[2, [-10, -20]], [-15], [-5], [-30]]]", expected: "[None, -15, -10, -10]", visible: false },
      { id: "big", input: "[[\"KthLargest\"] + [\"add\"] * 1000, [[1, []]] + [[i] for i in range(1000)]]", expected: "[None] + list(range(1000))", visible: false },
      { id: "big-k", input: "[[\"KthLargest\"] + [\"add\"] * 1000, [[100, list(range(1000))]] + [[i] for i in range(1000, 2000)]]", expected: "[None] + list(range(901, 1901))", visible: false },
    ],
    solution: `class KthLargest:

    def __init__(self, k: int, nums: List[int]):
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
    hints: ["You never need any value smaller than the current k-th largest again.", "Keep only the k largest values in a min-heap.", "The heap's root is the answer; after each push, pop if the heap has more than k items."],
    clarify: [
      { question: "Is it the k-th distinct value?", answer: "No, duplicates count: in [5,5,4] the 2nd largest is 5." },
      { question: "Can nums start with fewer than k values?", answer: "Yes, it may have k-1 values, but every add leaves at least k." },
    ],
  },
  {
    lc: 1046,
    kind: "algorithm",
    statement: `You have a pile of stones with positive integer weights \`stones\`. Repeat the following while at least two stones remain:

- Take the two **heaviest** stones, with weights \`x <= y\`, and smash them together.
- If \`x == y\`, both stones are destroyed.
- Otherwise the lighter one is destroyed and the heavier one is replaced by a stone of weight \`y - x\`.

When fewer than two stones remain, return the weight of the remaining stone, or \`0\` if none is left.`,
    examples: [
      { input: "stones = [3, 7, 2, 2]", output: "0", explanation: "7 and 3 leave 4; 4 and 2 leave 2; 2 and 2 destroy each other." },
      { input: "stones = [6]", output: "6" },
      { input: "stones = [10, 4, 3]", output: "3", explanation: "10 and 4 leave 6; 6 and 3 leave 3." },
    ],
    constraints: ["1 <= stones.length <= 30", "1 <= stones[i] <= 1000"],
    signature: `class Solution:
    def lastStoneWeight(self, stones: List[int]) -> int:`,
    method: "lastStoneWeight",
    tests: [
      { id: "ex1", input: "[[3, 7, 2, 2]]", expected: "0", visible: true },
      { id: "ex2", input: "[[6]]", expected: "6", visible: true },
      { id: "ex3", input: "[[10, 4, 3]]", expected: "3", visible: true },
      { id: "pair-equal", input: "[[5, 5]]", expected: "0", visible: false },
      { id: "pair-diff", input: "[[1, 1000]]", expected: "999", visible: false },
      { id: "all-same-odd", input: "[[4, 4, 4]]", expected: "4", visible: false },
      { id: "mixed", input: "[[8, 3, 9, 1, 5, 6]]", expected: "0", visible: false },
      { id: "big", input: "[list(range(1, 31))]", expected: "1", visible: false },
      { id: "big-same", input: "[[1000] * 30]", expected: "0", visible: false },
    ],
    solution: `class Solution:
    def lastStoneWeight(self, stones: List[int]) -> int:
        heap = [-s for s in stones]  # max-heap via negatives
        heapq.heapify(heap)
        while len(heap) > 1:
            y = -heapq.heappop(heap)
            x = -heapq.heappop(heap)
            if y > x:
                heapq.heappush(heap, -(y - x))
        return -heap[0] if heap else 0`,
    hints: ["Each round needs the two largest stones, and a new stone may be added back.", "A max-heap supports both in O(log n). Python's heapq is a min-heap, so store negated weights.", "Stop when one or zero stones remain."],
    clarify: [
      { question: "Do equal stones leave anything?", answer: "No, both are destroyed." },
      { question: "What if the pile empties?", answer: "Return 0." },
    ],
  },
  {
    lc: 973,
    kind: "algorithm",
    statement: `You get a list of points on a plane, \`points[i] = [x, y]\`, and an integer \`k\`. Return the \`k\` points that are **closest to the origin** \`(0, 0)\`, measured by ordinary Euclidean distance \`sqrt(x^2 + y^2)\`.

- The points may be returned in any order.
- Inputs are chosen so the set of \`k\` closest points is unique (no tie at the cut-off).`,
    examples: [
      { input: "points = [[2, 2], [-1, 0], [3, -4]], k = 2", output: "[[-1, 0], [2, 2]]", explanation: "Squared distances are 8, 1 and 25." },
      { input: "points = [[5, 1], [0, -3]], k = 1", output: "[[0, -3]]" },
    ],
    constraints: ["1 <= k <= points.length <= 10^4", "-10^4 <= x, y <= 10^4", "The answer is unique (up to order)."],
    signature: `class Solution:
    def kClosest(self, points: List[List[int]], k: int) -> List[List[int]]:`,
    method: "kClosest",
    tests: [
      { id: "ex1", input: "[[[2, 2], [-1, 0], [3, -4]], 2]", expected: "[[2, 2], [-1, 0]]", compare: "unordered", visible: true },
      { id: "ex2", input: "[[[5, 1], [0, -3]], 1]", expected: "[[0, -3]]", compare: "unordered", visible: true },
      { id: "all", input: "[[[1, 1], [2, 2]], 2]", expected: "[[2, 2], [1, 1]]", compare: "unordered", visible: false },
      { id: "origin", input: "[[[0, 0], [1, 0], [0, 2]], 1]", expected: "[[0, 0]]", compare: "unordered", visible: false },
      { id: "dup-points", input: "[[[1, 2], [1, 2], [5, 5]], 2]", expected: "[[1, 2], [1, 2]]", compare: "unordered", visible: false },
      { id: "same-dist-in", input: "[[[3, 0], [0, 3], [-3, 0], [4, 4]], 3]", expected: "[[-3, 0], [3, 0], [0, 3]]", compare: "unordered", visible: false },
      { id: "neg", input: "[[[-7, -1], [6, 6], [-2, -2], [1, -8]], 2]", expected: "[[-7, -1], [-2, -2]]", compare: "unordered", visible: false },
      { id: "big", input: "[[[i, i] for i in range(10000, 0, -1)], 3]", expected: "[[1, 1], [2, 2], [3, 3]]", compare: "unordered", visible: false },
    ],
    solution: `class Solution:
    def kClosest(self, points: List[List[int]], k: int) -> List[List[int]]:
        heap = []  # max-heap of size k on squared distance
        for x, y in points:
            heapq.heappush(heap, (-(x * x + y * y), x, y))
            if len(heap) > k:
                heapq.heappop(heap)
        return [[x, y] for _, x, y in heap]`,
    hints: ["Compare squared distances; the square root never changes the order.", "Sorting all points by distance is O(n log n) and fine; can you do O(n log k)?", "Keep a max-heap of size k: push each point and pop the farthest when the heap grows past k."],
    clarify: [
      { question: "Does the order of the output matter?", answer: "No, any order is accepted." },
      { question: "Can two points tie at the boundary?", answer: "No, the k closest points are uniquely determined." },
    ],
  },
  {
    lc: 215,
    kind: "algorithm",
    statement: `Given an integer array \`nums\` and an integer \`k\`, return the **k-th largest element**: the value that would sit at position \`k\` (1-based) if the array were sorted in descending order.

- Duplicates count separately: it is not the k-th largest **distinct** value.
- Try to do better than sorting the whole array.`,
    examples: [
      { input: "nums = [4, 1, 7, 3, 9], k = 2", output: "7" },
      { input: "nums = [5, 5, 2, 8, 8, 1], k = 3", output: "5", explanation: "Sorted descending: 8, 8, 5, 5, 2, 1." },
    ],
    constraints: ["1 <= k <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
    signature: `class Solution:
    def findKthLargest(self, nums: List[int], k: int) -> int:`,
    method: "findKthLargest",
    tests: [
      { id: "ex1", input: "[[4, 1, 7, 3, 9], 2]", expected: "7", visible: true },
      { id: "ex2", input: "[[5, 5, 2, 8, 8, 1], 3]", expected: "5", visible: true },
      { id: "single", input: "[[-4], 1]", expected: "-4", visible: false },
      { id: "k-max", input: "[[3, 1, 2], 1]", expected: "3", visible: false },
      { id: "k-min", input: "[[3, 1, 2], 3]", expected: "1", visible: false },
      { id: "all-same", input: "[[6, 6, 6, 6], 3]", expected: "6", visible: false },
      { id: "neg", input: "[[-1, -9, -3, -7], 2]", expected: "-3", visible: false },
      { id: "big", input: "[list(range(100000)), 50000]", expected: "50000", visible: false },
      { id: "big-same", input: "[[7] * 100000, 99999]", expected: "7", visible: false },
    ],
    solution: `class Solution:
    def findKthLargest(self, nums: List[int], k: int) -> int:
        heap = []  # the k largest values seen so far
        for n in nums:
            heapq.heappush(heap, n)
            if len(heap) > k:
                heapq.heappop(heap)
        return heap[0]`,
    hints: ["Sorting works in O(n log n); the goal is to avoid fully sorting.", "A min-heap that keeps only the k largest values has the answer at its root: O(n log k).", "Quickselect (partition around a pivot, recurse into one side) averages O(n); watch out for many equal values."],
    clarify: [
      { question: "Distinct values or with duplicates?", answer: "With duplicates: positions in the sorted order." },
      { question: "Is k always valid?", answer: "Yes, 1 <= k <= len(nums)." },
    ],
  },
  {
    lc: 621,
    kind: "algorithm",
    statement: `A CPU must run a list of \`tasks\`, each labelled by an uppercase letter \`A\`-\`Z\`; every task takes exactly one time unit. In each unit the CPU either runs one task or sits idle. Two runs of tasks with the **same label** must be at least \`n\` units apart, i.e. there must be at least \`n\` other units (other tasks or idle) between them.

Tasks may be run in any order. Return the **minimum number of time units** needed to finish all tasks.`,
    examples: [
      { input: "tasks = [\"A\", \"A\", \"B\"], n = 1", output: "3", explanation: "A B A." },
      { input: "tasks = [\"C\", \"C\", \"C\"], n = 2", output: "7", explanation: "C idle idle C idle idle C." },
      { input: "tasks = [\"A\", \"B\", \"A\", \"B\"], n = 0", output: "4" },
    ],
    constraints: ["1 <= tasks.length <= 10^4", "tasks[i] is an uppercase English letter.", "0 <= n <= 100"],
    signature: `class Solution:
    def leastInterval(self, tasks: List[str], n: int) -> int:`,
    method: "leastInterval",
    tests: [
      { id: "ex1", input: "[[\"A\", \"A\", \"B\"], 1]", expected: "3", visible: true },
      { id: "ex2", input: "[[\"C\", \"C\", \"C\"], 2]", expected: "7", visible: true },
      { id: "ex3", input: "[[\"A\", \"B\", \"A\", \"B\"], 0]", expected: "4", visible: true },
      { id: "single", input: "[[\"Z\"], 100]", expected: "1", visible: false },
      { id: "no-idle", input: "[[\"A\", \"A\", \"A\", \"B\", \"B\", \"B\", \"C\", \"C\", \"D\", \"D\"], 2]", expected: "10", visible: false },
      { id: "two-max", input: "[[\"A\", \"A\", \"A\", \"B\", \"B\", \"B\"], 3]", expected: "10", visible: false },
      { id: "many-kinds", input: "[[chr(65 + i) for i in range(26)] * 2, 30]", expected: "57", visible: false },
      { id: "big", input: "[[\"A\"] * 5000 + [\"B\"] * 5000, 2]", expected: "14999", visible: false },
      { id: "big-gap", input: "[[\"Q\"] * 100, 100]", expected: "10000", visible: false },
    ],
    solution: `class Solution:
    def leastInterval(self, tasks: List[str], n: int) -> int:
        counts = Counter(tasks).values()
        top = max(counts)
        tied = sum(1 for c in counts if c == top)
        # (top - 1) full frames of length n + 1, then one last frame with the tied tasks
        return max(len(tasks), (top - 1) * (n + 1) + tied)`,
    hints: ["The most frequent task decides how much idling might be needed.", "Picture (maxCount - 1) frames of length n + 1, each starting with that task, plus a final partial frame holding every task tied for the max count.", "If there are enough other tasks to fill all gaps, no idling is needed and the answer is just len(tasks)."],
    clarify: [
      { question: "Do the tasks have to run in the given order?", answer: "No, any order is allowed." },
      { question: "What does n = 0 mean?", answer: "No cooldown: the answer is just the number of tasks." },
    ],
  },
  {
    lc: 355,
    kind: "class_design",
    statement: `Design a tiny social feed. Implement \`Twitter\`:

- \`Twitter()\` starts with no users, tweets or follows.
- \`postTweet(userId, tweetId)\` records that \`userId\` posted a new tweet with id \`tweetId\`. Every call uses a fresh, unique \`tweetId\`; tweets are ordered by when they were posted (not by id).
- \`getNewsFeed(userId)\` returns up to **10** tweet ids, **most recent first**, taken from tweets posted by \`userId\` themself or by anyone \`userId\` currently follows.
- \`follow(followerId, followeeId)\` makes \`followerId\` follow \`followeeId\` (following someone twice has no extra effect).
- \`unfollow(followerId, followeeId)\` makes \`followerId\` stop following \`followeeId\`; it does nothing if they weren't following.

A user never follows or unfollows themself. A user with no visible tweets gets an empty feed.

Tests use the operation-list format; constructor and void methods output \`None\`.`,
    examples: [
      { input: "[\"Twitter\", \"postTweet\", \"postTweet\", \"follow\", \"getNewsFeed\", \"unfollow\", \"getNewsFeed\"]\n[[], [1, 11], [2, 22], [1, 2], [1], [1, 2], [1]]", output: "[None, None, None, None, [22, 11], None, [11]]" },
      { input: "[\"Twitter\", \"getNewsFeed\"]\n[[], [3]]", output: "[None, []]" },
    ],
    constraints: ["1 <= userId, followerId, followeeId <= 500", "0 <= tweetId <= 10^4", "All tweet ids are unique.", "At most 3 * 10^4 calls in total."],
    signature: `class Twitter:

    def __init__(self):

    def postTweet(self, userId: int, tweetId: int) -> None:

    def getNewsFeed(self, userId: int) -> List[int]:

    def follow(self, followerId: int, followeeId: int) -> None:

    def unfollow(self, followerId: int, followeeId: int) -> None:`,
    method: "Twitter",
    driver: `def run(ns, args):
    return replay(ns, args[0], args[1])
`,
    tests: [
      { id: "ex1", input: "[[\"Twitter\", \"postTweet\", \"postTweet\", \"follow\", \"getNewsFeed\", \"unfollow\", \"getNewsFeed\"], [[], [1, 11], [2, 22], [1, 2], [1], [1, 2], [1]]]", expected: "[None, None, None, None, [22, 11], None, [11]]", visible: true },
      { id: "ex2", input: "[[\"Twitter\", \"getNewsFeed\"], [[], [3]]]", expected: "[None, []]", visible: true },
      { id: "cap10", input: "[[\"Twitter\"] + [\"postTweet\"] * 12 + [\"getNewsFeed\"], [[]] + [[1, 100 + i] for i in range(12)] + [[1]]]", expected: "[None, None, None, None, None, None, None, None, None, None, None, None, None, [111, 110, 109, 108, 107, 106, 105, 104, 103, 102]]", visible: false },
      { id: "time-not-id", input: "[[\"Twitter\", \"postTweet\", \"postTweet\", \"postTweet\", \"follow\", \"getNewsFeed\"], [[], [2, 5], [1, 9], [2, 1], [1, 2], [1]]]", expected: "[None, None, None, None, None, [1, 9, 5]]", visible: false },
      { id: "unfollow-noop", input: "[[\"Twitter\", \"postTweet\", \"unfollow\", \"getNewsFeed\", \"getNewsFeed\"], [[], [4, 40], [4, 7], [4], [7]]]", expected: "[None, None, None, [40], []]", visible: false },
      { id: "follow-twice", input: "[[\"Twitter\", \"postTweet\", \"follow\", \"follow\", \"unfollow\", \"getNewsFeed\"], [[], [2, 3], [1, 2], [1, 2], [1, 2], [1]]]", expected: "[None, None, None, None, None, []]", visible: false },
      { id: "one-way", input: "[[\"Twitter\", \"postTweet\", \"postTweet\", \"follow\", \"getNewsFeed\", \"getNewsFeed\"], [[], [1, 10], [2, 20], [1, 2], [1], [2]]]", expected: "[None, None, None, None, [20, 10], [20]]", visible: false },
      { id: "merge", input: "[[\"Twitter\", \"postTweet\", \"postTweet\", \"postTweet\", \"postTweet\", \"postTweet\", \"postTweet\", \"follow\", \"follow\", \"getNewsFeed\"], [[], [1, 1], [2, 2], [3, 3], [1, 4], [2, 5], [3, 6], [1, 2], [1, 3], [1]]]", expected: "[None, None, None, None, None, None, None, None, None, [6, 5, 4, 3, 2, 1]]", visible: false },
      { id: "big", input: "[[\"Twitter\"] + [\"follow\"] * 49 + [\"postTweet\"] * 1000 + [\"getNewsFeed\"], [[]] + [[1, u] for u in range(2, 51)] + [[1 + i % 50, i] for i in range(1000)] + [[1]]]", expected: "[None] * 1050 + [list(range(999, 989, -1))]", visible: false },
    ],
    solution: `class Twitter:

    def __init__(self):
        self.time = 0
        self.tweets = defaultdict(list)    # userId -> [(time, tweetId)]
        self.following = defaultdict(set)  # userId -> followees

    def postTweet(self, userId: int, tweetId: int) -> None:
        self.time += 1
        self.tweets[userId].append((self.time, tweetId))

    def getNewsFeed(self, userId: int) -> List[int]:
        heap = []
        for u in self.following[userId] | {userId}:
            if self.tweets[u]:
                i = len(self.tweets[u]) - 1
                t, tid = self.tweets[u][i]
                heap.append((-t, tid, u, i))
        heapq.heapify(heap)
        feed = []
        while heap and len(feed) < 10:
            _, tid, u, i = heapq.heappop(heap)
            feed.append(tid)
            if i > 0:
                t, nxt = self.tweets[u][i - 1]
                heapq.heappush(heap, (-t, nxt, u, i - 1))
        return feed

    def follow(self, followerId: int, followeeId: int) -> None:
        self.following[followerId].add(followeeId)

    def unfollow(self, followerId: int, followeeId: int) -> None:
        self.following[followerId].discard(followeeId)`,
    hints: ["Store each user's tweets in posting order with a global timestamp, and each user's followees in a set.", "The feed is a k-way merge: each relevant user's tweet list is already sorted by time.", "Seed a max-heap (by timestamp) with each user's latest tweet; pop up to 10 times, pushing that user's previous tweet after each pop."],
    clarify: [
      { question: "Is 'most recent' by tweet id or by posting time?", answer: "By posting time; ids are arbitrary." },
      { question: "What if someone unfollows a user they don't follow?", answer: "Nothing happens." },
    ],
  },
  {
    lc: 295,
    kind: "class_design",
    statement: `Design a structure that receives integers one at a time and can report the **median** of everything received so far.

- The median of a sorted list with an odd count is its middle element; with an even count it is the average of the two middle elements.
- \`MedianFinder()\` starts empty.
- \`addNum(num)\` adds the integer \`num\`.
- \`findMedian()\` returns the current median as a float. It is only called after at least one number has been added.

Tests use the operation-list format; constructor and \`addNum\` output \`None\`. Medians are compared after rounding to 5 decimal places.`,
    examples: [
      { input: "[\"MedianFinder\", \"addNum\", \"addNum\", \"findMedian\", \"addNum\", \"findMedian\"]\n[[], [4], [10], [], [1], []]", output: "[None, None, None, 7.0, None, 4.0]", explanation: "4 and 10 average to 7; then 1, 4, 10 has middle 4." },
      { input: "[\"MedianFinder\", \"addNum\", \"findMedian\"]\n[[], [-3], []]", output: "[None, None, -3.0]" },
    ],
    constraints: ["-10^5 <= num <= 10^5", "findMedian is only called when at least one number has been added.", "At most 5 * 10^4 calls in total.", "Follow-up: what if all numbers are in [0, 100]? What if 99% of them are?"],
    signature: `class MedianFinder:

    def __init__(self):

    def addNum(self, num: int) -> None:

    def findMedian(self) -> float:`,
    method: "MedianFinder",
    driver: `def run(ns, args):
    out = replay(ns, args[0], args[1])
    return [round(x, 5) if isinstance(x, float) else x for x in out]
`,
    tests: [
      { id: "ex1", input: "[[\"MedianFinder\", \"addNum\", \"addNum\", \"findMedian\", \"addNum\", \"findMedian\"], [[], [4], [10], [], [1], []]]", expected: "[None, None, None, 7.0, None, 4.0]", visible: true },
      { id: "ex2", input: "[[\"MedianFinder\", \"addNum\", \"findMedian\"], [[], [-3], []]]", expected: "[None, None, -3.0]", visible: true },
      { id: "half", input: "[[\"MedianFinder\", \"addNum\", \"addNum\", \"findMedian\"], [[], [1], [2], []]]", expected: "[None, None, None, 1.5]", visible: false },
      { id: "dups", input: "[[\"MedianFinder\", \"addNum\", \"addNum\", \"addNum\", \"findMedian\", \"addNum\", \"findMedian\"], [[], [5], [5], [5], [], [5], []]]", expected: "[None, None, None, None, 5.0, None, 5.0]", visible: false },
      { id: "descending", input: "[[\"MedianFinder\", \"addNum\", \"findMedian\", \"addNum\", \"findMedian\", \"addNum\", \"findMedian\", \"addNum\", \"findMedian\"], [[], [9], [], [7], [], [5], [], [3], []]]", expected: "[None, None, 9.0, None, 8.0, None, 7.0, None, 6.0]", visible: false },
      { id: "neg-mix", input: "[[\"MedianFinder\", \"addNum\", \"addNum\", \"addNum\", \"addNum\", \"findMedian\"], [[], [-100000], [100000], [0], [-1], []]]", expected: "[None, None, None, None, None, -0.5]", visible: false },
      { id: "zigzag", input: "[[\"MedianFinder\", \"addNum\", \"addNum\", \"addNum\", \"addNum\", \"addNum\", \"findMedian\"], [[], [1], [100], [2], [99], [3], []]]", expected: "[None, None, None, None, None, None, 3.0]", visible: false },
      { id: "big", input: "[[\"MedianFinder\"] + [\"addNum\", \"findMedian\"] * 1000, [[]] + [p for i in range(1000) for p in ([i], [])]]", expected: "[None] + [x for i in range(1000) for x in (None, i / 2)]", visible: false },
    ],
    solution: `class MedianFinder:

    def __init__(self):
        self.low = []   # max-heap (negated) for the smaller half
        self.high = []  # min-heap for the larger half

    def addNum(self, num: int) -> None:
        heapq.heappush(self.low, -num)
        heapq.heappush(self.high, -heapq.heappop(self.low))
        if len(self.high) > len(self.low):
            heapq.heappush(self.low, -heapq.heappop(self.high))

    def findMedian(self) -> float:
        if len(self.low) > len(self.high):
            return float(-self.low[0])
        return (-self.low[0] + self.high[0]) / 2`,
    hints: ["Keeping a sorted list costs O(n) per insert; you only ever need the middle.", "Split the numbers into a lower half (max-heap) and an upper half (min-heap) whose sizes differ by at most one.", "Route each new number through one heap into the other to keep every low value <= every high value, then rebalance sizes."],
    clarify: [
      { question: "Should findMedian return an int or a float?", answer: "A float, e.g. 7.0 or 2.5." },
      { question: "Can findMedian be called on an empty structure?", answer: "No, at least one number is always present." },
    ],
  },
];
