import type { Extras } from "./types";

export const extras: Extras = {
  703: {
    time: { o: "O(n log n) init, O(log k) per add", why: "`heapify` is O(n), but popping down to k items costs up to O(n log n) (n = len(nums)). Each `add` does ==one push and at most one pop== on a heap of size k + 1." },
    space: { o: "O(k)", why: "After init, `self.heap` never holds more than k + 1 numbers." },
    pitfalls: [
      "Using a max-heap: the k-th largest is the smallest of the top k, so you need a min-heap whose root is that value.",
      "Assuming `nums` has at least k items: here `nums` can be empty or have k − 1 items, so the heap is short at first; the first `add` fills it, and the `if len > k` check handles the rest.",
      "Pushing then returning `heap[0]` without trimming to k: the root becomes the overall minimum, not the k-th largest.",
      "Heapifying `nums` directly mutates the caller's list; copying with `nums[:]` avoids surprises.",
    ],
  },
  1046: {
    time: { o: "O(n log n)", why: "Each round removes at least one stone, so there are ==at most n − 1 rounds==, each with two pops and maybe one push at O(log n) (n = len(stones))." },
    space: { o: "O(n)", why: "The negated copy `heap` holds every stone." },
    pitfalls: [
      "Forgetting to negate on the way in or out: `heapq` is a min-heap, so you smash the two lightest stones instead.",
      "Pushing back `first - second` when they're equal: a 0-weight stone is wrong; only push when `first > second`.",
      "Returning `heap[0]` without flipping the sign, or crashing on an empty heap; return 0 when nothing is left.",
      "Getting the subtraction order wrong after negation: pop `first` (heaviest) before `second`, then push `-(first - second)`.",
    ],
  },
  973: {
    time: { o: "O(n log k)", why: "Each of the n points gets one push and maybe one pop on a heap of ==at most k + 1 items== (n = len(points))." },
    space: { o: "O(k)", why: "The heap never holds more than k + 1 tuples." },
    pitfalls: [
      "Using a min-heap of distances with size k: you'd evict the closest point. Keep the farthest at the root by pushing the negative distance.",
      "Taking `sqrt` for the distance: it's slower and can introduce float noise; squared distance ranks points the same way.",
      "Pushing just `(dist, point_list)`: if two distances tie, Python compares the lists; push plain numbers like `(-d, x, y)` so ties compare cleanly.",
    ],
  },
  215: {
    time: { o: "O(n log k)", why: "Each of the n numbers is pushed once and popped at most once on a heap ==capped at k + 1== (n = len(nums))." },
    space: { o: "O(k)", why: "Only the k largest values seen so far (plus one) live in `heap`." },
    pitfalls: [
      "Sorting the whole list works in O(n log n), but the interviewer usually wants to hear the O(n log k) heap or average O(n) quickselect.",
      "Using a max-heap and popping k times: correct, but it builds a heap of all n items, so it's O(n + k log n) time and O(n) space.",
      "Treating 'k-th largest' as 'k-th distinct': duplicates count separately, so `[3, 3, 2]` with k = 2 is 3, not 2.",
      "Quickselect without a random pivot degrades to O(n²) on sorted input; mention randomisation if you go that route.",
    ],
  },
  621: {
    time: { o: "O(t)", why: "The loop runs once per time slot t (tasks plus idles), and every heap operation is on ==at most 26 labels==, so it's O(log 26) = O(1)." },
    space: { o: "O(1)", why: "`heap` and `q` together hold at most 26 entries, one per letter." },
    pitfalls: [
      "Checking the cooldown queue before running a task in the same tick: a task can come back one slot early and break the n-gap rule.",
      "Forgetting the counts are negative: `cnt = 1 + heappop(heap)` moves toward 0; using `- 1` grows the count forever.",
      "Not counting idle ticks when the heap is empty but `q` isn't: the loop must keep advancing `time` until both are empty.",
      "The formula `max(len(tasks), (maxCount - 1) * (n + 1) + numMax)` is O(n) and simpler; if you use it, explain why it's a lower bound that is always reachable.",
    ],
  },
  355: {
    time: { o: "O(f + 10 log f) per feed", why: "Seeding the heap with each followee's newest post and heapifying is O(f), then ==at most 10 pops and pushes== on a heap of size ≤ f (f = followees + 1). `postTweet`, `follow` and `unfollow` are O(1)." },
    space: { o: "O(U + P)", why: "Every post is stored once in `tweets` and every follow edge once in `following` (U = users plus follow edges, P = posts); a feed call adds an O(f) heap." },
    pitfalls: [
      "Forgetting the user's own tweets in the feed: merge `following[userId] | {userId}`.",
      "Letting a user follow themself and then also adding them again: harmless with a set, but `unfollow(u, u)` could then hide their own posts; block self-follows.",
      "Using `remove` instead of `discard` in `unfollow`: it raises if the user wasn't being followed.",
      "Collecting every followee's posts and sorting them: correct but O(P log P) per call; the heap only touches the 10 you return.",
    ],
  },
  295: {
    time: { o: "O(log n) add, O(1) median", why: "`addNum` does ==a constant number of pushes and pops== on heaps of size about n/2; `findMedian` only reads the two roots (n = numbers added)." },
    space: { o: "O(n)", why: "Every number added is stored in exactly one of `small` or `large`." },
    pitfalls: [
      "Only balancing sizes and not order: without the cross-check, a big number can sit in `small` and the roots stop being the middle.",
      "Mixing up the sign on `small`: it stores negatives, so its max is `-small[0]` and you must negate again when moving values across.",
      "Integer division for the even case: return `(a + b) / 2` as a float, not `//`.",
      "Keeping one sorted list with `insort`: O(n) per insert because of shifting; fine to mention, but two heaps is the expected answer.",
    ],
  },
};
