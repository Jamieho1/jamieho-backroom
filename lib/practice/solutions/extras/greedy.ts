import type { Extras } from "./types";

export const extras: Extras = {
  53: {
    time: { o: "O(n)", why: "A ==single pass== over `nums` with constant work per element (n = len(nums))." },
    space: { o: "O(1)", why: "Only the running sum `cur` and the answer `best`." },
    pitfalls: [
      "Starting `best = 0`: on an all-negative array like `[-3, -1]` you return 0, but the subarray must be non-empty. Start from `nums[0]` (or `-inf`).",
      "Resetting `cur` after adding instead of before: drop the prefix only when it is already negative, then add the current number.",
      "Trying every start and end pair is O(n²) and times out at n = 10^5; say why a negative prefix can never help.",
    ],
  },
  55: {
    time: { o: "O(n)", why: "One backward pass; each index does ==one comparison against `goal`== (n = len(nums))." },
    space: { o: "O(1)", why: "Only the `goal` index." },
    pitfalls: [
      "Comparing with `>` instead of `>=`: if `i + nums[i]` lands exactly on `goal`, that index is good.",
      "Treating a 0 as an automatic failure: a 0 is only a trap if nothing before it can jump past it, which the goal check handles.",
      "Memoised DFS over every jump length is O(n · max jump) and slow; the greedy goal sweep is the expected answer.",
    ],
  },
  45: {
    time: { o: "O(n)", why: "The windows `[l, r]` never overlap, so the inner loop touches ==each index at most once== overall (n = len(nums))." },
    space: { o: "O(1)", why: "Just `l`, `r`, `farthest` and `jumps`." },
    pitfalls: [
      "Looping while `r < len(nums)` instead of `len(nums) - 1`: you count one extra jump once the window already covers the last index.",
      "Counting a jump at every index instead of once per window: that gives the number of steps walked, not the fewest jumps.",
      "A single-element array needs 0 jumps; the `while` condition already handles it, so don't add a special case that returns 1.",
    ],
  },
  134: {
    time: { o: "O(n)", why: "The two `sum` calls plus ==one pass with a running tank== (n = len(gas))." },
    space: { o: "O(1)", why: "Only `tank` and `start`." },
    pitfalls: [
      "Simulating a full loop from every start is O(n²) and times out at n = 10^5.",
      "Skipping the `sum(gas) < sum(cost)` check: the single pass can then return a `start` that never actually completes the loop.",
      "Setting `start = i` instead of `i + 1` after the tank goes negative: station `i` itself is one of the failed starts.",
      "Worrying about wrap-around in the pass: once total gas is enough, the surviving `start` is guaranteed to cover the stations before it.",
    ],
  },
  846: {
    time: { o: "O(n log n)", why: "==Sorting the distinct values== dominates; each step of the inner loop removes `c` cards, so it runs at most n times overall (n = len(hand))." },
    space: { o: "O(n)", why: "The `Counter` and the sorted list of distinct keys." },
    pitfalls: [
      "Missing the `len(hand) % groupSize` check: it is a cheap early exit and catches hands that can never split evenly.",
      "Not skipping values whose count already dropped to 0: you would try to start a run from a card that has been used up.",
      "Taking one group at a time with a min-heap works, but removing from the middle of the heap is easy to get wrong; subtracting the whole count `c` at once is simpler.",
      "Assuming values are small and using an array indexed by value: `hand[i]` goes up to 10^9, so use a hash map.",
    ],
  },
  1899: {
    time: { o: "O(n)", why: "One pass over the triplets with ==3 fixed checks each== (n = len(triplets))." },
    space: { o: "O(1)", why: "The `good` set holds at most 3 slot indices." },
    pitfalls: [
      "Merging every triplet without filtering: one triplet with a slot above the target pushes that slot past it forever, since merge only takes maxes.",
      "Requiring a single triplet to equal the target: different safe triplets can each supply a different slot.",
      "Recording a match from a triplet you should have skipped: do the overshoot check first, then collect matching slots.",
    ],
  },
  763: {
    time: { o: "O(n)", why: "One pass to build `last`, then ==one pass to cut pieces== (n = len(s))." },
    space: { o: "O(1)", why: "`last` holds at most 26 letters; the output list is not counted." },
    pitfalls: [
      "Cutting when you see a letter's last index instead of when `i == end`: an earlier letter in the same piece may still appear later.",
      "Forgetting to reset `size` after a cut: every later piece size comes out too big.",
      "Returning the pieces or their end indices instead of their sizes: the problem asks for lengths.",
    ],
  },
  678: {
    time: { o: "O(n)", why: "One pass with ==constant updates to `lo` and `hi`== per character (n = len(s))." },
    space: { o: "O(1)", why: "Only the two counters." },
    pitfalls: [
      "Forgetting to clamp `lo` at 0: a negative minimum would mean using `*` as a `)` with nothing to close, which isn't a real option.",
      "Returning `hi >= 0` or `lo <= 0 <= hi` only at the end: you must return `False` as soon as `hi < 0`, because a `)` with no possible opener can't be fixed by later characters.",
      "Branching on each `*` with plain recursion is O(3^n); either memoise on (index, open count) or use the min/max range.",
      "A single stack of `(` positions isn't enough: keep a second stack for `*` positions, or use the range trick.",
    ],
  },
};
