import type { Extras } from "./types";

export const extras: Extras = {
  125: {
    time: { o: "O(n)", why: "Each pointer only moves inward, so together `l` and `r` visit each character ==at most once== (n = len(s))." },
    space: { o: "O(1)", why: "Only two indices; non-alphanumerics are skipped in place instead of building a cleaned copy." },
    pitfalls: [
      "Leaving out `l < r` in the inner skip loops: on a string of only punctuation the pointers run past each other and go out of range.",
      "Comparing without `.lower()`: `'A'` and `'a'` must count as equal.",
      "Building `cleaned = ''.join(...)` and reversing it is correct but costs O(n) space; interviewers often ask for the O(1) version.",
    ],
  },
  167: {
    time: { o: "O(n)", why: "Every step moves either `l` right or `r` left, so the loop runs ==at most n − 1 times== (n = len(numbers))." },
    space: { o: "O(1)", why: "Only the two pointers and the current sum." },
    pitfalls: [
      "Returning 0-based indices: this problem wants `[l + 1, r + 1]`.",
      "Using a hash map like the original Two Sum: it works but uses O(n) space, which this version explicitly forbids.",
      "Moving the wrong pointer: if the sum is too small, only increasing `l` can grow it, since the array is sorted ascending.",
    ],
  },
  15: {
    time: { o: "O(n²)", why: "The sort is O(n log n), then for each anchor `i` the two pointers sweep the rest once, giving ==n passes of O(n)== (n = len(nums))." },
    space: { o: "O(1) extra", why: "Only pointers besides the output; Python's sort itself may use up to O(n) auxiliary memory." },
    pitfalls: [
      "Skipping duplicate anchors with `nums[i] == nums[i + 1]`: that drops valid triples like `[-1, -1, 2]`; compare with the previous value, `nums[i - 1]`.",
      "Forgetting to skip duplicate `l` values after a match: you append the same triple several times.",
      "Not moving the pointers after appending a match: the inner loop never ends.",
      "Using a set of tuples to dedupe instead of sorting carefully: it works, but explain the extra space and why the skip logic is cleaner.",
    ],
  },
  11: {
    time: { o: "O(n)", why: "Each iteration moves one pointer inward, so there are ==at most n − 1 steps== (n = len(height))." },
    space: { o: "O(1)", why: "Just `l`, `r` and `best`." },
    pitfalls: [
      "Moving the taller wall: the width shrinks and the height is still capped by the shorter wall, so the area can never improve. Always move the shorter one.",
      "Using the taller wall in the area formula: water level is `min(height[l], height[r])`.",
      "Checking every pair with two loops is O(n²) and times out at n = 10^5.",
    ],
  },
  42: {
    time: { o: "O(n)", why: "One inward sweep: every step advances `l` or `r` once (n = len(height))." },
    space: { o: "O(1)", why: "Just the two pointers and ==two running maxima==, instead of full left-max and right-max arrays." },
    pitfalls: [
      "Updating `left_max` after adding water instead of before: `left_max - height[l]` can go negative and subtract from the total.",
      "Moving the side with the larger max: the water on a side is only safe to count when that side's max is the smaller one, because the other side is guaranteed to be at least as tall.",
      "Forgetting that the edge bars hold no water: start the maxima at the edges and move the pointer first, as the code does.",
      "The prefix/suffix max arrays version is easier to explain but O(n) space; mention it, then optimise.",
    ],
  },
};
